import {
  DestroyRef,
  EnvironmentProviders,
  inject,
  isDevMode,
  makeEnvironmentProviders,
  provideEnvironmentInitializer
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  type Event,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  Router
} from '@angular/router';
import { ConsoleTransport, Logger } from '@gamers-source/shared-utils';
import { Events } from '@ngrx/signals/events';

export function provideLogger(appCode: string): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: Logger,
      deps: [Events, DestroyRef],
      useFactory: (events: Events, destroyRef: DestroyRef) => {
        const router = inject(Router, { optional: true });
        const namespace = appCode.toLowerCase();
        const transport = new ConsoleTransport();
        const logger = new Logger(namespace, [transport]);

        subscribeToStoreEvents(logger, events, destroyRef);
        subscribeToRouterNavigation(logger, router, destroyRef);

        if (isDevMode()) {
          // Enable all console logging by default in dev mode
          transport.enableAll();
        }

        return logger;
      }
    },
    provideEnvironmentInitializer(() => {
      // Eagerly creates the root logger so global instrumentation
      // subscriptions are active before other app services use it.
      inject(Logger);
    })
  ]);
}

function logRouterNavigationEvent(logger: Logger, event: Event): void {
  if (event instanceof NavigationStart) {
    logger.info('NavigationStart', { id: event.id, url: event.url });
    return;
  }

  if (event instanceof NavigationEnd) {
    logger.info('NavigationEnd', {
      id: event.id,
      url: event.url,
      urlAfterRedirects: event.urlAfterRedirects
    });
    return;
  }

  if (event instanceof NavigationCancel) {
    logger.warn('NavigationCancel', {
      code: event.code,
      id: event.id,
      reason: event.reason,
      url: event.url
    });
    return;
  }

  if (event instanceof NavigationError) {
    logger.error('NavigationError', {
      error: event.error,
      id: event.id,
      url: event.url
    });
    return;
  }

  if (event instanceof NavigationSkipped) {
    logger.debug('NavigationSkipped', {
      code: event.code,
      id: event.id,
      reason: event.reason,
      url: event.url
    });
  }
}

function subscribeToRouterNavigation(
  logger: Logger,
  router: Router | null,
  destroyRef: DestroyRef
): void {
  if (!router) {
    return;
  }

  const navigationLogger = logger.extendScope('router-navigation');

  router.events
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe(event => logRouterNavigationEvent(navigationLogger, event));
}

function subscribeToStoreEvents(logger: Logger, events: Events, destroyRef: DestroyRef): void {
  const eventsLogger = logger.extendScope('store-events');

  // Logs the event type and payload whenever a signal store event is
  // dispatched, giving visibility into events across the application.
  events
    .on()
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe(event => {
      eventsLogger.info(`${event.type}`, event.payload);
    });
}
