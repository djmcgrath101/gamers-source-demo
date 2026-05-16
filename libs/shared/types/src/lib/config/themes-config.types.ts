import { KebabCaseString } from '../strings.types';

/**
 * Interface for a single application theme.
 */
export interface ThemeConfig {
  /**
   * The name of the theme.  This must be a valid CSS class name in kebab case.
   * The `-theme` suffix will be automatically appended to the name when applying
   * the theme.
   */
  readonly name: ThemeName;
  /**
   * A human readable name for user selection of the theme.  This can be any string,
   * but should be relatively short for display purposes.  Provide a string instead
   * of an object to use the theme name converted to title case as the display name.
   */
  readonly displayName: string;
}

/**
 * The name of a theme must be a valid CSS class name
 * in kebab case.  The `-theme` suffix will be automatically
 * appended to the name.
 */
export type ThemeName =
  // the color scheme preferred by the user's OS
  // or user agent.
  'system' | KebabCaseString;

/**
 * Configuration for multiple application UI themes.
 * The `active` theme will be applied by default.
 */
export interface ThemesConfig {
  readonly active: ThemeName;
  /**  When only the theme names are provided, the display name
   will be the name converted to title case.*/
  readonly themes: ReadonlyArray<ThemeName | ThemeConfig>;
}
