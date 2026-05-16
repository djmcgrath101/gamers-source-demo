import { ApiConfig, AppConfig, NormalizedAppConfig } from '@gamers-source/shared-types';
import { isValidHttpUrl } from '../url.utils';

/**
 * Normalizes the application configuration by ensuring required fields are present
 * and correctly formatted.
 */
export function normalizeAppConfig(config: AppConfig): NormalizedAppConfig {
  return {
    ...config,
    api: normalizeApiConfig(config.api),
    code: normalizeAppCode(config.code, config.name)
  };
}

/**
 * Normalizes the API configuration by ensuring the base URL and path prefix
 * are correctly formatted.
 */
export function normalizeApiConfig(config: ApiConfig | undefined): ApiConfig {
  let api: ApiConfig = {};

  if (config) {
    let { baseUrl, pathPrefix } = config;

    if (baseUrl) {
      if (!isValidHttpUrl(baseUrl)) {
        // Throwing here because this is a critical misconfiguration that will render
        // the app non-functional.
        throw new Error(
          `API base URL "${baseUrl}" is invalid. It must be a valid URL with HTTP or HTTPS scheme.`
        );
      }

      // Remove trailing slash if present
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }

      api = { ...api, baseUrl };
    }

    if (pathPrefix) {
      // Ensure pathPrefix starts with a leading slash but does not end with a trailing slash
      if (!pathPrefix.startsWith('/')) {
        pathPrefix = `/${pathPrefix}`;
      }
      if (pathPrefix.endsWith('/')) {
        pathPrefix = pathPrefix.slice(0, -1);
      }

      api = { ...api, pathPrefix };
    }
  }

  return api;
}

/**
 * Normalizes the application code by ensuring it is uppercase and trimmed.
 * If no code is provided, generates one from the project name.
 */
export function normalizeAppCode(code: string | undefined, projectName: string): string {
  return (code || projectName.slice(0, 3)).trim().toUpperCase();
}

/**
 * Validates the application code format.
 */
export function isValidAppCode(appCode: string): boolean {
  // accepts a single word consisting of uppercase letters and underscores
  return /^[A-Z_]{2,12}$/.test(appCode);
}
