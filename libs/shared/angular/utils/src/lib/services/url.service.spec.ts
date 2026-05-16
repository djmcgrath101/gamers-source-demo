import { DOCUMENT } from '@angular/common';
import { NavigationExtras, Router, UrlTree } from '@angular/router';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator/jest';
import { UrlService } from './url.service';

describe('UrlService', () => {
  let spectator: SpectatorService<UrlService>;
  let documentMock: Pick<Document, 'location'>;
  let routerMock: Pick<Router, 'createUrlTree' | 'serializeUrl'>;

  const urlTree = {} as UrlTree;

  const setup = (location?: Partial<Location>): void => {
    documentMock = {
      location: {
        hostname: 'app.example.test',
        port: '4200',
        protocol: 'https:',
        ...location
      } as Location
    };
    routerMock = {
      createUrlTree: vitest.fn(() => urlTree),
      serializeUrl: vitest.fn(() => '/teams/alpha?debug=true')
    };

    spectator = createService();
  };

  const createService = createServiceFactory({
    service: UrlService,
    providers: [
      {
        provide: DOCUMENT,
        useFactory: () => documentMock
      },
      {
        provide: Router,
        useFactory: () => routerMock
      }
    ]
  });

  it('creates service instance', () => {
    setup();

    expect(spectator.service).toBeTruthy();
  });

  describe('buildUrl', () => {
    it('returns an absolute URL for a route string', () => {
      setup();

      expect(spectator.service.buildUrl('/test/123')).toEqual(
        new URL('https://app.example.test:4200/test/123')
      );
    });

    it('returns an absolute URL for a route string without a leading slash', () => {
      setup();

      expect(spectator.service.buildUrl('test/123')).toEqual(
        new URL('https://app.example.test:4200/test/123')
      );
    });

    it('returns an absolute URL for router link params and navigation extras', () => {
      setup();

      const extras: NavigationExtras = {
        queryParams: {
          debug: true
        }
      };

      expect(spectator.service.buildUrl(['teams', 'alpha'], extras)).toEqual(
        new URL('https://app.example.test:4200/teams/alpha?debug=true')
      );
      expect(routerMock.createUrlTree).toHaveBeenCalledWith(['teams', 'alpha'], extras);
      expect(routerMock.serializeUrl).toHaveBeenCalledWith(urlTree);
    });

    it('omits the port segment when the current location has no port', () => {
      setup({ port: '' });

      expect(spectator.service.buildUrl('/test/123')).toEqual(
        new URL('https://app.example.test/test/123')
      );
    });
  });

  describe('isFullUrl', () => {
    it('returns true when a string URL starts with the current origin', () => {
      setup();

      const testUrl = 'https://app.example.test:4200/test/123';

      expect(spectator.service.isFullUrl(testUrl)).toBe(true);
    });

    it('returns true when a URL object starts with the current origin', () => {
      setup();

      expect(spectator.service.isFullUrl(new URL('https://app.example.test:4200/test/123'))).toBe(
        true
      );
    });

    it('returns false if the string URL is missing the current origin', () => {
      setup();

      expect(spectator.service.isFullUrl('/test/123')).toBe(false);
    });

    it('returns false if the URL object uses a different origin', () => {
      setup();

      expect(spectator.service.isFullUrl(new URL('https://other.example.test:4200/test/123'))).toBe(
        false
      );
    });

    it('returns false if the string URL only starts with the current origin text', () => {
      setup();

      const testUrl = 'https://app.example.test:4200@other.example.test/test/123';

      expect(spectator.service.isFullUrl(testUrl)).toBe(false);
    });
  });
});
