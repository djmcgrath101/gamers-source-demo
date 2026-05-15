import { Primitive } from 'type-fest';
import { ArrayElement, UnknownArrayOrTuple } from './arrays.types';

/**
 * `DistributiveOmit` is a utility type that performs an `Omit` operation on each member
 * of a union type `T`, removing the specified keys `K` from each member.
 *
 * It distributes the `Omit` operation over each constituent type of the union `T`.
 *
 * @template T - The union type to operate on.
 * @template K - The keys to omit from each type in the union.
 *
 * Example:
 * type A = { a: string, b: number };
 * type B = { a: string, c: boolean };
 * type C = { a: string, d: Date };
 *
 * type Union = A | B | C;
 * type OmittedUnion = DistributiveOmit<Union, 'a'>;
 * // OmittedUnion will be { b: number } | { c: boolean } | { d: Date }
 */
export type DistributiveOmit<T, K extends PropertyKey> = T extends any ? Omit<T, K> : never;

/**
 * `DistributivePick` is a utility type that performs a `Pick` operation on each member
 * of a union type `T`, retaining only the specified keys `K` from each member.
 *
 * It distributes the `Pick` operation over each constituent type of the union `T`.
 *
 * @template T - The union type to operate on.
 * @template K - The keys to pick from each type in the union.
 *
 * Example:
 * type A = { a: string, b: number };
 * type B = { a: string, c: boolean };
 * type C = { a: string, d: Date };
 *
 * type Union = A | B | C;
 * type PickedUnion = DistributivePick<Union, 'a'>;
 * // PickedUnion will be { a: string } | { a: string } | { a: string }
 */
export type DistributivePick<T, K extends keyof T> = T extends any ? Pick<T, K> : never;

/**
 * Extends the type of a specific field within an object type `T`.
 * It allows extending the original type of the specified field
 * to also include a new type `V`.
 *
 * @template T - The original object type.
 * @template U - The key of the field to be extended.
 * @template V - The new type to also include in the original type.
 */
export type ExtendFieldType<T, U extends keyof T, V> =
  /**
   * For each key in the original object type `T`, the resulting object type
   * will have the same key, but the type of the specified field `U` will be replaced
   * with the union type of its original type and the new type `V`.
   */
  { [Key in keyof T]: Key extends U ? T[Key] | V : T[Key] };

/**
 * Maps properties of an object type `T` to arrays if their values are of type `Primitive`.
 * The resulting type contains properties where primitives are converted into arrays, leaving other types unchanged.
 *
 * @template T - The original object type.
 * @template U - The keys of properties to be considered, defaulting to all keys of `T`.
 */
export type MapPrimitivesToArrays<T, U extends keyof T = keyof T> = {
  /**
   * For each key specified by `U` in the original object type `T`, the resulting object type
   * will include the same key. If the corresponding value is not of type `Primitive`, it remains unchanged.
   * If the value is of type `Primitive`, it is either left untouched if no primitives are found,
   * or it is converted into an array if primitives are present.
   */
  [Key in U]: Extract<T[Key], Primitive> extends never
    ? // If no primitives are found, the type remains unchanged.
      T[Key]
    : // If primitives are found, extract and convert them into arrays.
      // Leave untouched types that are not primitives.
      Exclude<T[Key], Primitive> | readonly Extract<T[Key], Primitive>[];
};

/**
 * Maps properties of an object type `T` to their element types if their values are of type `UnknownArrayOrTuple`.
 * The resulting type contains properties where arrays or tuples are mapped to their element types, leaving other types unchanged.
 *
 * @template T - The original object type.
 * @template U - The keys of properties to be considered, defaulting to all keys of `T`.
 */
export type MapArraysToElementsType<T, U extends keyof T = keyof T> = {
  /**
   * For each key specified by `U` in the original object type `T`, the resulting object type
   * will include the same key. If the corresponding value is not of type `UnknownArrayOrTuple`, it remains unchanged.
   * If the value is of type `UnknownArrayOrTuple`, it is either left untouched if no arrays or tuples are found,
   * or it is mapped to its element type if arrays or tuples are present.
   */
  [Key in U]: Extract<T[Key], UnknownArrayOrTuple> extends UnknownArrayOrTuple
    ? Exclude<T[Key], UnknownArrayOrTuple> | ArrayElement<Extract<T[Key], UnknownArrayOrTuple>>
    : T[Key];
};

