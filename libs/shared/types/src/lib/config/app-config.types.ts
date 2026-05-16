import { SetRequired } from 'type-fest';
import { ApiConfig } from './api-config.types';
import { ThemeName, ThemesConfig } from './themes-config.types';

export interface AppConfig {
  readonly api?: ApiConfig;
  /**
   * A relatively short two to twelve letter code to identify the application.
   * The code is expected to be a single word consisting of uppercase
   * letters and underscores.
   */
  readonly code?: string;
  /**
   * The name of the application
   */
  readonly name: string;
  /**
   * Optional configuration for application themes.  If not provided, the application
   * will use the system color scheme preference and will not provide any options for changing
   * the theme.  If provided, the application will use the specified active theme and provide
   * options for changing the theme based on the provided themes.
   */
  readonly theme?: ThemeName | ThemesConfig;
}

export type AppTheme = AppConfig['theme'];

/**
 * The normalized application configuration with all optional properties
 * made required and with any necessary normalization applied.  This is the
 * configuration that will be used internally by the application, so it can be
 * assumed that all properties are present and correctly formatted.
 */
export type NormalizedAppConfig = SetRequired<AppConfig, 'api' | 'code'>;
