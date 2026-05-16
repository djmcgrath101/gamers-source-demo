import { InjectionToken } from '@angular/core';
import { MAT_CARD_CONFIG, MatCardConfig } from '@angular/material/card';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogConfig } from '@angular/material/dialog';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldDefaultOptions
} from '@angular/material/form-field';
import {
  MAT_PAGINATOR_DEFAULT_OPTIONS,
  MatPaginatorDefaultOptions
} from '@angular/material/paginator';
import {
  MAT_PROGRESS_BAR_DEFAULT_OPTIONS,
  MatProgressBarDefaultOptions
} from '@angular/material/progress-bar';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarConfig } from '@angular/material/snack-bar';
import { AngularProviderFeature } from '@gamers-source/shared-angular-utils';
import {
  MatSvgIconDefinition,
  MatSymbolName,
  MatSymbolStyle
} from '@gamers-source/shared-material-types';

export enum MaterialFeatureKind {
  CardOpts = 'CardOpts',
  DialogOpts = 'DialogOpts',
  FormFieldOpts = 'FormFieldOpts',
  Icons = 'Icons',
  PaginatorOpts = 'PaginatorOpts',
  ProgressBarOpts = 'ProgressBarOpts',
  SnackBarOpts = 'SnackBarOpts',
  SymbolsStyle = 'SymbolsStyle'
}

export type MaterialFeature<T extends MaterialFeatureKind> = AngularProviderFeature<T>;

export type MatCardOptsFeature = MaterialFeature<MaterialFeatureKind.CardOpts>;
export type MatDialogOptsFeature = MaterialFeature<MaterialFeatureKind.DialogOpts>;
export type MatFormFieldOptsFeature = MaterialFeature<MaterialFeatureKind.FormFieldOpts>;
export type MatIconsFeature = MaterialFeature<MaterialFeatureKind.Icons>;
export type MatPaginatorOptsFeature = MaterialFeature<MaterialFeatureKind.PaginatorOpts>;
export type MatProgressBarOptsFeature = MaterialFeature<MaterialFeatureKind.ProgressBarOpts>;
export type MatSnackBarOptsFeature = MaterialFeature<MaterialFeatureKind.SnackBarOpts>;
export type MatSymbolsStyleFeature = MaterialFeature<MaterialFeatureKind.SymbolsStyle>;

export type MaterialFeatures =
  | MatCardOptsFeature
  | MatDialogOptsFeature
  | MatFormFieldOptsFeature
  | MatIconsFeature
  | MatPaginatorOptsFeature
  | MatProgressBarOptsFeature
  | MatSnackBarOptsFeature
  | MatSymbolsStyleFeature;

/**
 * Creates a feature for configuring the default options
 * for the Angular Material card component.  Defaults to
 * setting the appearance to 'outlined'.
 *
 * @param opts The card options to use.
 * @returns The card options feature.
 * @see MatCardConfig - https://material.angular.dev/components/card/api#MatCardConfig
 *
 * @example
 * ```ts
 * import { withCardOpts } from '@gamers-source/material-core';
 *
 * export const appConfig: ApplicationConfig = {
 *  providers: [
 *     provideMaterial(withCardOpts({ appearance: 'outlined' }))
 *  ]
 * }
 * ```
 */
export function withCardOpts(opts: MatCardConfig): MatCardOptsFeature {
  return {
    kind: MaterialFeatureKind.CardOpts,
    providers: [
      {
        provide: MAT_CARD_CONFIG,
        useValue: opts
      }
    ]
  };
}

/**
 * Creates a feature for configuring the default options
 * for the Angular Material dialog component.
 *
 * @param opts The dialog options to use.
 * @returns The dialog options feature.
 * @see MatDialogConfig - https://material.angular.dev/components/dialog/api#MatDialogConfig
 *
 * @example
 * ```ts
 * import { withDialogOpts } from '@gamers-source/material-core';
 *
 * export const appConfig: ApplicationConfig = {
 *  providers: [
 *     provideMaterial(withDialogOpts({ disableClose: true }))
 *  ]
 * }
 * ```
 */
export function withDialogOpts(opts: MatDialogConfig): MatDialogOptsFeature {
  return {
    kind: MaterialFeatureKind.DialogOpts,
    providers: [
      {
        provide: MAT_DIALOG_DEFAULT_OPTIONS,
        useValue: opts
      }
    ]
  };
}

/**
 * Creates a feature for configuring the default options
 * for the Angular Material form field component.  Defaults
 * to setting the appearance to 'outline'.
 *
 * @param opts The form field options to use.
 * @returns The form field options feature.
 * @see MatFormFieldDefaultOptions - https://material.angular.dev/components/form-field/api#MatFormFieldDefaultOptions
 *
 * @example
 * ```ts
 * import { withFormFieldOpts } from '@gamers-source/material-core';
 *
 * export const appConfig: ApplicationConfig = {
 *  providers: [
 *     provideMaterial(withFormFieldOpts({ appearance: 'outline' }))
 *  ]
 * }
 * ```
 */
