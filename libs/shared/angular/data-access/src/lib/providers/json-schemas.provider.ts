import { InjectionToken, ValueProvider } from '@angular/core';

export interface JsonSchemaLoader {
  readonly id: symbol;
  readonly url: string;
}

export const JSON_SCHEMAS = new InjectionToken<readonly (readonly JsonSchemaLoader[])[]>(
  'JSON_SCHEMAS'
);

export function provideJsonSchemas(...loaders: readonly JsonSchemaLoader[]): ValueProvider {
  return {
    provide: JSON_SCHEMAS,
    useValue: loaders,
    multi: true
  };
}
