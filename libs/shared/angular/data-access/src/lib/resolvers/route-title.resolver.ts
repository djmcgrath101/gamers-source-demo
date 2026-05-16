import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { APP_CONFIG } from '../tokens/app-config.token';

/**
 * Generates a route title using the app name defined in the
 * app config and a route title defined in the route data.
 * The title will be in the format "<app-name> - <route-title>".
 * If no route title is present, only the app name is used.
 *
 * @example
 *
 * {
 *   path: 'test',
 *   data: { title: 'Test Route' },
 *   title: routeTitleResolver
 * }
 *
 * @param route - The snapshot of the route being resolved.
 * @returns The resolved route title.
 */
export const routeTitleResolver: ResolveFn<string> = route => {
  const appConfig = inject(APP_CONFIG);

  return [appConfig.name, route.data['title']].filter(Boolean).join(' - ');
};
