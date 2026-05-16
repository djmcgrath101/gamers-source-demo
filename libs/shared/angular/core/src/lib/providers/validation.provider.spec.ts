import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  JsonSchemaLoader,
  JsonSchemasService,
  provideJsonSchemas
} from '@gamers-source/shared-angular-data-access';
import { of } from 'rxjs';
import { Mock } from 'vitest';
import { provideValidation, ValidationFeatureKind, withJsonSchemas } from './validation.provider';

type ApplicationInitStatusWithRunner = ApplicationInitStatus & {
  runInitializers: () => void;
};

describe('validation.provider', () => {
  let jsonSchemasService: { loadSchema: Mock };

  beforeEach(() => {
    jsonSchemasService = {
      loadSchema: vitest.fn().mockReturnValue(of({}))
    };
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('withJsonSchemas', () => {
    it('creates a JSON schema validation feature with an app initializer', () => {
      const schemaLoader = createSchemaLoader('user');

      const feature = withJsonSchemas(schemaLoader);

      expect(feature.kind).toBe(ValidationFeatureKind.JsonSchemas);
      expect(feature.providers).toHaveLength(1);
    });
  });

  describe('provideValidation', () => {
    it('maps validation features to providers', () => {
      const schemaLoader = createSchemaLoader('user');
      const feature = withJsonSchemas(schemaLoader);

      expect(provideValidation(feature)).toEqual(feature.providers);
    });

    it('loads configured schema loaders during app initialization', async () => {
      const librarySchemaLoader = createSchemaLoader('library');
      const coreSchemaLoader = createSchemaLoader('core');

      TestBed.configureTestingModule({
        providers: [
          provideValidation(withJsonSchemas(coreSchemaLoader)),
          provideJsonSchemas(librarySchemaLoader),
          { provide: JsonSchemasService, useValue: jsonSchemasService }
        ]
      });

      runAppInitializers();

      await TestBed.inject(ApplicationInitStatus).donePromise;

      expect(jsonSchemasService.loadSchema).toHaveBeenCalledWith(
        librarySchemaLoader.url,
        librarySchemaLoader.id
      );
      expect(jsonSchemasService.loadSchema).toHaveBeenCalledWith(
        coreSchemaLoader.url,
        coreSchemaLoader.id
      );
      expect(loadSchemaCallOrder(librarySchemaLoader)).toBeLessThan(
        loadSchemaCallOrder(coreSchemaLoader)
      );
    });

    it('initializes when only validation feature schema loaders are provided', async () => {
      const coreSchemaLoader = createSchemaLoader('core');

      TestBed.configureTestingModule({
        providers: [
          provideValidation(withJsonSchemas(coreSchemaLoader)),
          { provide: JsonSchemasService, useValue: jsonSchemasService }
        ]
      });

      runAppInitializers();

      await TestBed.inject(ApplicationInitStatus).donePromise;

      expect(jsonSchemasService.loadSchema).toHaveBeenCalledTimes(1);
      expect(jsonSchemasService.loadSchema).toHaveBeenCalledWith(
        coreSchemaLoader.url,
        coreSchemaLoader.id
      );
    });

    it('initializes when no schema loaders are provided', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideValidation(withJsonSchemas()),
          { provide: JsonSchemasService, useValue: jsonSchemasService }
        ]
      });

      runAppInitializers();

      await TestBed.inject(ApplicationInitStatus).donePromise;

      expect(jsonSchemasService.loadSchema).not.toHaveBeenCalled();
    });
  });

  function createSchemaLoader(name: string): JsonSchemaLoader {
    return {
      id: Symbol(`${name}-schema`),
      url: `/assets/schemas/${name}.schema.json`
    };
  }

  function loadSchemaCallOrder(schemaLoader: JsonSchemaLoader): number {
    const callIndex = jsonSchemasService.loadSchema.mock.calls.findIndex(
      ([url, id]) => url === schemaLoader.url && id === schemaLoader.id
    );

    return jsonSchemasService.loadSchema.mock.invocationCallOrder[callIndex];
  }

  function runAppInitializers(): void {
    const applicationInitStatus = TestBed.inject(
      ApplicationInitStatus
    ) as ApplicationInitStatusWithRunner;

    applicationInitStatus.runInitializers();
  }
});
