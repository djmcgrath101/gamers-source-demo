import { getRandomInteger, isNumericStr, isPrimitive } from './primitives.utils';

describe('primitives.utils', () => {
  describe('getRandomInteger', () => {
    beforeEach(() => {
      vitest.spyOn(Math, 'random');
    });

    afterEach(() => {
      vitest.restoreAllMocks();
    });

    it('returns a number', () => {
      const result = getRandomInteger(1, 10);
      expect(typeof result).toBe('number');
    });

    it('returns a number within the specified range [min, max)', () => {
      const min = 5;
      const max = 10;
      const result = getRandomInteger(min, max);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThan(max);
    });

    it('returns min if min and max are the same', () => {
      const min = 5;
      const max = 5;
      const result = getRandomInteger(min, max);
      expect(result).toBe(min);
    });

    it('returns min when Math.random returns 0', () => {
      vitest.spyOn(Math, 'random').mockReturnValue(0);
      const min = 1;
      const max = 10;
      const result = getRandomInteger(min, max);
      expect(result).toBe(min);
    });

    it('returns the largest possible value less than max when Math.random returns a value close to 1', () => {
      vitest.spyOn(Math, 'random').mockReturnValue(0.9999999999);
      const min = 1;
      const max = 10;
      const result = getRandomInteger(min, max);
      expect(result).toBe(max - 1);
    });

    it('generates multiple values within range', () => {
      const min = 1;
      const max = 5;
      const results = new Set();
      for (let i = 0; i < 100; i++) {
        results.add(getRandomInteger(min, max));
      }
      for (const result of results) {
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThan(max);
      }
    });
  });

  describe('isNumericStr', () => {
    it('should return true if the string is a number', () => {
      expect(isNumericStr('123')).toBe(true);
      expect(isNumericStr('0')).toBe(true);
      expect(isNumericStr('0.1')).toBe(true);
      expect(isNumericStr('1.1')).toBe(true);
      expect(isNumericStr('1.0')).toBe(true);
      expect(isNumericStr('-0.45')).toBe(true);
      expect(isNumericStr('1.1.')).toBe(false);
      expect(isNumericStr('.1.1')).toBe(false);
      expect(isNumericStr('1..1')).toBe(false);
      expect(isNumericStr('123a45')).toBe(false);
      expect(isNumericStr('')).toBe(false);
    });
  });

  describe('isPrimitive', () => {
    it('should return true for a string', () => {
      expect(isPrimitive('hello')).toBe(true);
    });

    it('should return true for a number', () => {
      expect(isPrimitive(42)).toBe(true);
    });

    it('should return true for a boolean', () => {
      expect(isPrimitive(false)).toBe(true);
    });

    it('should return true for null', () => {
      expect(isPrimitive(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(isPrimitive(undefined)).toBe(true);
    });

    it('should return true for a symbol', () => {
      expect(isPrimitive(Symbol('symbol'))).toBe(true);
    });

    it('should return false for an object', () => {
      expect(isPrimitive({})).toBe(false);
    });

    it('should return false for an array', () => {
      expect(isPrimitive([])).toBe(false);
    });

    it('should return false for a function', () => {
      expect(isPrimitive(() => ({}))).toBe(false);
    });
  });
});
