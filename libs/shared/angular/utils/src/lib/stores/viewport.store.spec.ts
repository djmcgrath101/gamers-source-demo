import { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { Mock } from 'vitest';
import { PlatformService } from '../services/platform.service';
import { ActiveBreakpoint, ViewportStore } from './viewport.store';

describe('ViewportStore', () => {
  let isBrowser = true;

  const setup = (providers: Provider[] = []) => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(PlatformService, { isBrowser: vitest.fn(() => isBrowser) }, 'useValue'),
        ...providers
      ]
    });

    return TestBed.inject(ViewportStore);
  };

  beforeAll(() => {
    // rAF shim
    (global as any).requestAnimationFrame = mockRaf;
    (global as any).cancelAnimationFrame = mockCancelRaf;
  });

  afterAll(() => {
    delete (global as any).requestAnimationFrame;
    delete (global as any).cancelAnimationFrame;
  });

  describe('SSR mode', () => {
    beforeEach(() => {
      isBrowser = false;
      uninstallRO();
      uninstallVisualViewport();
      setViewport(0, 0);
    });

    it('starts with 0x0 and activeBreakpoint "base"', () => {
      const store = setup();
      expect(store.width()).toBe(0);
      expect(store.height()).toBe(0);
      expect(store.activeBreakpoint()).toBe('base');
      expect(store.isBase()).toBe(true);
    });
  });

  describe('Browser mode (no ResizeObserver, no visualViewport)', () => {
    beforeEach(() => {
      isBrowser = true;
      uninstallRO();
      uninstallVisualViewport();
      setViewport(500, 300);
    });

    it('performs initial read on start', () => {
      const store = setup();
      // start() is called in onInit hook during injection
      expect(store.width()).toBe(500);
      expect(store.height()).toBe(300);
      expect(store.activeBreakpoint()).toBe('base'); // 500 < sm(640)
      expect(store.isSm()).toBe(false);
      expect(store.isMd()).toBe(false);
      expect(store.isLg()).toBe(false);
      expect(store.isXl()).toBe(false);
      expect(store.is2xl()).toBe(false);
    });

    it('updates on window resize with rAF coalescing', () => {
      const store = setup();
      setViewport(640, 400);
      dispatchResize();
      // coalesced; nothing yet
      expect(store.width()).toBe(500);
      // flush rAF
      flushRaf();
      expect(store.width()).toBe(640);
      expect(store.activeBreakpoint()).toBe('sm');
      expect(store.isSm()).toBe(true);
      expect(store.isMd()).toBe(false);
    });

    it('computes correct activeBreakpoint across thresholds', () => {
      const store = setup();
      const steps: Array<[number, ActiveBreakpoint]> = [
        [639, 'base'],
        [640, 'sm'],
        [767, 'sm'],
        [768, 'md'],
        [1023, 'md'],
        [1024, 'lg'],
        [1279, 'lg'],
        [1280, 'xl'],
        [1535, 'xl'],
        [1536, '2xl']
      ];
      for (const [w, expected] of steps) {
        setViewport(w, 800);
        dispatchResize();
        flushRaf();
        expect(store.activeBreakpoint()).toBe(expected);
      }
    });

    it('stops listening after stop()', () => {
      const store = setup();
      // Verify current
      expect(store.width()).toBe(500);
      store.stop();

      setViewport(1200, 900);
      dispatchResize();
      flushRaf();

      // No update after stop
      expect(store.width()).toBe(500);
      expect(store.height()).toBe(300);
    });
  });

  describe('Browser mode with visualViewport', () => {
    beforeEach(() => {
      isBrowser = true;
      uninstallRO();
      installVisualViewport();
      setViewport(700, 900);
    });

    afterEach(() => {
      uninstallVisualViewport();
    });

    it('reacts to visualViewport resize events', () => {
      const store = setup();
      expect(store.width()).toBe(700);
      // Simulate vv resize (e.g., mobile URL bar change)
      setViewport(710, 910);
      triggerVisualViewportResize();
      flushRaf();
      expect(store.width()).toBe(710);
    });
  });

  describe('Browser mode with ResizeObserver', () => {
    beforeEach(() => {
      isBrowser = true;
      installRO();
      uninstallVisualViewport();
      setViewport(800, 600);
    });

    afterEach(() => {
      uninstallRO();
    });

    it('reacts to ResizeObserver callback', () => {
      const store = setup();
      expect(store.width()).toBe(800);
      setViewport(900, 600);
      triggerRO(); // simulate RO firing
      flushRaf();
      expect(store.width()).toBe(900);
      expect(store.activeBreakpoint()).toBe('md'); // 900 >= 768 < 1024
    });

    it('disconnects RO and removes listeners on stop()', () => {
      const store = setup();
      store.stop();
      expect(roInstance?.disconnect).toHaveBeenCalled();
      const before = store.width();
      setViewport(950, 600);
      triggerRO();
      dispatchResize();
      flushRaf();
      expect(store.width()).toBe(before); // no updates after stop
    });
  });
});

// Helpers
const setViewport = (w: number, h: number) => {
  Object.defineProperty(window, 'innerWidth', { value: w, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: h, configurable: true });
};

const dispatchResize = () => {
  window.dispatchEvent(new Event('resize'));
};

// Simple rAF shim (coalesce via macro task)
const rafs: Array<FrameRequestCallback> = [];
const mockRaf = (cb: FrameRequestCallback): number => {
  rafs.push(cb);
  // Return an id; index-based id is fine for tests
  return rafs.length;
};
const mockCancelRaf = () => {
  // no-op (we coalesce by not flushing cancelled frames)
};
const flushRaf = () => {
  const cbs = rafs.splice(0, rafs.length);
  cbs.forEach(cb => cb(performance.now()));
};

// Optional mock visualViewport
const installVisualViewport = () => {
  (window as any).visualViewport = {
    addEventListener: (type: string, handler: any) => {
      // no-op; we'll trigger manually
      (window as any).__vvHandler = handler;
    },
    removeEventListener: () => {}
  };
};
const triggerVisualViewportResize = () => {
  const handler = (window as any).__vvHandler;
  if (handler) handler(new Event('resize'));
};
const uninstallVisualViewport = () => {
  delete (window as any).visualViewport;
  delete (window as any).__vvHandler;
};

// Mock ResizeObserver
let roInstance: { disconnect: Mock; _cb?: ResizeObserverCallback } | null = null;
let roConnected = true;

class RO_Mock {
  _cb: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this._cb = cb;
    roInstance = { disconnect: vitest.fn(), _cb: cb };
  }
  observe = vitest.fn();
  disconnect = vitest.fn(() => {
    if (roInstance) roInstance.disconnect();
    roConnected = false;
  });
}

const installRO = () => {
  (window as any).ResizeObserver = RO_Mock as any;
};
const uninstallRO = () => {
  delete (window as any).ResizeObserver;
  roInstance = null;
};
const triggerRO = () => {
  if (roConnected) roInstance?._cb?.([], {} as any);
};
