import { FactoryProvider } from '@angular/core';
import { Logger } from '@gamers-source/shared-utils';

export function provideMockLogger(): FactoryProvider {
  return { provide: Logger, useFactory: () => new Logger('cy', []) };
}
