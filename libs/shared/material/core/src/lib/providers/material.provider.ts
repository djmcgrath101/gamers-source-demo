import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer
} from '@angular/core';
import { mapFeaturesToProviders, mergeFeatures } from '@gamers-source/shared-angular-utils';
import { MatIconService } from '../services/mat-icon.service';
import {
  MAT_ICONS,
  MAT_SYMBOLS_STYLE,
  MaterialFeatures,
  withCardOpts,
  withDialogOpts,
  withFormFieldOpts,
  withPaginatorOpts,
  withProgressBarOpts,
  withSnackBarOpts,
  withSymbolsStyle
} from './material-features.providers';

/**
 * The default set of material component options common
 * to all applications. These can be overridden by providing
 * custom options using the `withXOpts` feature functions.
 */
export const DEFAULT_MATERIAL_FEATURES: readonly MaterialFeatures[] = [
  withCardOpts({ appearance: 'outlined' }),
  withDialogOpts({
    autoFocus: false,
    maxWidth: '496px',
    minWidth: '304px',
    panelClass: 'dialog-panel',
    width: '100%'
  }),
  withFormFieldOpts({ appearance: 'outline', color: 'accent' }),
  withPaginatorOpts({ formFieldAppearance: 'outline' }),
  withProgressBarOpts({ mode: 'indeterminate' }),
  withSnackBarOpts({
    duration: 3000,
    panelClass: 'snackbar-panel'
  }),
  withSymbolsStyle('outlined')
];

/**
 * Converts a list of material features into
 * environment providers that can be added to
 * an application's provider list.
 *
 * @param customFeatures Custom material features to include.
 * @returns The environment providers for the material features.
 * @example
 * ```ts
 * import { provideMaterial, withCardOpts } from '@gamers-source/material-core';
 *
 * export const appConfig: ApplicationConfig = {
 *  providers: [
 *     provideMaterial(withCardOpts({ appearance: 'outlined' }))
 *  ]
 * }
 * ```
 */
export function provideMaterial(...customFeatures: MaterialFeatures[]): EnvironmentProviders {
  const features = mergeFeatures(...DEFAULT_MATERIAL_FEATURES, ...customFeatures);

  return makeEnvironmentProviders([
    ...mapFeaturesToProviders(...features),
    provideAppInitializer(() => {
      const matIconService = inject(MatIconService);

      const symbolsStyle = inject(MAT_SYMBOLS_STYLE, { optional: true }) || 'outlined';
      matIconService.setSymbolsStyle(symbolsStyle);

      const icons = inject(MAT_ICONS, { optional: true }) || [];
      if (icons.length) matIconService.register(...icons.flat());
    })
  ]);
}
