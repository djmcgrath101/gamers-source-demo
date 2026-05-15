/**
 * Checks if a value is an object with a string 'message' property.
 * @param value The value to check.
 * @returns True if the value is an object with a string 'message' property, otherwise false.
 */
export function isErrorLike(value: unknown): value is { message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as { message: unknown }).message === 'string'
  );
}
