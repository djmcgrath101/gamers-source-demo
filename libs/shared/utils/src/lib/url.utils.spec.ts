import { faker } from '@faker-js/faker';
import { convertUrlSearchParamsToRecord, isValidHttpUrl, isValidUrlHostname } from './url.utils';

describe('url.utils', () => {
  describe('convertUrlSearchParamsToRecord', () => {
    it('should convert url search params to record', () => {
      const url = new URL(faker.internet.url());

      url.searchParams.set('test1', 'abc');
      url.searchParams.set('test2', 'def');
      url.searchParams.set('test3', 'ghi');

      const expected = { test1: 'abc', test2: 'def', test3: 'ghi' };
      const result = convertUrlSearchParamsToRecord(url.searchParams);

      expect(result).toEqual(expected);
    });
  });

  describe('isValidHttpUrl', () => {
    it('returns true for valid HTTP URL', () => {
      expect(isValidHttpUrl('http://example.com')).toBe(true);
    });

    it('returns true for valid HTTPS URL', () => {
      expect(isValidHttpUrl('https://example.com')).toBe(true);
    });

    it('returns false for invalid URL scheme', () => {
      expect(isValidHttpUrl('ftp://example.com')).toBe(false);
    });

    it('returns false for malformed URL', () => {
      expect(isValidHttpUrl('htp:/example.com')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isValidHttpUrl('')).toBe(false);
    });

    it('returns false for non-URL strings', () => {
      expect(isValidHttpUrl('just a string')).toBe(false);
    });
  });

  describe('isValidUrlHostname', () => {
    it('returns true for valid hostname', () => {
      expect(isValidUrlHostname('example.com')).toBe(true);
    });

    it('returns true for valid hostname with subdomain', () => {
      expect(isValidUrlHostname('sub.example.com')).toBe(true);
    });

    it('returns true for valid hostname with hyphen', () => {
      expect(isValidUrlHostname('my-site.com')).toBe(true);
    });

    it('returns false for hostname starting with hyphen', () => {
      expect(isValidUrlHostname('-example.com')).toBe(false);
    });

    it('returns false for hostname ending with hyphen', () => {
      expect(isValidUrlHostname('example-.com')).toBe(false);
    });

    it('returns false for hostname with invalid characters', () => {
      expect(isValidUrlHostname('exam!ple.com')).toBe(false);
    });

    it('returns false for overly long hostname', () => {
      const longHostname = 'a'.repeat(64) + '.com';
      expect(isValidUrlHostname(longHostname)).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isValidUrlHostname('')).toBe(false);
    });
  });
});
