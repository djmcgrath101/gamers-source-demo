import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import {
  computed,
  inject,
  Injectable,
  InjectionToken,
  PLATFORM_ID,
  Signal,
  signal
} from '@angular/core';

/**
 * Injection token that can be used to provide the user-agent string
 * of the current platform when running on the server using SSR.
 * Defaults to an empty string.
 */
export const PLATFORM_USER_AGENT = new InjectionToken<string>('PLATFORM_USER_AGENT', {
  providedIn: 'root',
  factory: () => ''
});

/**
 * Service that provides information about the current platform (browser or server)
 * that app runs on and details about the user agent.  On the browser platform, the
 * user agent is taken from the `navigator.userAgent` property. On the server platform,
 * the user agent should be provided using the `PLATFORM_USER_AGENT` injection token.
 * See comments for the providePlatformUserAgent function for instructions
 * on how to set this up for server-side rendering (SSR) applications.
 *
 * Example usage:
 *
 * ```typescript
 * import { Component } from '@angular/core';
 * import { PlatformService } from '@angular/utils';
 *
 * @Component({ ... })
 * export class MyComponent {
 *   constructor(platformService: PlatformService) {
 *     if (platformService.isBrowser) {
 *       // This code will only run in the browser
 *     }
 *
 *     if (platformService.isIOS) {
 *       // This code will only run on iOS devices
 *     }
 *   }
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class PlatformService {
  readonly #platformId = inject(PLATFORM_ID);
  readonly #serverUserAgent = inject(PLATFORM_USER_AGENT);

  readonly isBrowser: Signal<boolean> = signal(isPlatformBrowser(this.#platformId));
  readonly isServer: Signal<boolean> = signal(isPlatformServer(this.#platformId));

  /**
   * The user-agent string for the current platform, in lower case.
   */
  readonly userAgent = signal(
    this.isServer()
      ? this.#serverUserAgent.toLowerCase()
      : typeof navigator !== 'undefined'
      ? navigator.userAgent.toLowerCase()
      : ''
  );

  /**
   * Whether the current user agent is Android.
   */
  readonly isAndroid = computed(() => {
    const ua = this.userAgent();

    return /android/.test(ua);
  });

  /**
   * Whether the current user agent is Chrome.
   */
  readonly isChrome = computed(() => {
    const ua = this.userAgent();

    return /chrome|chromium|crios/.test(ua) && !/edg/.test(ua);
  });

  /**
   * Whether the current user agent is running on a
   * desktop device, i.e. not mobile.
   */
  readonly isDesktop = computed(() => !this.isMobile());

  /**
   * Whether the current user agent is Microsoft Edge.
   */
  readonly isEdge = computed(() => {
    const ua = this.userAgent();

    return /edg/.test(ua);
  });

  /**
   * Whether the current user agent is Firefox.
   */
  readonly isFirefox = computed(() => {
    const ua = this.userAgent();

    return /firefox|fxios/.test(ua);
  });

  /**
   * Whether the current user agent is iOS.
   */
  readonly isIOS = computed(() => {
    const ua = this.userAgent();

    // Classic iOS tokens
    const traditionalIOS = /(iphone|ipad|ipod)/.test(ua);

    // iPadOS 13+: UA can say "Macintosh" but device is touch-capable
    // Guard navigator access and touch points
    const hasNavigator = typeof navigator !== 'undefined';
    const maxTouchPoints = hasNavigator ? navigator.maxTouchPoints ?? 0 : 0;

    const ipadOSQuirk = /macintosh/.test(ua) && /applewebkit/.test(ua) && maxTouchPoints > 1;

    return traditionalIOS || ipadOSQuirk;
  });

  /**
   * Whether the current user agent is running on a mobile device.
   * This is true for Android and iOS devices.
   */
  readonly isMobile = computed(() => this.isAndroid() || this.isIOS());

  /**
   * Whether the current user agent is Safari.
   * Note that this excludes Chrome, Edge, Opera and Android browsers.
   */
  readonly isSafari = computed(() => {
    const ua = this.userAgent();
    // Exclude Chrome variants, Edge, Opera and Android
    return /safari/.test(ua) && !/(chrome|chromium|crios|edg|android|opr|opios)/.test(ua);
  });

  /**
   * A label for the current platform, one of:
   * - 'server' for server-side rendering (SSR) platforms
   * - 'ios' for iOS devices
   * - 'android' for Android devices
   * - 'browser' for all other browser platforms
   */
  readonly platformLabel = computed(() => {
    if (this.isServer()) return 'server' as const;
    if (this.isIOS()) return 'ios' as const;
    if (this.isAndroid()) return 'android' as const;
    if (this.isBrowser()) return 'browser' as const;
    return 'browser' as const;
  });

  /**
   * Sets the user-agent string. This is useful for testing purposes.
   * @param ua The user-agent string to set.
   */
  setUserAgent(ua: string) {
    this.userAgent.set(ua.toLowerCase());
  }
}
