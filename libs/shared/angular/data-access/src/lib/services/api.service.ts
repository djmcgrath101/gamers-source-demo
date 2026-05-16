import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { isErrorLike } from '@gamers-source/shared-utils';
import { isString } from 'lodash-es';
import { Observable } from 'rxjs';
import { array, number, object, string, type infer as zInfer } from 'zod/mini';
import { $ZodError } from 'zod/v4/core';
import { APP_CONFIG } from '../tokens/app-config.token';

export const ApiErrorItemSchema = array(
  object({
    name: string(),
    reason: string()
  })
);

export type ApiErrorItem = zInfer<typeof ApiErrorItemSchema>[number];

export const ApiErrorSchema = object({
  type: string(),
  title: string(),
  status: number(),
  instance: string(),
  traceId: string(),
  errors: ApiErrorItemSchema
});

export type ApiError = zInfer<typeof ApiErrorSchema>;

/**
 * Extends the standard HTTP error response to include
 * a strongly typed API error object.
 */
export class ApiErrorResponse extends HttpErrorResponse {
  constructor(init: {
    error: ApiError;
    headers?: HttpHeaders;
    status?: number;
    statusText?: string;
    url?: string;
  }) {
    super(init);
  }
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  readonly #appConfig = inject(APP_CONFIG);
  readonly #httpClient = inject(HttpClient);

  /**
   * Generates HTTP Headers with a single "Accept: application/json" header.
   */
  readonly acceptsJsonHeader = this.addJsonHeader('Accept');

  /**
   * Generates HTTP Headers with JSON content type and accept headers.
   */
  readonly jsonHeaders = this.addJsonHeader('Content-Type', this.acceptsJsonHeader);

  /**
   * Adds a JSON header to the provided HttpHeaders object.
   * If no HttpHeaders object is provided, a new one is created.
   *
   * @param key The header key to add ('Accept' or 'Content-Type').
   * @param headers The existing HttpHeaders object to add the header to.
   * @returns A new HttpHeaders object with the added JSON header.
   */
  addJsonHeader(
    key: 'Accept' | 'Content-Type',
    headers: HttpHeaders = new HttpHeaders()
  ): HttpHeaders {
    return headers.set(key, 'application/json');
  }

  /**
   * Creates a full URL by combining the base API URL with the provided path.
   *
   * @param path The endpoint path to append to the base URL.
   * @returns The full URL string.
   */
  private createUrl(path: string): string {
    let normalizedPath = path.startsWith('/') ? path : `/${path}`;

    const {
      api: { baseUrl, pathPrefix }
    } = this.#appConfig;

    if (pathPrefix) {
      normalizedPath = `${pathPrefix}${normalizedPath}`;
    }

    return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
  }

  /**
   * Sends a DELETE request to the specified API endpoint.
   */
  delete<Response = unknown>(path: string): Observable<Response> {
    const url = this.createUrl(path);

    return this.#httpClient.delete<Response>(url, { headers: this.acceptsJsonHeader });
  }

  /**
   * Sends a GET request to the specified API endpoint.
   */
  get<Response = unknown>(path: string): Observable<Response> {
    const url = this.createUrl(path);

    return this.#httpClient.get<Response>(url, { headers: this.acceptsJsonHeader });
  }

  /**
   * Attempts to extract error reasons from an API error response.
   * Returns a single 'Unknown error occurred' message if the provided
   * response isn't an HttpErrorResponse instance containing a
   * parsable error property.
   *
   * @param response The error response to extract reasons from.
   * @returns An array of error reason strings.
   */
  static getErrorResponseReasons(response: unknown): string[] {
    const errors: string[] = [];

    if (response instanceof HttpErrorResponse) {
      const error = response.error;

      if (ApiService.isApiError(error)) {
        errors.push(...error.errors.map(err => err.reason));
      } else if (isErrorLike(error)) {
        errors.push(error.message);
      } else if (isString(error)) {
        errors.push(error);
      } else {
        errors.push(
          `An unknown error occurred (status: ${response.status}).  Check the logs for details.`
        );
      }
    } else if (response instanceof $ZodError) {
      errors.push(
        ...response.issues.map(
          issue =>
            `Validation failed for field "${issue.path.join('.')}" with message: ${issue.message}`
        )
      );
    } else {
      errors.push('An unknown error occurred.  Check the logs for details.');
    }

    return errors;
  }

  /**
   * Validates that the provided value is a valid API error object.
   *
   * @param value The value to check.
   * @returns True if the value is a valid API error object, otherwise false.
   */
  static isApiError(error: unknown): error is ApiError {
    return ApiErrorSchema.safeParse(error).success;
  }

  /**
   * Sends a POST request to the specified API endpoint with the provided body.
   */
  post<Response = unknown>(path: string, body: object): Observable<Response> {
    const url = this.createUrl(path);

    return this.#httpClient.post<Response>(url, body, { headers: this.jsonHeaders });
  }

  /**
   * Sends a PUT request to the specified API endpoint with the provided body.
   * Optionally includes a Bearer token for authorization.
   */
  put<Response = unknown>(path: string, body: object): Observable<Response> {
    const url = this.createUrl(path);

    return this.#httpClient.put<Response>(url, body, { headers: this.jsonHeaders });
  }
}
