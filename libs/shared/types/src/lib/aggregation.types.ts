import { ArrayElement, UnknownArrayOrTuple } from './arrays.types';

/**
 * Represents an aggregated value derived from a type `T`.
 * If `T` is an array or tuple, the aggregated value is `T`.
 * If `T` is not an array or tuple, the aggregated value is a readonly array
 * containing the individual elements of `T`, excluding any nested arrays or tuples.
 *
 * @template T - The original type to be aggregated.
 */
// IMPORTANT: Enclose each side of the extends clause with square brackets
// to avoid expanding unions of literals into separate arrays
// for each literal of the union.  Instead, what we need is
// for unions of literals to become a single array of the union.
//
// For example, the union type 'a' | 'b' | 'c' would become
// the union 'a'[] | 'b'[] | 'c'[] without the enclosing brackets.
// With the enclosing brackets, what we would obtain instead is the type
// ('a' | 'b' | 'c')[] which is what we want in this case.
//
// @see https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
export type AggregatedValue<T> =
  /**
   * If `T` is an array or tuple, the aggregated value is `T`.
   */
  [T] extends [UnknownArrayOrTuple]
    ? T
    : /**
       * If `T` is not an array or tuple, the aggregated value is a readonly array
       * containing the individual elements of `T`, excluding any nested arrays or tuples.
       */
      readonly (Exclude<T, UnknownArrayOrTuple> | ArrayElement<Extract<T, UnknownArrayOrTuple>>)[];

/**
 * Represents aggregated data where each property in the resulting object
 * corresponds to a key in the original data and holds the aggregated value
 * for that key.
 *
 * @template Data - The original data type.
 * @template Keys - The keys to be aggregated, defaulting to all keys in Data.
 */
export type AggregatedData<Data, Keys extends keyof Data = keyof Data> = {
  /**
   * For each specified key in `Keys`, the resulting object will have a property
   * with the same key holding the aggregated value for that key from the original data.
   *
   * The aggregated value is determined by the `AggregatedValue` type, which may unwrap
   * arrays or tuples to their element types.
   */
  [Key in Keys]: AggregatedValue<Data[Key]>;
};
