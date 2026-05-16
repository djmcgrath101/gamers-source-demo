import { TestBed } from '@angular/core/testing';
import { JSON_SCHEMAS, JsonSchemaLoader, provideJsonSchemas } from './json-schemas.provider';

describe('provideJsonSchemas', () => {
  it('provides schema loaders as a multi provider', () => {
    const userSchemaLoader = createSchemaLoader('user');
    const productSchemaLoader = createSchemaLoader('product');
    const orderSchemaLoader = createSchemaLoader('order');

    TestBed.configureTestingModule({
      providers: [
        provideJsonSchemas(userSchemaLoader, productSchemaLoader),
        provideJsonSchemas(orderSchemaLoader)
      ]
    });

    expect(TestBed.inject(JSON_SCHEMAS)).toEqual([
      [userSchemaLoader, productSchemaLoader],
      [orderSchemaLoader]
    ]);
  });

  function createSchemaLoader(name: string): JsonSchemaLoader {
    return {
      id: Symbol(`${name}-schema`),
      url: `/assets/schemas/${name}.schema.json`
    };
  }
});
