import { computed, inject, InjectionToken, NgZone } from '@angular/core';
import type { Dimensions, MediaBreakpoint, MediaBreakpoints } from '@gamers-source/shared-types';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState
} from '@ngrx/signals';
import { PlatformService } from '../services/platform.service';

/** Default Tailwind CSS breakpoints.  These can
 * be overridden via the MEDIA_BREAKPOINTS injection token.
 */
export const DEFAULT_BREAKPOINTS: MediaBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};
/** Injection token to allow apps to override the breakpoint map. */
export const MEDIA_BREAKPOINTS = new InjectionToken<MediaBreakpoints>('MEDIA_BREAKPOINTS', {
  factory: () => DEFAULT_BREAKPOINTS
});
/** Order used to resolve the highest matched breakpoint. */
export const BREAKPOINTS_ORDER: ReadonlyArray<MediaBreakpoint> = ['sm', 'md', 'lg', 'xl', '2xl'];

export type ActiveBreakpoint =
  | MediaBreakpoint
  // Any size below sm
  | 'base';

/** Store state: current viewport dimensions in pixels. */
export type ViewportState = Dimensions;

export const initialViewportState: ViewportState = {
  height: 0,
  width: 0
};

/**
 * Reactive store for viewport information (width/height) plus derived state
 * like aspect ratio, orientation, and breakpoint matches.
 *
 * - Safe on SSR: does nothing when not in a browser.
 * - Event sources: window resize, ResizeObserver, VisualViewport.
 * - Coalesces frequent events via requestAnimationFrame.
 */
export const ViewportStore = signalStore(
  { providedIn: 'root' },
  withState(initialViewportState),
  withProps(() => ({
    // Overridable breakpoint map (via MEDIA_BREAKPOINTS token)
    breakpoints: inject(MEDIA_BREAKPOINTS),
    // Used to run DOM listeners outside Angular change detection
    _ngZone: inject(NgZone),
    // Guards against non-browser environments (SSR)
    _platformService: inject(PlatformService)
  })),
  withComputed(({ breakpoints, height, width }) => {
    // Compute min-width matches for each breakpoint
    const matches = () => ({
      sm: width() >= breakpoints.sm,
      md: width() >= breakpoints.md,
      lg: width() >= breakpoints.lg,
      xl: width() >= breakpoints.xl,
      '2xl': width() >= breakpoints['2xl']
    });

    // Highest matched min-width is the active breakpoint; otherwise 'base'
    const activeBreakpoint = (): ActiveBreakpoint => {
      for (let i = BREAKPOINTS_ORDER.length - 1; i >= 0; i--) {
        const k = BREAKPOINTS_ORDER[i];
        if (matches()[k]) return k;
      }
      return 'base';
    };

    return {
      activeBreakpoint,
      // Avoid divide-by-zero via Math.max(1, height())
      aspectRatio: computed(() => width() / Math.max(1, height())),
      isBase: computed(() => activeBreakpoint() === 'base'),
      isLg: computed(() => matches().lg),
      isMd: computed(() => matches().md),
      isSm: computed(() => matches().sm),
      isXl: computed(() => matches().xl),
      is2xl: computed(() => matches()['2xl']),
      matches,
      // Landscape if width >= height
      orientation: computed(() => (width() >= height() ? 'landscape' : 'portrait')),
      ready: computed(() => width() > 0 && height() > 0),
      // Convenience shape for consumers
      size: computed(() => ({ width: width(), height: height() }))
    };
  }),
  withMethods(store => {
    let stopFn: (() => void) | null = null;

    const readSize = () => {
      const width = window.innerWidth || 0;
      const height = window.innerHeight || 0;
      patchState(store, { width, height });
    };

    const start = () => {
      if (!store._platformService.isBrowser() || stopFn) return;

      // Coalesce rapid events with a single rAF callback
      let rafId = 0;
      const onChange = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(readSize);
      };

      const hasResizeObserver = typeof window?.ResizeObserver !== 'undefined';

      // AbortController lets us unregister listeners via signal on stop()
      let controller: AbortController | null = new AbortController();
      const { signal } = controller as AbortController;
      let resizeObserver: ResizeObserver | null = null;

      store._ngZone.runOutsideAngular(() => {
        // window resize
        window.addEventListener('resize', onChange, { signal });

        // ResizeObserver on <html> for layout changes that don't emit window resize
        if (hasResizeObserver) {
          resizeObserver = new ResizeObserver(onChange);
          resizeObserver.observe(document.documentElement);
        }

        // VisualViewport resize (e.g., mobile browser UI collapse/expand)
        const vv = window?.visualViewport as VisualViewport | undefined;
        if (vv?.addEventListener) {
          vv.addEventListener('resize', onChange, { signal });
        }
      });

      // Compose stop() to tear down listeners/observers
      stopFn = () => {
        controller?.abort();
        controller = null;
        resizeObserver?.disconnect();
        resizeObserver = null;
      };

      readSize(); // Initial read
    };

    const stop = () => {
      stopFn?.();
      stopFn = null;
    };

    return {
      /**
       * Start listening to viewport changes.
       * Has no effect when not in a browser context (SSR).
       * Safe to call multiple times.
       */
      start,
      /**
       * Stop listening to viewport changes.
       * Safe to call multiple times.
       */
      stop
    };
  }),
  withHooks(store => {
    return {
      onInit() {
        // Begin tracking when the store is first used (in browser)
        store.start();
      },

      onDestroy() {
        // Ensure listeners are removed when destroyed
        store.stop();
      }
    };
  })
);
