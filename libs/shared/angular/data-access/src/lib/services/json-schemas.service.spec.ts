import { HttpMethod, SpectatorHttp, createHttpFactory } from '@ngneat/spectator/vitest';
import { Schema } from 'ajv';
import { JsonSchemasService } from './json-schemas.service';

describe('JsonSchemasService', () => {
  let spectator: SpectatorHttp<JsonSchemasService>;
  const createHttp = createHttpFactory(JsonSchemasService);

  const schemaUrl = 'https://example.com/schema';
  const schemaId = Symbol('test-schema');
  const mockSchema: Schema = { type: 'object', properties: { name: { type: 'string' } } };

  beforeEach(() => {
    spectator = createHttp();
  });

  it('creates service instance', () => {
    expect(spectator.service).toBeTruthy();
  });

  it('loads a schema from a URL and caches it', () => {
    expect(spectator.service.isLoaded(schemaUrl, schemaId)).toBe(false);

    spectator.service.loadSchema(schemaUrl, schemaId).subscribe(result => {
      expect(result).toEqual(mockSchema);
      expect(spectator.service.isLoaded(schemaUrl, schemaId)).toBe(true);
    });
    spectator.expectOne(schemaUrl, HttpMethod.GET).flush(mockSchema);
  });

  it('returns cached schema when already loaded', () => {
    spectator.service.loadSchema(schemaUrl, schemaId).subscribe();
    spectator.expectOne(schemaUrl, HttpMethod.GET).flush(mockSchema);

    spectator.service.loadSchema(schemaUrl, schemaId).subscribe(schema => {
      expect(schema).toEqual(mockSchema);
    });
  });

  it('loads the same URL separately for different schema IDs', () => {
    const otherSchemaId = Symbol('other-test-schema');

    spectator.service.loadSchema(schemaUrl, schemaId).subscribe();
    spectator.expectOne(schemaUrl, HttpMethod.GET).flush(mockSchema);

    spectator.service.loadSchema(schemaUrl, otherSchemaId).subscribe(result => {
      expect(result).toEqual(mockSchema);
      expect(spectator.service.isLoaded(schemaUrl, otherSchemaId)).toBe(true);
    });
    spectator.expectOne(schemaUrl, HttpMethod.GET).flush(mockSchema);
  });

  it('validates data against a loaded schema', () => {
    const validData = { name: 'John' };
    const invalidData = { name: 123 };

    spectator.service.loadSchema(schemaUrl, schemaId).subscribe();
    spectator.expectOne(schemaUrl, HttpMethod.GET).flush(mockSchema);

    const validResult = spectator.service.validateData(schemaId, validData);
    const invalidResult = spectator.service.validateData(schemaId, invalidData);

    expect(validResult.isValid).toBe(true);
    expect(validResult.errorsText).toBe('No errors');

    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errorsText).not.toBe('No errors');
  });

  it('validates data against every schema loaded for an ID', () => {
    const ageSchemaUrl = 'https://example.com/age-schema';
    const nameSchema: Schema = {
      type: 'object',
      required: ['name'],
      properties: { name: { type: 'string' } }
    };
    const ageSchema: Schema = {
      type: 'object',
      required: ['age'],
      properties: { age: { type: 'number' } }
    };

    spectator.service.loadSchema(schemaUrl, schemaId).subscribe();
    spectator.expectOne(schemaUrl, HttpMethod.GET).flush(nameSchema);
    spectator.service.loadSchema(ageSchemaUrl, schemaId).subscribe();
    spectator.expectOne(ageSchemaUrl, HttpMethod.GET).flush(ageSchema);

    expect(spectator.service.validateData(schemaId, { age: 25, name: 'John' }).isValid).toBe(true);
    expect(spectator.service.validateData(schemaId, { age: 25 }).isValid).toBe(false);
    expect(spectator.service.validateData(schemaId, { name: 'John' }).isValid).toBe(false);
  });

  it('throws an error when validating data with an unloaded schema', () => {
    const schemaId = Symbol('unloaded-schema');
    const data = { name: 'John' };

    expect(() => spectator.service.validateData(schemaId, data)).toThrow(
      'Attempting to validate data before loading schema!  Load the schema first using loadSchema$ method.'
    );
  });

  it('validates data against a single schema directly', () => {
    const schema: Schema = { type: 'object', properties: { age: { type: 'number' } } };
    const validData = { age: 25 };
    const invalidData = { age: 'twenty-five' };

    const validResult = spectator.service.validateData(schema, validData);
    const invalidResult = spectator.service.validateData(schema, invalidData);

    expect(validResult.isValid).toBe(true);
    expect(validResult.errorsText).toBe('No errors');

    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errorsText).not.toBe('No errors');
  });

  it('does not reload a schema if it is already loaded', () => {
    spectator.service.loadSchema(schemaUrl, schemaId).subscribe();
    spectator.expectOne(schemaUrl, HttpMethod.GET).flush(mockSchema);

    spectator.service.loadSchema(schemaUrl, schemaId).subscribe();
    spectator.controller.expectNone(schemaUrl);
  });
});
