import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Schema } from 'ajv';
import { JsonSchemasService } from './json-schemas.service';

describe('JsonSchemasService', () => {
  let controller: HttpTestingController;
  let service: JsonSchemasService;

  const mockSchema: Schema = { type: 'object', properties: { name: { type: 'string' } } };
  const schemaId = Symbol('test-schema');
  const schemaUrl = 'https://example.com/schema';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JsonSchemasService, provideHttpClient(), provideHttpClientTesting()]
    });

    controller = TestBed.inject(HttpTestingController);
    service = TestBed.inject(JsonSchemasService);
  });

  afterEach(() => {
    controller.verify();
  });

  it('creates service instance', () => {
    expect(service).toBeTruthy();
  });

  it('loads a schema from a URL and caches it', () => {
    expect(service.isLoaded(schemaUrl, schemaId)).toBe(false);

    service.loadSchema(schemaUrl, schemaId).subscribe(result => {
      expect(result).toEqual(mockSchema);
      expect(service.isLoaded(schemaUrl, schemaId)).toBe(true);
    });

    const request = controller.expectOne(schemaUrl);
    expect(request.request.method).toBe('GET');
    request.flush(mockSchema);
  });

  it('returns cached schema when already loaded', () => {
    service.loadSchema(schemaUrl, schemaId).subscribe();
    controller.expectOne(schemaUrl).flush(mockSchema);

    service.loadSchema(schemaUrl, schemaId).subscribe(schema => {
      expect(schema).toEqual(mockSchema);
    });
  });

  it('loads the same URL separately for different schema IDs', () => {
    const otherSchemaId = Symbol('other-test-schema');

    service.loadSchema(schemaUrl, schemaId).subscribe();
    controller.expectOne(schemaUrl).flush(mockSchema);

    service.loadSchema(schemaUrl, otherSchemaId).subscribe(result => {
      expect(result).toEqual(mockSchema);
      expect(service.isLoaded(schemaUrl, otherSchemaId)).toBe(true);
    });
    controller.expectOne(schemaUrl).flush(mockSchema);
  });

  it('validates data against a loaded schema', () => {
    const validData = { name: 'John' };
    const invalidData = { name: 123 };

    service.loadSchema(schemaUrl, schemaId).subscribe();
    controller.expectOne(schemaUrl).flush(mockSchema);

    const validResult = service.validateData(schemaId, validData);
    const invalidResult = service.validateData(schemaId, invalidData);

    expect(validResult.isValid).toBe(true);
    expect(validResult.errorsText).toBe('No errors');

    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errorsText).not.toBe('No errors');
  });

  it('validates data against every schema loaded for an ID', () => {
    const ageSchemaUrl = 'https://example.com/age-schema';
    const ageSchema: Schema = {
      type: 'object',
      required: ['age'],
      properties: { age: { type: 'number' } }
    };
    const nameSchema: Schema = {
      type: 'object',
      required: ['name'],
      properties: { name: { type: 'string' } }
    };

    service.loadSchema(schemaUrl, schemaId).subscribe();
    controller.expectOne(schemaUrl).flush(nameSchema);
    service.loadSchema(ageSchemaUrl, schemaId).subscribe();
    controller.expectOne(ageSchemaUrl).flush(ageSchema);

    expect(service.validateData(schemaId, { age: 25, name: 'John' }).isValid).toBe(true);
    expect(service.validateData(schemaId, { age: 25 }).isValid).toBe(false);
    expect(service.validateData(schemaId, { name: 'John' }).isValid).toBe(false);
  });

  it('throws an error when validating data with an unloaded schema', () => {
    const schemaId = Symbol('unloaded-schema');
    const data = { name: 'John' };

    expect(() => service.validateData(schemaId, data)).toThrow(
      'Attempting to validate data before loading schema!  Load the schema first using loadSchema$ method.'
    );
  });

  it('validates data against a single schema directly', () => {
    const schema: Schema = { type: 'object', properties: { age: { type: 'number' } } };
    const invalidData = { age: 'twenty-five' };
    const validData = { age: 25 };

    const validResult = service.validateData(schema, validData);
    const invalidResult = service.validateData(schema, invalidData);

    expect(validResult.isValid).toBe(true);
    expect(validResult.errorsText).toBe('No errors');

    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errorsText).not.toBe('No errors');
  });

  it('does not reload a schema if it is already loaded', () => {
    service.loadSchema(schemaUrl, schemaId).subscribe();
    controller.expectOne(schemaUrl).flush(mockSchema);

    service.loadSchema(schemaUrl, schemaId).subscribe();
    controller.expectNone(schemaUrl);
  });
});
