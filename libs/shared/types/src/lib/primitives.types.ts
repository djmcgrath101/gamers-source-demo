import { Primitive, ValueOf } from 'type-fest';

/**
 * Extracts primitive values from the properties of an object type `T`.
 * The resulting type contains only those values that match the `Primitive` type.
 *
 * @template T - The original object type.
 */
export type PrimitiveValuesOf<T> = Extract<ValueOf<T>, Primitive>;
