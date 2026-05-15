import { isErrorLike } from './errors.utils';

describe('errors.utils', () => {
  describe('isErrorLike', () => {
    it('returns true for an object with a string message property', () => {
      const errorLike = { message: 'An error occurred' };
      expect(isErrorLike(errorLike)).toBe(true);
    });

    it('returns false for an object without a message property', () => {
      const notErrorLike = { error: 'An error occurred' };
      expect(isErrorLike(notErrorLike)).toBe(false);
    });

    it('returns false for a null value', () => {
      expect(isErrorLike(null)).toBe(false);
    });

    it('returns false for a non-object value', () => {
      expect(isErrorLike('An error occurred')).toBe(false);
      expect(isErrorLike(42)).toBe(false);
      expect(isErrorLike(true)).toBe(false);
      expect(isErrorLike(undefined)).toBe(false);
    });
  });
});
