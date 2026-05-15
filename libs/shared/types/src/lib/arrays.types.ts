/**
 * Extracts the first indexed element type from an array or tuple.
 */
export type ArrayElement<T> = T extends readonly unknown[] ? T[0] : never;

/**
 * Extracts the type from array elements, leaving other types intact.
 */
export type ExtractArrayElementType<T> =
  | Exclude<T, UnknownArrayOrTuple>
  | ArrayElement<Extract<T, UnknownArrayOrTuple>>;

/**
 * Represents any readonly array or tuple shape without depending on package-private
 * helpers from third-party type libraries.
 */
export type UnknownArrayOrTuple = readonly [...unknown[]];
