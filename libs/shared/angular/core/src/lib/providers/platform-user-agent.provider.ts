import { isPlatformServer } from '@angular/common';
import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  PLATFORM_ID,
  REQUEST
} from '@angular/core';
import { PLATFORM_USER_AGENT } from '@gamers-source/shared-angular-utils';

/**
 * Provides the user-agent string from the request headers when
 * running on the server, or an empty string when running in the browser.
 * This is useful for libraries that need to know the user-agent
 * for server-side rendering (SSR) scenarios.
 *
 * This needs to be added as a provider in the providers array
 * of the app.config.server.ts file of the target SSR application.
 */
export function providePlatformUserAgent(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: PLATFORM_USER_AGENT,
      deps: [PLATFORM_ID, REQUEST],
      useFactory: (platformId: object, request: Request | null) =>
        isPlatformServer(platformId) ? (request?.headers?.get('user-agent') ?? '') : ''
    }
  ]);
}
