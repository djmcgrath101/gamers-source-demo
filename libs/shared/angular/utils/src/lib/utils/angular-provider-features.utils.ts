import { EnvironmentProviders, Provider } from '@angular/core';
import { isMixedMultiProviders } from './angular-providers.utils';

/**
 * Defines the type for an Angular provider feature and an array
 * of providers that belong to that feature.
 */
export type AngularProviderFeature<
  KindT extends string = string,
  ProviderT extends EnvironmentProviders | Provider = EnvironmentProviders | Provider
> = {
  readonly kind: KindT;
  readonly providers: readonly ProviderT[];
};

/**
 * Maps a collection of features to the collection of providers belonging
 * to those features.
 */
export function mapFeaturesToProviders<T extends EnvironmentProviders | Provider>(
  ...features: readonly AngularProviderFeature<string, T>[]
): T[] {
  return features.map(f => f.providers).flat();
}

/**
 * Merges a collection of features into a single features collection.
 * If a feature with the same kind already exists, it will be replaced.
 * If a feature with the same kind already exists and all its providers
 * are multi, the new feature will be added.
 */
export function mergeFeatures(
  ...features: readonly AngularProviderFeature[]
): readonly AngularProviderFeature[] {
  return features.reduce((acc, curr) => {
    if (isMixedMultiProviders(...curr.providers)) {
      throw new Error('Cannot mix multi and non-multi providers in the same feature');
    }

    const existingFeatureIdx = acc.findIndex(f => f.kind === curr.kind);

    if (existingFeatureIdx === -1) {
      return [...acc, curr];
    } else {
      const existingFeature = acc[existingFeatureIdx] as AngularProviderFeature;

      if (
        existingFeature.providers.length &&
        existingFeature.providers.every(p => 'multi' in p && p.multi)
      ) {
        return [...acc, curr]; // Allow multiple features when multi
      } else {
        // Replace the existing feature
        return [...acc.slice(0, existingFeatureIdx), curr, ...acc.slice(existingFeatureIdx + 1)];
      }
    }
  }, [] as readonly AngularProviderFeature[]);
}
