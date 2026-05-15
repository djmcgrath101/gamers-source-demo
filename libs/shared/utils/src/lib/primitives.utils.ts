import { isObject } from 'lodash-es';
import { Primitive } from 'type-fest';

/**
 * Selects a random integer between min and max (both inclusive).
 *
 * @param min Minimum for range
 * @param max Maximum for range
 * @returns Random integer within the chosen range
 */
export function getRandomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Tests whether a string only contains numeric characters
 * (integers and decimals).
 *
 * @example
 * isNumericStr('123') // true
 * isNumericStr('123.45') // true
 * isNumericStr('-123.45') // true
 * isNumericStr('-0.45') // true
 * isNumericStr('123a45') // false
 * isNumericStr('') // false
 * isNumericStr('123.') // false
 * isNumericStr('.45') // false
 */
export function isNumericStr(str: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(str);
}

/**
 * Determines if the given value is a primitive type.
 *
 * @template T - The type of the value to check.
 * @param {T} value - The value to check.
 * @returns {value is Extract<T, Primitive>} `true` if the value is a primitive type; otherwise, `false`.
 */
export function isPrimitive<T>(value: T): value is Extract<T, Primitive> {
  return !isObject(value);
}
