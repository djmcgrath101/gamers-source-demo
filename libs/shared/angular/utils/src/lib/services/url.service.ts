import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import type { HttpProtocol } from '@gamers-source/shared-types';
import { isString } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class UrlService {
  readonly #document = inject(DOCUMENT);
  readonly #router = inject(Router);

  readonly hostname = this.#document.location.hostname;
  readonly port = this.#document.location.port;
  readonly portSegment = this.port ? `:${this.port}` : '';
  readonly protocol = this.#document.location.protocol as HttpProtocol;

  readonly #origin = `${this.protocol}//${this.hostname}${this.portSegment}`;

  /**
   * Builds an absolute URL from either a route string or Angular router link parameters.
   */
  buildUrl(route: string): URL;
  buildUrl(linkParams: Array<string>, extras?: NavigationExtras): URL;
  buildUrl(routeOrLinkParams: string | Array<string>, extras?: NavigationExtras): URL {
    const route = isString(routeOrLinkParams)
      ? routeOrLinkParams
      : this.#router.serializeUrl(this.#router.createUrlTree(routeOrLinkParams, extras));

    return new URL(route, `${this.#origin}/`);
  }

  /**
   * Returns true when the provided URL is absolute and matches the current document origin.
   */
  isFullUrl(url: string | URL): boolean {
    const normalizedUrl = isString(url) ? this.#parseUrl(url) : url;

    return normalizedUrl?.origin === this.#origin;
  }

  /**
   * Parses absolute URL strings while treating relative or malformed strings as non-matches.
   */
  #parseUrl(url: string): URL | null {
    try {
      return new URL(url);
    } catch {
      // Relative or malformed strings are not full URLs for same-origin checks.
      return null;
    }
  }
}
