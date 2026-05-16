import { inject, Type } from '@angular/core';
import { Logger } from '@gamers-source/shared-utils';
import { kebabCase } from 'lodash-es';

/**
 * Injects a Logger instance with the namespace scoped
 * to the provided source after converting the source name to
 * kebab-case format.
 *
 * @param source The source class or string to scope the logger
 * @returns A scoped Logger instance
 */
export function injectLogger(source: Type<unknown> | string): Logger | null {
  const logger = inject(Logger, { optional: true });
  const sourceName = kebabCase(typeof source === 'string' ? source : source.name);

  return logger?.extendScope(sourceName) ?? null;
}
