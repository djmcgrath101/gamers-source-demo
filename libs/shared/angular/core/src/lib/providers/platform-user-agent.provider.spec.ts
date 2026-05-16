import { PLATFORM_ID, REQUEST } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { faker } from '@faker-js/faker';
import { PLATFORM_USER_AGENT } from '@gamers-source/shared-angular-utils';
import { providePlatformUserAgent } from './platform-user-agent.provider';

// Small helper to (re)configure the DI container per test
function setup(providers: any[]) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers });
}

describe('providePlatformUserAgent', () => {
  it('returns UA from headers when running on the server', () => {
    const userAgent = faker.internet.userAgent();
    const get = vitest.fn().mockReturnValue(userAgent);
    setup([
      providePlatformUserAgent(),
      { provide: PLATFORM_ID, useValue: 'server' },
      { provide: REQUEST, useValue: { headers: { get } } as any }
    ]);

    const ua = TestBed.inject<string>(PLATFORM_USER_AGENT);
    expect(ua).toBe(userAgent);
    expect(get).toHaveBeenCalledWith('user-agent');
  });

  it('returns empty string on server if header is missing', () => {
    const get = vitest.fn().mockReturnValue(null);
    setup([
      providePlatformUserAgent(),
      { provide: PLATFORM_ID, useValue: 'server' },
      { provide: REQUEST, useValue: { headers: { get } } as any }
    ]);

    const ua = TestBed.inject<string>(PLATFORM_USER_AGENT);
    expect(ua).toBe('');
  });

  it('returns empty string on server if REQUEST is null', () => {
    setup([
      providePlatformUserAgent(),
      { provide: PLATFORM_ID, useValue: 'server' },
      { provide: REQUEST, useValue: null }
    ]);

    const ua = TestBed.inject<string>(PLATFORM_USER_AGENT);
    expect(ua).toBe('');
  });

  it('returns empty string in the browser', () => {
    // Even if a REQUEST is present in tests, the factory should ignore it on browser
    const get = vitest.fn().mockReturnValue('Should not be used');
    setup([
      providePlatformUserAgent(),
      { provide: PLATFORM_ID, useValue: 'browser' },
      { provide: REQUEST, useValue: { headers: { get } } as any }
    ]);

    const ua = TestBed.inject<string>(PLATFORM_USER_AGENT);
    expect(ua).toBe('');
    expect(get).not.toHaveBeenCalled();
  });

  it('is resilient if headers is undefined', () => {
    // Defensive test: headers may be undefined in some custom setups
    setup([
      providePlatformUserAgent(),
      { provide: PLATFORM_ID, useValue: 'server' },
      { provide: REQUEST, useValue: { headers: undefined } as any }
    ]);

    const ua = TestBed.inject<string>(PLATFORM_USER_AGENT);
    expect(ua).toBe('');
  });
});
