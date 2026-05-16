import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Logger } from '@gamers-source/shared-utils';
import Ajv, { Schema } from 'ajv';
import addFormats from 'ajv-formats';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface JsonValidateResult {
  readonly isValid: boolean;
  readonly errorsText: string;
}

interface LoadedJsonSchema {
  readonly schema: Schema;
  readonly url: string;
}

@Injectable({ providedIn: 'root' })
export class JsonSchemasService {
  readonly #httpClient = inject(HttpClient);
  readonly #logger = inject(Logger, { optional: true })?.extendScope('json-schemas');

  readonly #ajv = addFormats(new Ajv());
  readonly #schemasById = new Map<symbol, LoadedJsonSchema[]>();

  /**
   * Returns whether a schema URL has already been loaded for the validation ID.
   */
  isLoaded(url: string, id: symbol): boolean {
    return this.#schemasById.get(id)?.some(schema => schema.url === url) ?? false;
  }

  /**
   * Validates data against all schemas loaded for the validation ID.
   */
  isValid<T>(id: symbol, data: unknown): data is T {
    return this.validateData(id, data).isValid;
  }

  /**
   * Loads and appends a schema to the ordered schema list for the validation ID.
   */
  loadSchema(url: string, id: symbol): Observable<Schema> {
    const cachedSchema = this.#schemasById.get(id)?.find(schema => schema.url === url);

    if (cachedSchema) {
      this.#logger?.warn(
        `Schema with URL ${url} has already been loaded for ID ${id.toString()}. Returning cached schema.`
      );
      return of(cachedSchema.schema);
    }

    return this.#httpClient.get<Schema>(url).pipe(
      tap(schema => {
        const loadedSchemas = this.#schemasById.get(id) ?? [];
        loadedSchemas.push({ schema, url });
        this.#schemasById.set(id, loadedSchemas);

        this.#logger?.debug(
          `Successfully loaded schema from URL ${url} and associated it with ID ${id.toString()}.`
        );
      })
    );
  }

  /**
   * Validates data against either a single schema or every schema loaded for an ID.
   */
  validateData(schemaOrId: symbol | Schema, data: unknown): JsonValidateResult {
    let isValid = true;

    if (typeof schemaOrId === 'symbol') {
      const loadedSchemas = this.#schemasById.get(schemaOrId);

      if (!loadedSchemas) {
        throw new Error(
          'Attempting to validate data before loading schema!  Load the schema first using loadSchema$ method.'
        );
      }

      for (const { schema } of loadedSchemas) {
        isValid = this.#ajv.validate(schema, data);

        if (!isValid) {
          break;
        }
      }
    } else {
      isValid = this.#ajv.validate(schemaOrId, data);
    }

    return { isValid, errorsText: this.#ajv.errorsText() };
  }
}
