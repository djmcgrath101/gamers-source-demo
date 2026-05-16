import { EnvironmentProviders, inject, provideAppInitializer, Provider } from '@angular/core';
import {
  JSON_SCHEMAS,
  JsonSchemaLoader,
  JsonSchemasService
} from '@gamers-source/shared-angular-data-access';
import {
  AngularProviderFeature,
  mapFeaturesToProviders
} from '@gamers-source/shared-angular-utils';
import { forkJoin } from 'rxjs';

export enum ValidationFeatureKind {
  JsonSchemas = 'JsonSchemas'
}

export type ValidationFeature<T extends ValidationFeatureKind> = AngularProviderFeature<T>;

export type JsonValidationFeature = ValidationFeature<ValidationFeatureKind.JsonSchemas>;

export type ValidationFeatures = JsonValidationFeature;

/**
 * Configures the validation provider to load JSON schemas from the specified URLs
 * and make them available for validation throughout the application before it finishes
 * bootstrapping.
 *
 * @example
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideValidation(
 *       withJsonSchemas({
 *         id: USER_SCHEMA,
 *         url: '/assets/schemas/user.schema.json'
 *       })
 *     )
 *   ]
 * });
 * ```
 *
 */
export function withJsonSchemas(...loaders: readonly JsonSchemaLoader[]): JsonValidationFeature {
  return {
    kind: ValidationFeatureKind.JsonSchemas,
    providers: [
      provideAppInitializer(() => {
        const jsonSchemasService = inject(JsonSchemasService);
        const libLoaders = inject(JSON_SCHEMAS, { optional: true }) || [];
        const allLoaders = [...libLoaders.flat(), ...loaders];

        return forkJoin(allLoaders.map(({ id, url }) => jsonSchemasService.loadSchema(url, id)));
      })
    ]
  };
}

/**
 * Provides data validation through one or more validation features.
 *
 * @example
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideValidation(withJsonSchemas(USER_SCHEMA_LOADER))]
 * });
 * ```
 */
export function provideValidation(
  ...features: ValidationFeature<ValidationFeatureKind>[]
): Array<EnvironmentProviders | Provider> {
  return mapFeaturesToProviders(...features);
}