export function withFormFieldOpts(opts: MatFormFieldDefaultOptions): MatFormFieldOptsFeature {
  return {
    kind: MaterialFeatureKind.FormFieldOpts,
    providers: [
      {
        provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
        useValue: opts
      }
    ]
  };
}

export const MAT_ICONS = new InjectionToken<
  readonly ReadonlyArray<MatSymbolName | MatSvgIconDefinition>[]
>('MAT_ICONS');
/**
 * Creates a feature for registering symbols names and custom SVG icons with the Angular Material icon registry.
 * Svg icons can be provided as either FontAwesome icon definitions or custom SVG icon definitions.
 */
export function withIcons(
  ...icons: ReadonlyArray<MatSymbolName | MatSvgIconDefinition>
): MatIconsFeature {
  return {
    kind: MaterialFeatureKind.Icons,
    providers: [
      {
        provide: MAT_ICONS,
        useValue: icons,
        multi: true
      }
    ]
  };
}

/**
 * Creates a feature for configuring the default options
 * for the Angular Material paginator component.
 *
 * @param opts The paginator options to use.
 * @returns The paginator options feature.
 * @see MatPaginatorDefaultOptions - https://material.angular.dev/components/paginator/api#MatPaginatorDefaultOptions
 *
 * @example
 * ```ts
 * import { withPaginatorOpts } from '@gamers-source/material-core';
 *
 * export const appConfig: ApplicationConfig = {
 *  providers: [
 *     provideMaterial(withPaginatorOpts({ pageSize: 10 }))
 *  ]
 * }
 * ```
 */
export function withPaginatorOpts(opts: MatPaginatorDefaultOptions): MatPaginatorOptsFeature {
  return {
    kind: MaterialFeatureKind.PaginatorOpts,
    providers: [
      {
        provide: MAT_PAGINATOR_DEFAULT_OPTIONS,
        useValue: opts
      }
    ]
  };
}

/**
 * Creates a feature for configuring the default options
 * for the Angular Material progress bar component.  Defaults
 * to setting the mode to 'indeterminate'.
 *
 * @param opts The progress bar options to use.
 * @returns The progress bar options feature.
 * @see MatProgressBarDefaultOptions - https://material.angular.dev/components/progress-bar/api#MatProgressBarDefaultOptions
 *
 * @example
 * ```ts
 * import { withProgressBarOpts } from '@gamers-source/material-core';
 *
 * export const appConfig: ApplicationConfig = {
 *  providers: [
 *     provideMaterial(withProgressBarOpts({ mode: 'indeterminate' }))
 *  ]
 * }
 * ```
 */
export function withProgressBarOpts(opts: MatProgressBarDefaultOptions): MatProgressBarOptsFeature {
  return {
    kind: MaterialFeatureKind.ProgressBarOpts,
    providers: [
      {
        provide: MAT_PROGRESS_BAR_DEFAULT_OPTIONS,
        useValue: opts
      }
    ]
  };
}

/**
 * Creates a feature for configuring the default options
 * for the Angular Material snack bar component.
 *
 * @param opts The snackbar options to use.
 * @returns The snackbar options feature.
 * @see MatSnackBarDefaultOptions - https://material.angular.dev/components/snack-bar/api#MatSnackBarDefaultOptions
 *
 * @example
 * ```ts
 * import { withSnackBarOpts } from '@gamers-source/material-core';
 *
 * export const appConfig: ApplicationConfig = {
 *  providers: [
 *     provideMaterial(withSnackBarOpts({ duration: 3000 }))
 *  ]
 * }
 * ```
 */
export function withSnackBarOpts(opts: MatSnackBarConfig): MatSnackBarOptsFeature {
  return {
    kind: MaterialFeatureKind.SnackBarOpts,
    providers: [
      {
        provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
        useValue: opts
      }
    ]
  };
}

export const MAT_SYMBOLS_STYLE = new InjectionToken<MatSymbolStyle>('MAT_SYMBOLS_STYLE');
/**
 * Creates a feature for configuring the default font set class for Material Symbols icons.
 *
 * @param style The Material Symbols style to use (e.g., 'outlined', 'round', 'sharp').
 * @returns The symbols style feature.
 */
export function withSymbolsStyle(style: MatSymbolStyle): MatSymbolsStyleFeature {
  return {
    kind: MaterialFeatureKind.SymbolsStyle,
    providers: [
      {
        provide: MAT_SYMBOLS_STYLE,
        useValue: style
      }
    ]
  };
}
