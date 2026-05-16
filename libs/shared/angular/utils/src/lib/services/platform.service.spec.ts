import { PLATFORM_ID } from '@angular/core';
import { PLATFORM_USER_AGENT, PlatformService } from './platform.service';

import { TestBed } from '@angular/core/testing';

function setup(providers: any[] = []) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [PlatformService, ...providers] });
  return TestBed.inject(PlatformService);
}

function setNavigatorUA(ua: string, maxTouchPoints?: number) {
  // Some jsdom props are read-only; redefine with configurable
  Object.defineProperty(global.navigator, 'userAgent', {
    value: ua,
    configurable: true
  });
  if (typeof maxTouchPoints !== 'undefined') {
    Object.defineProperty(global.navigator, 'maxTouchPoints', {
      value: maxTouchPoints,
      configurable: true
    });
  } else {
    // ensure absence if not specified
    if ('maxTouchPoints' in global.navigator) {
      // set to undefined (will coalesce to 0 in service)
      Object.defineProperty(global.navigator, 'maxTouchPoints', {
        value: undefined,
        configurable: true
      });
    }
  }
}

describe('PlatformService', () => {
  // Reset any navigator changes between tests
  afterEach(() => {
    // Restore to a benign default
    setNavigatorUA(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome jsdom'
    );
  });

  describe('in server', () => {
    it('uses PLATFORM_USER_AGENT and reports server label', () => {
      const ua =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
      const svc = setup([
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: PLATFORM_USER_AGENT, useValue: ua }
      ]);

      expect(svc.isServer()).toBe(true);
      expect(svc.isBrowser()).toBe(false);
      expect(svc.userAgent()).toBe(ua.toLowerCase());
      expect(svc.isIOS()).toBe(true);
      expect(svc.isMobile()).toBe(true);
      expect(svc.platformLabel()).toBe('server'); // server takes precedence
    });

    it('handles non-mobile UA on server', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
      const svc = setup([
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: PLATFORM_USER_AGENT, useValue: ua }
      ]);

      expect(svc.isAndroid()).toBe(false);
      expect(svc.isIOS()).toBe(false);
      expect(svc.isMobile()).toBe(false);
    });
  });

  describe('in browser', () => {
    beforeEach(() => {
      // A baseline UA for browser tests; individual tests override as needed
      setNavigatorUA(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      );
    });

    it('reads UA from navigator and reports browser label by default', () => {
      const svc = setup([{ provide: PLATFORM_ID, useValue: 'browser' }]);
      expect(svc.isBrowser()).toBe(true);
      expect(svc.isServer()).toBe(false);
      expect(svc.userAgent()).toMatch(/chrome/);
      expect(svc.platformLabel()).toBe('browser');
    });

    it('detects Android', () => {
      setNavigatorUA(
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'
      );
      const svc = setup([{ provide: PLATFORM_ID, useValue: 'browser' }]);

      expect(svc.isAndroid()).toBe(true);
      expect(svc.isMobile()).toBe(true);
      expect(svc.platformLabel()).toBe('android');
    });

    it('detects iPhone (iOS)', () => {
      setNavigatorUA(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
      );
      const svc = setup([{ provide: PLATFORM_ID, useValue: 'browser' }]);

      expect(svc.isIOS()).toBe(true);
      expect(svc.isMobile()).toBe(true);
      expect(svc.platformLabel()).toBe('ios');
    });

    it('detects iPadOS quirk (Macintosh + WebKit + touch)', () => {
      setNavigatorUA(
        // iPadOS Safari can present as Macintosh + AppleWebKit + Mobile (varies by version)
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/605.1.15',
        5 // maxTouchPoints > 1
      );
      const svc = setup([{ provide: PLATFORM_ID, useValue: 'browser' }]);

      expect(svc.isIOS()).toBe(true);
      expect(svc.isMobile()).toBe(true);
      expect(svc.platformLabel()).toBe('ios');
    });

    it('distinguishes Chrome vs Edge', () => {
      // Chrome (not Edge)
      setNavigatorUA(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      );
      let svc = setup([{ provide: PLATFORM_ID, useValue: 'browser' }]);
      expect(svc.isChrome()).toBe(true);
      expect(svc.isEdge()).toBe(false);

      // Edge
      setNavigatorUA(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0'
      );
      svc = setup([{ provide: PLATFORM_ID, useValue: 'browser' }]);
      expect(svc.isEdge()).toBe(true);
      expect(svc.isChrome()).toBe(false);
    });

    it('detects Safari and excludes Chrome/Edge/Android/Opera variants', () => {
      // Safari on macOS
      setNavigatorUA(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15'
      );
      let svc = setup([{ provide: PLATFORM_ID, useValue: 'browser' }]);
      expect(svc.isSafari()).toBe(true);

      // Not Safari: Chrome
      setNavigatorUA(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      );
      svc = setup([{ provide: PLATFORM_ID, useValue: 'browser' }]);
      expect(svc.isSafari()).toBe(false);

      // Not Safari: Edge
      setNavigatorUA(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0'
      );
      svc = setup([{ provide: PLATFORM_ID, useValue: 'browser' }]);
      expect(svc.isSafari()).toBe(false);

      // Not Safari: Opera desktop (OPR)
      setNavigatorUA(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 OPR/112.0.0.0'
      );
      svc = setup([{ provide: PLATFORM_ID, useValue: 'browser' }]);
      expect(svc.isSafari()).toBe(false);

      // Not Safari: Opera on iOS (OPiOS)
      setNavigatorUA(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) OPiOS/4.0.0 Mobile/15E148 Safari/9537.53'
      );
      svc = setup([{ provide: PLATFORM_ID, useValue: 'browser' }]);
      expect(svc.isSafari()).toBe(false);
    });

    it('reports desktop when not mobile', () => {
      setNavigatorUA(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15'
      );
      const svc = setup([{ provide: PLATFORM_ID, useValue: 'browser' }]);

      expect(svc.isMobile()).toBe(false);
      expect(svc.isDesktop()).toBe(true);
    });

    it('setUserAgent() overrides UA and recomputes flags', () => {
      // Start as desktop Chrome
      setNavigatorUA(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      );
      const svc = setup([{ provide: PLATFORM_ID, useValue: 'browser' }]);
      expect(svc.isAndroid()).toBe(false);
      expect(svc.isIOS()).toBe(false);
      expect(svc.platformLabel()).toBe('browser');

      // Override to Android UA
      svc.setUserAgent(
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'
      );
      expect(svc.isAndroid()).toBe(true);
      expect(svc.isMobile()).toBe(true);
      expect(svc.platformLabel()).toBe('android');
    });
  });
});
