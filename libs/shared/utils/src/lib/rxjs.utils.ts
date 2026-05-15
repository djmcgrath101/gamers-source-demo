import { NonNullableProps } from '@gamers-source/shared-types';
import { isNil } from 'lodash-es';
import { filter } from 'rxjs/operators';

/**
 * Ensures that all values passing through the observable stream
 * are neither `null` nor `undefined`.
 */
export function isNotNullable<T>() {
  return filter((value: T): value is NonNullable<T> => {
    if (isNil(value)) {
      throw new Error('Attempting to use nullable value where non-nullable value is expected!');
    }

    return true;
  });
}

/**
 * Ensures that the specified properties of any object passing through an
 * observable stream are neither `null` or `undefined`.
 */
export function nonNullableProps<T, K extends keyof T>(...props: Array<K>) {
  return filter((obj: T): obj is NonNullableProps<T, K> => {
    for (const prop of props) {
      if (isNil(obj[prop])) {
        throw new Error(
          `Attempting to use nullable value for "${String(
            prop
          )}" property where non-nullable value is expected!`
        );
      }
    }

    return true;
  });
}
