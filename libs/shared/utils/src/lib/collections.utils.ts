import { mergeWith, pick } from 'lodash-es';
import { Primitive } from 'type-fest';

/**
 * Checks if any of the specified search values are present in the given array.
 *
 * @template T - The type of the array, which must be an array or readonly array of primitive values.
 * @param {T} array - The array to search within.
 * @param {...Primitive[]} searchValues - The values to search for within the array.
 * @returns {boolean} `true` if any of the search values are found in the array; otherwise, `false`.
 */
export function arrayContains<T extends Primitive[] | readonly Primitive[]>(
  array: T,
  ...searchValues: readonly Primitive[]
): boolean {
  return array.some(arrValue => searchValues.includes(arrValue));
}

/**
 * Merges two objects together using lodash merge,
 * but concatenates arrays instead of replacing them
 */
export function concatMerge<T, U>(target: T, source: U): T & U {
  return mergeWith({}, target, source, (targetValue, srcValue) => {
    return Array.isArray(targetValue) ? targetValue.concat(srcValue) : undefined;
  });
}

/**
 * Creates a new array of objects by picking specified keys from each object in the input collection.
 *
 * @template T - The type of objects in the input collection.
 * @template K - The keys to pick from each object.
 */
export function pickByKeys<T extends object, K extends keyof T>(
  collection: T[],
  ...keys: K[]
): Array<Pick<T, K>> {
  return collection.map(obj => pick(obj, keys));
}
