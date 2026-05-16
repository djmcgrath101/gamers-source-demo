vitest.mock('@angular/core', async () => {
  const actual = await vitest.importActual<typeof import('@angular/core')>('@angular/core');

  return {
    ...actual,
    isDevMode: vitest.fn()
  };
});

import * as angularCore from '@angular/core';
import { EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  type Event as RouterNavigationEvent,
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationSkippedCode,
  NavigationStart,
  Router
} from '@angular/router';
import { createMockAppConfig } from '@gamers-source/shared-angular-testing';
import { ConsoleTransport, LOG_LEVELS, Logger } from '@gamers-source/shared-utils';
import { Events } from '@ngrx/signals/events';
import { Subject } from 'rxjs';
import { Mock } from 'vitest';
import { provideLogger } from './logger.provider';

type MockEvents = {
  eventSubscription: { subscribe: Mock };
  on: Mock;
};

describe('provideLogger', () => {
  const mockAppConfig = createMockAppConfig();
  const isDevModeMock = angularCore.isDevMode as Mock<typeof angularCore.isDevMode>;

  it('provides logger instance with ConsoleTransport', () => {
    isDevModeMock.mockReturnValue(true);

    TestBed.configureTestingModule({ providers: [provideLogger(mockAppConfig.code)] });

    const logger = TestBed.inject(Logger);
    expect(logger.transports[0]).toBeInstanceOf(ConsoleTransport);
  });

  it('initializes the logger during environment initialization', () => {
    isDevModeMock.mockReturnValue(true);
    const mockEvents = createMockEvents();

    TestBed.configureTestingModule({
      providers: [provideLogger(mockAppConfig.code), { provide: Events, useValue: mockEvents }]
    });

    TestBed.inject(EnvironmentInjector);

    expect(mockEvents.on).toHaveBeenCalled();
  });

  it('enables all console logging in dev mode', () => {
    isDevModeMock.mockReturnValue(true);

    TestBed.configureTestingModule({ providers: [provideLogger(mockAppConfig.code)] });

    const logger = TestBed.inject(Logger);
    const consoleTransport = logger.transports[0] as ConsoleTransport;

    LOG_LEVELS.forEach(level => {
      expect(consoleTransport.isEnabled(mockAppConfig.code.toLowerCase(), level)).toBe(true);
    });
  });

  it('does not enable console logging in prod mode', () => {
    isDevModeMock.mockReturnValue(false);

    TestBed.configureTestingModule({ providers: [provideLogger(mockAppConfig.code)] });

    const logger = TestBed.inject(Logger);
    const consoleTransport = logger.transports[0] as ConsoleTransport;

    LOG_LEVELS.forEach(level => {
      expect(consoleTransport.isEnabled(mockAppConfig.code.toLowerCase(), level)).toBeFalsy();
    });
  });

  it('logs signal store events', () => {
    isDevModeMock.mockReturnValue(true);
    const infoSpy = vitest.spyOn(Logger.prototype, 'info').mockImplementation(() => undefined);
    const mockEvents = createMockEvents();

    TestBed.configureTestingModule({
      providers: [provideLogger(mockAppConfig.code), { provide: Events, useValue: mockEvents }]
    });

    TestBed.inject(Logger);

    expect(mockEvents.on).toHaveBeenCalled();
    expect(mockEvents.eventSubscription.subscribe).toHaveBeenCalledWith(expect.any(Function));

    const eventCallback = mockEvents.eventSubscription.subscribe.mock.calls[0][0];
    const mockEvent = { type: '[Store] Action', payload: { data: 'test' } };

    eventCallback(mockEvent);

    expect(infoSpy).toHaveBeenCalledWith(`${mockEvent.type}`, mockEvent.payload);
    infoSpy.mockRestore();
  });

  it('does not require router navigation events', () => {
    isDevModeMock.mockReturnValue(true);

    TestBed.configureTestingModule({ providers: [provideLogger(mockAppConfig.code)] });

    expect(() => TestBed.inject(Logger)).not.toThrow();
  });

  it('logs router navigation start and end events as info', () => {
    isDevModeMock.mockReturnValue(true);
    const infoSpy = vitest.spyOn(Logger.prototype, 'info').mockImplementation(() => undefined);
    const routerEvents = new Subject<RouterNavigationEvent>();

    configureLoggerWithRouterEvents(routerEvents);

    routerEvents.next(new NavigationStart(1, '/games'));
    routerEvents.next(new NavigationEnd(1, '/games', '/catalog/games'));

    expect(infoSpy).toHaveBeenCalledWith('NavigationStart', { id: 1, url: '/games' });
    expect(infoSpy).toHaveBeenCalledWith('NavigationEnd', {
      id: 1,
      url: '/games',
      urlAfterRedirects: '/catalog/games'
    });

    infoSpy.mockRestore();
  });

  it('logs router navigation cancellations as warnings', () => {
    isDevModeMock.mockReturnValue(true);
    const warnSpy = vitest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const routerEvents = new Subject<RouterNavigationEvent>();

    configureLoggerWithRouterEvents(routerEvents);

    routerEvents.next(
      new NavigationCancel(
        2,
        '/checkout',
        'Guard rejected navigation',
        NavigationCancellationCode.GuardRejected
      )
    );

    expect(warnSpy).toHaveBeenCalledWith('NavigationCancel', {
      code: NavigationCancellationCode.GuardRejected,
      id: 2,
      reason: 'Guard rejected navigation',
      url: '/checkout'
    });

    warnSpy.mockRestore();
  });

  it('logs router navigation errors as errors', () => {
    isDevModeMock.mockReturnValue(true);
    const errorSpy = vitest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const routerEvents = new Subject<RouterNavigationEvent>();
    const error = new Error('Resolver failed');

    configureLoggerWithRouterEvents(routerEvents);

    routerEvents.next(new NavigationError(3, '/profile', error));

    expect(errorSpy).toHaveBeenCalledWith('NavigationError', {
      error,
      id: 3,
      url: '/profile'
    });

    errorSpy.mockRestore();
  });

  it('logs skipped router navigation events as debug', () => {
    isDevModeMock.mockReturnValue(true);
    const debugSpy = vitest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    const routerEvents = new Subject<RouterNavigationEvent>();

    configureLoggerWithRouterEvents(routerEvents);

    routerEvents.next(
      new NavigationSkipped(
        4,
        '/current',
        'Ignored same URL navigation',
        NavigationSkippedCode.IgnoredSameUrlNavigation
      )
    );

    expect(debugSpy).toHaveBeenCalledWith('NavigationSkipped', {
      code: NavigationSkippedCode.IgnoredSameUrlNavigation,
      id: 4,
      reason: 'Ignored same URL navigation',
      url: '/current'
    });

    debugSpy.mockRestore();
  });

  afterEach(() => {
    isDevModeMock.mockReset();
    TestBed.resetTestingModule();
  });

  function configureLoggerWithRouterEvents(routerEvents: Subject<RouterNavigationEvent>): void {
    TestBed.configureTestingModule({
      providers: [
        provideLogger(mockAppConfig.code),
        { provide: Events, useValue: createMockEvents() },
        { provide: Router, useValue: { events: routerEvents.asObservable() } }
      ]
    });

    TestBed.inject(Logger);
  }

  function createMockEvents(): MockEvents {
    const eventSubscription = { subscribe: vitest.fn() };
    const eventStream = { pipe: vitest.fn().mockReturnValue(eventSubscription) };

    return {
      eventSubscription,
      on: vitest.fn().mockReturnValue(eventStream)
    };
  }
});
