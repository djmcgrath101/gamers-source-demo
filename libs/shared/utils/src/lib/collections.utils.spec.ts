import { Primitive } from 'type-fest';
import { arrayContains, concatMerge, pickByKeys } from './collections.utils';

describe('collections.utils', () => {
  describe('arrayContains', () => {
    it('should return true if any search values are present in the array', () => {
      const array = [1, 2, 3, 'hello', true];
      expect(arrayContains(array, 2, 'hello')).toBe(true);
    });

    it('should return false if none of the search values are present in the array', () => {
      const array = [1, 2, 3, 'hello', true];
      expect(arrayContains(array, 4, 'world')).toBe(false);
    });

    it('should return true if the array contains at least one search value', () => {
      const array = [1, 2, 3, 'hello', true];
      expect(arrayContains(array, true, 'world')).toBe(true);
    });

    it('should return false if the array is empty', () => {
      const array: Primitive[] = [];
      expect(arrayContains(array, 1)).toBe(false);
    });

    it('should return false if no search values are provided', () => {
      const array = [1, 2, 3];
      expect(arrayContains(array)).toBe(false);
    });
  });

  describe('concatMerge', () => {
    it('concatenates arrays in the target and source objects', () => {
      const target = { a: [1, 2], b: 'string' };
      const source = { a: [3, 4] };

      const result = concatMerge(target, source);

      expect(result).toEqual({
        a: [1, 2, 3, 4],
        b: 'string'
      });
    });

    it('overwrites non-array properties in the target with values from the source', () => {
      const target = { a: [1, 2], b: 'original' };
      const source = { b: 'new value' };

      const result = concatMerge(target, source);

      expect(result).toEqual({
        a: [1, 2],
        b: 'new value'
      });
    });

    it('adds new properties from the source to the target', () => {
      const target = { a: [1, 2] };
      const source = { b: [3, 4] };

      const result = concatMerge(target, source);

      expect(result).toEqual({
        a: [1, 2],
        b: [3, 4]
      });
    });

    it('handles nested objects and concatenate arrays within them', () => {
      const target = { a: { b: [1, 2] } };
      const source = { a: { b: [3, 4] } };

      const result = concatMerge(target, source);

      expect(result).toEqual({
        a: {
          b: [1, 2, 3, 4]
        }
      });
    });

    it('handles empty objects and arrays', () => {
      const target = {};
      const source = { a: [] };

      const result = concatMerge(target, source);

      expect(result).toEqual({
        a: []
      });
    });

    it('does not modify the target or source objects', () => {
      const target = { a: [1, 2] };
      const source = { a: [3, 4] };

      const result = concatMerge(target, source);

      expect(result).toEqual({
        a: [1, 2, 3, 4]
      });
      expect(target).toEqual({ a: [1, 2] });
      expect(source).toEqual({ a: [3, 4] });
    });

    it('returns the target if the source is empty', () => {
      const target = { a: [1, 2] };
      const source = {};

      const result = concatMerge(target, source);

      expect(result).toEqual({ a: [1, 2] });
    });

    it('returns the source if the target is empty', () => {
      const target = {};
      const source = { a: [3, 4] };

      const result = concatMerge(target, source);

      expect(result).toEqual({ a: [3, 4] });
    });
  });

  describe('pickByKeys', () => {
    it('picks specified keys from each object in the collection', () => {
      const collection = [
        { a: 1, b: 2, c: 3 },
        { a: 4, b: 5, c: 6 }
      ];
      const result = pickByKeys(collection, 'a', 'c');

      expect(result).toEqual([
        { a: 1, c: 3 },
        { a: 4, c: 6 }
      ]);
    });

    it('returns an empty array if the collection is empty', () => {
      const collection: { a: number; b: number; c: number }[] = [];
      const result = pickByKeys(collection, 'a', 'b');

      expect(result).toEqual([]);
    });

    it('returns empty objects if no keys are specified', () => {
      const collection = [
        { a: 1, b: 2, c: 3 },
        { a: 4, b: 5, c: 6 }
      ];
      const result = pickByKeys(collection);

      expect(result).toEqual([{}, {}]);
    });

    it('handles a collection with objects of varying keys', () => {
      const collection = [{ a: 1, b: 2, c: 3 }, { a: 4 }, { b: 5, c: 6 }];
      const result = pickByKeys(collection, 'a', 'b');

      expect(result).toEqual([{ a: 1, b: 2 }, { a: 4 }, { b: 5 }]);
    });

    it('handles non-object values in the collection gracefully', () => {
      const collection = [{ a: 1 }, null, { b: 2 }] as any[];
      const result = pickByKeys(collection, 'a', 'b');

      expect(result).toEqual([{ a: 1 }, {}, { b: 2 }]);
    });

    it('handles keys that overlap with array indices or non-enumerable properties', () => {
      const collection = [{ '0': 'index', a: 1, b: 2 }];
      const result = pickByKeys(collection, '0', 'a');

      expect(result).toEqual([{ '0': 'index', a: 1 }]);
    });
  });
});
