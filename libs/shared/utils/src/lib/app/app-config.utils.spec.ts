import { isValidAppCode, normalizeApiConfig, normalizeAppCode } from './app-config.utils';

describe('app-config.utils', () => {
  describe('normalizeApiConfig', () => {
    it('returns an empty object when no config is provided', () => {
      expect(normalizeApiConfig(undefined)).toEqual({});
    });

    it('normalizes a valid baseUrl by removing trailing slash', () => {
      const config = { baseUrl: 'https://api.example.com/' };
      expect(normalizeApiConfig(config)).toEqual({ baseUrl: 'https://api.example.com' });
    });

    it('normalizes a valid pathPrefix by adding leading slash and removing trailing slash', () => {
      const config = { pathPrefix: 'v1/' };
      expect(normalizeApiConfig(config)).toEqual({ pathPrefix: '/v1' });
    });

    it('normalizes both baseUrl and pathPrefix', () => {
      const config = { baseUrl: 'https://api.example.com/', pathPrefix: 'v1/' };
      expect(normalizeApiConfig(config)).toEqual({
        baseUrl: 'https://api.example.com',
        pathPrefix: '/v1'
      });
    });

    it('throws an error for an invalid baseUrl', () => {
      const config = { baseUrl: 'invalid-url' };
      expect(() => normalizeApiConfig(config)).toThrow(
        new Error(
          'API base URL "invalid-url" is invalid. It must be a valid URL with HTTP or HTTPS scheme.'
        )
      );
    });

    it('returns the same config if already normalized', () => {
      const config = { baseUrl: 'https://api.example.com', pathPrefix: '/v1' };
      expect(normalizeApiConfig(config)).toEqual(config);
    });

    it('handles empty strings for baseUrl and pathPrefix', () => {
      const config = { baseUrl: '', pathPrefix: '' };
      expect(normalizeApiConfig(config)).toEqual({});
    });

    it('handles missing baseUrl and pathPrefix', () => {
      const config = {};
      expect(normalizeApiConfig(config)).toEqual({});
    });

    it('handles pathPrefix without leading slash', () => {
      const config = { pathPrefix: 'api' };
      expect(normalizeApiConfig(config)).toEqual({ pathPrefix: '/api' });
    });

    it('handles pathPrefix with both leading and trailing slashes', () => {
      const config = { pathPrefix: '/api/' };
      expect(normalizeApiConfig(config)).toEqual({ pathPrefix: '/api' });
    });
  });

  describe('normalizeAppCode', () => {
    it('returns the provided app code if valid', () => {
      expect(normalizeAppCode('MY_APP', 'My Application')).toBe('MY_APP');
    });

    it('generates an app code from the name if no code is provided', () => {
      expect(normalizeAppCode(undefined, 'My Application')).toBe('MY');
    });
  });

  describe('isValidAppCode', () => {
    it('returns true for valid app codes', () => {
      expect(isValidAppCode('APP_CODE')).toBe(true);
      expect(isValidAppCode('MYAPP')).toBe(true);
      expect(isValidAppCode('A')).toBe(false); // too short
      expect(isValidAppCode('THIS_IS_A_VERY_LONG_APP_CODE')).toBe(false); // too long
    });

    it('returns false for invalid app codes', () => {
      expect(isValidAppCode('app_code')).toBe(false); // lowercase letters
      expect(isValidAppCode('APP-CODE')).toBe(false); // invalid character '-'
      expect(isValidAppCode('APP CODE')).toBe(false); // space character
      expect(isValidAppCode('APP@CODE')).toBe(false); // special character '@'
      expect(isValidAppCode('')).toBe(false); // empty string
    });
  });
});
