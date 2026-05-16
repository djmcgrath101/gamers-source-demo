import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { faker } from '@faker-js/faker';
import {
  createMockApiErrorResponse,
  provideMockAppConfig
} from '@gamers-source/shared-angular-testing';
import { NormalizedAppConfig } from '@gamers-source/shared-types';
import { $ZodError } from 'zod/v4/core';
import { APP_CONFIG } from '../tokens/app-config.token';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let appConfig: NormalizedAppConfig;
  let ctrl: HttpTestingController;
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideMockAppConfig()]
    });

    appConfig = TestBed.inject(APP_CONFIG);
    service = TestBed.inject(ApiService);
    ctrl = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createUrl', () => {
    it('combines the base url and path prefix with the provided path', () => {
      const {
        api: { baseUrl, pathPrefix }
      } = appConfig;
      const path = '/some-endpoint';
      // @ts-expect-error Accessing private method for test purposes
      const url = service.createUrl(path);

      expect(url).toBe(`${baseUrl}${pathPrefix}${path}`);
    });

    it('handles a path that does not start with a slash', () => {
      const {
        api: { baseUrl, pathPrefix }
      } = appConfig;
      const path = 'some-endpoint';
      // @ts-expect-error Accessing private method for test purposes
      const url = service.createUrl(path);

      expect(url).toBe(`${baseUrl}${pathPrefix}/${path}`);
    });
  });

  describe('get', () => {
    it('makes an http get request with the expected base url headers', () => {
      const {
        api: { baseUrl, pathPrefix }
      } = appConfig;
      const endpoint = '/some-endpoint';
      service.get(endpoint).subscribe();

      const req = ctrl.expectOne(`${baseUrl}${pathPrefix}${endpoint}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Accept')).toBe('application/json');

      req.flush({});
      ctrl.verify();
    });
  });

  describe('getErrorResponseReasons', () => {
    it('returns error reasons from a valid ApiError response', () => {
      const errorResponse = createMockApiErrorResponse({
        errors: [
          { name: 'Error1', reason: 'First error reason' },
          { name: 'Error2', reason: 'Second error reason' }
        ]
      });

      const reasons = ApiService.getErrorResponseReasons(errorResponse);
      expect(reasons).toEqual(['First error reason', 'Second error reason']);
    });

    it('returns message from error-like object', () => {
      const errorResponse = new HttpErrorResponse({
        error: new Error('Something went wrong'),
        status: 500
      });

      const reasons = ApiService.getErrorResponseReasons(errorResponse);
      expect(reasons).toEqual(['Something went wrong']);
    });

    it('returns the error string if the error is a string', () => {
      const errorResponse = new HttpErrorResponse({
        error: 'A simple error string',
        status: 400
      });

      const reasons = ApiService.getErrorResponseReasons(errorResponse);
      expect(reasons).toEqual(['A simple error string']);
    });

    it('returns "Unknown error" message for unrecognized error format', () => {
      const errorResponse = new HttpErrorResponse({
        error: { unexpected: 'format' },
        status: 418
      });

      const reasons = ApiService.getErrorResponseReasons(errorResponse);
      expect(reasons).toEqual([
        'An unknown error occurred (status: 418).  Check the logs for details.'
      ]);
    });

    it('returns "Unknown error" message for non-HttpErrorResponse', () => {
      const reasons = ApiService.getErrorResponseReasons({ some: 'object' });
      expect(reasons).toEqual(['An unknown error occurred.  Check the logs for details.']);
    });

    it('returns formatted validation errors for instances of ZodError', () => {
      const errorResponse = new $ZodError([]);
      errorResponse.issues.push({
        path: ['username'],
        message: 'Username is required',
        code: 'custom'
      });
      errorResponse.issues.push({
        path: ['password'],
        message: 'Password must be at least 8 characters',
        code: 'custom'
      });
      const reasons = ApiService.getErrorResponseReasons(errorResponse);
      expect(reasons).toEqual([
        'Validation failed for field "username" with message: Username is required',
        'Validation failed for field "password" with message: Password must be at least 8 characters'
      ]);
    });
  });

  describe('post', () => {
    const endpoint = '/login';
    const body = { email: faker.internet.email(), password: faker.internet.password() };

    it('makes an http post request with the expected base url headers', () => {
      const {
        api: { baseUrl, pathPrefix }
      } = appConfig;
      service.post(endpoint, body).subscribe();

      const req = ctrl.expectOne(`${baseUrl}${pathPrefix}${endpoint}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.headers.get('Accept')).toBe('application/json');

      req.flush({});
      ctrl.verify();
    });
  });

  describe('put', () => {
    const endpoint = '/profile';
    const body = { name: faker.person.fullName() };

    it('makes an http put request with the expected base url headers', () => {
      const {
        api: { baseUrl, pathPrefix }
      } = appConfig;
      service.put(endpoint, body).subscribe();

      const req = ctrl.expectOne(`${baseUrl}${pathPrefix}${endpoint}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.headers.get('Accept')).toBe('application/json');

      req.flush({});
      ctrl.verify();
    });
  });

  describe('delete', () => {
    it('makes an http delete request with the expected base url headers', () => {
      const {
        api: { baseUrl, pathPrefix }
      } = appConfig;
      const endpoint = '/some-endpoint';
      service.delete(endpoint).subscribe();

      const req = ctrl.expectOne(`${baseUrl}${pathPrefix}${endpoint}`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Accept')).toBe('application/json');

      req.flush({});
      ctrl.verify();
    });
  });
});