/**
 * Picks the specified keys (K) from an object type (T) and
 * makes their values non-nullable.  The result is a type
 * where the specified keys have non-nullable values, while
 * other properties remain unchanged.  Defaults to including
 * all keys of T.
 */
export type NonNullableProps<T, K extends keyof T = keyof T> = {
  // Pick the properties K from type T and use the mapped type '-?'
  // to make each property non-optional (i.e., required).
  [P in keyof Pick<T, K>]-?: NonNullable<T[P]>;
} & Exclude<T, K>; // Combine with the remaining properties of T, excluding the keys in K.

/**
 * Omits properties with values of type `never` from an object type `T`.
 * The resulting type contains only those properties whose values are not of type `never`.
 *
 * @template T - The original object type.
 */
export type OmitNever<T> = {
  /**
   * For each key in the original object type `T`, the resulting object type
   * will include the same key only if the corresponding value is not of type `never`.
   * Properties with values of type `never` are omitted, and the resulting type is a subset
   *  of properties with non-never values.
   */
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

/**
 * Picks properties from an object type `T` that have values of type `UnknownArrayOrTuple`.
 * The resulting type contains only those properties whose values are arrays or tuples.
 *
 * @template T - The original object type.
 */
export type PickArraysFromProps<T> = OmitNever<{
  /**
   * For each key in the original object type `T`, the resulting object type
   * will include the same key only if the corresponding value is of type `UnknownArrayOrTuple`.
   * Non-matching properties are omitted, and the resulting type is a subset of properties with
   * array or tuple values.
   */
  [Key in keyof T]: Extract<T[Key], UnknownArrayOrTuple> extends never
    ? never
    : Extract<T[Key], UnknownArrayOrTuple>;
}>;

/**
 * Picks properties from an object type `T` that are common with the keys of another object type `U`.
 * The resulting type contains only those properties shared between `T` and `U`.
 *
 * @template T - The original object type.
 * @template U - The object type whose keys are used for picking common properties.
 */
export type PickCommonProps<T, U> = OmitNever<{
  /**
   * For each key in the original object type `T`, the resulting object type
   * will include the same key only if it is also present in the keys of object type `U`.
   * Non-matching properties are omitted, and the resulting type is a subset of properties
   *  shared between `T` and `U`.
   */
  [Key in keyof T]: Key extends keyof U ? T[Key] : never;
}>;

/**
 * Picks properties from an object type `BaseType` whose values match the specified `Primitive` type.
 * The resulting type contains only those properties with primitive values.
 *
 * @template BaseType - The original object type.
 * @template Values - The primitive type to match against, defaulting to the general `Primitive` type.
 */
export type PickPrimitiveProps<BaseType, Values extends Primitive = Primitive> = OmitNever<{
  /**
   * For each key in the original object type `BaseType`, the resulting object type
   * will include the same key only if the corresponding value matches the specified `Primitive` type.
   * Non-matching properties are omitted, and the resulting type is free of properties with non-primitive values.
   */
  [Key in keyof BaseType]: BaseType[Key] extends Values ? BaseType[Key] : never;
}>;

/**
 * Sets specific properties of an object type `T` to be nullable (or `null`).
 * The properties to be set as nullable are specified by the type parameter `U`.
 * By default, it sets all properties of `T` to be nullable.
 *
 * @template T - The original object type.
 * @template U - The keys of properties to be set as nullable, defaulting to all keys of `T`.
 */
export type SetNullProps<T, U extends keyof T = keyof T> = {
  /**
   * For each key in the original object type `T`, the resulting object type
   * will have the same key. If the key is specified by `U`, its type will be
   * replaced with the union type of its original type and `null`. If the key
   * is not in `U`, its type remains unchanged.
   */
  [Key in keyof T]: Key extends U ? T[Key] | null : T[Key];
};
