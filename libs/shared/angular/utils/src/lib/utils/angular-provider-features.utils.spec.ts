import { Mock } from 'vitest';
import {
  AngularProviderFeature,
  mapFeaturesToProviders,
  mergeFeatures
} from './angular-provider-features.utils';
import { isMixedMultiProviders } from './angular-providers.utils';

// Mock utility function
vitest.mock('./angular-providers.utils', () => ({
  isMixedMultiProviders: vitest.fn()
}));

describe('angular-provider-features.utils', () => {
  describe('mapFeaturesToProviders', () => {
    it('returns an empty array when no features are provided', () => {
      const result = mapFeaturesToProviders();
      expect(result).toEqual([]);
    });

    it('returns an empty array when features have no providers', () => {
      const features: AngularProviderFeature[] = [
        { kind: 'feature1', providers: [] },
        { kind: 'feature2', providers: [] }
      ];

      const result = mapFeaturesToProviders(...features);
      expect(result).toEqual([]);
    });

    it('maps providers from a single feature', () => {
      const providers: any[] = [{ provide: 'A' }, { provide: 'B' }];
      const features: AngularProviderFeature[] = [{ kind: 'feature1', providers }];

      const result = mapFeaturesToProviders(...features);
      expect(result).toEqual(providers);
    });

    it('maps providers from multiple features', () => {
      const feature1Providers: any[] = [{ provide: 'A' }];
      const feature2Providers: any[] = [{ provide: 'B' }, { provide: 'C' }];
      const features: AngularProviderFeature[] = [
        { kind: 'feature1', providers: feature1Providers },
        { kind: 'feature2', providers: feature2Providers }
      ];

      const result = mapFeaturesToProviders(...features);
      expect(result).toEqual([...feature1Providers, ...feature2Providers]);
    });

    it('handles features with mixed empty and non-empty providers', () => {
      const feature1Providers: any[] = [];
      const feature2Providers: any[] = [{ provide: 'A' }];
      const features: AngularProviderFeature[] = [
        { kind: 'feature1', providers: feature1Providers },
        { kind: 'feature2', providers: feature2Providers }
      ];

      const result = mapFeaturesToProviders(...features);
      expect(result).toEqual(feature2Providers);
    });
  });

  describe('mergeFeatures', () => {
    it('merges unique features', () => {
      const feature1: AngularProviderFeature = {
        kind: 'feature1',
        providers: [{ provide: 'Token1', useValue: 'Value1' }]
      };
      const feature2: AngularProviderFeature = {
        kind: 'feature2',
        providers: [{ provide: 'Token2', useValue: 'Value2' }]
      };

      const result = mergeFeatures(feature1, feature2);

      expect(result).toEqual([feature1, feature2]);
    });

    it('replaces a feature with the same kind if non-multi providers exist', () => {
      const feature1: AngularProviderFeature = {
        kind: 'feature1',
        providers: [{ provide: 'Token1', useValue: 'Value1' }]
      };
      const feature2: AngularProviderFeature = {
        kind: 'feature1',
        providers: [{ provide: 'Token2', useValue: 'Value2' }]
      };

      const result = mergeFeatures(feature1, feature2);

      expect(result).toEqual([feature2]);
    });

    it('throws an error for mixed multi and non-multi providers', () => {
      const feature1: AngularProviderFeature = {
        kind: 'feature1',
        providers: [{ provide: 'Token1', useValue: 'Value1' }]
      };
      const feature2: AngularProviderFeature = {
        kind: 'feature1',
        providers: [{ provide: 'Token2', useValue: 'Value2', multi: true }]
      };

      (isMixedMultiProviders as Mock).mockReturnValue(true);

      expect(() => mergeFeatures(feature1, feature2)).toThrow(
        'Cannot mix multi and non-multi providers in the same feature'
      );
    });

    it('allows multiple features with only multi providers', () => {
      const feature1: AngularProviderFeature = {
        kind: 'feature1',
        providers: [{ provide: 'Token1', useValue: 'Value1', multi: true }]
      };
      const feature2: AngularProviderFeature = {
        kind: 'feature1',
        providers: [{ provide: 'Token2', useValue: 'Value2', multi: true }]
      };

      (isMixedMultiProviders as Mock).mockReturnValue(false);

      const result = mergeFeatures(feature1, feature2);

      expect(result).toEqual([feature1, feature2]);
    });

    it('handles an empty input gracefully', () => {
      const result = mergeFeatures();
      expect(result).toEqual([]);
    });

    it('handles unique features with no providers', () => {
      const feature1: AngularProviderFeature = { kind: 'feature1', providers: [] };
      const feature2: AngularProviderFeature = { kind: 'feature2', providers: [] };

      const result = mergeFeatures(feature1, feature2);

      expect(result).toEqual([feature1, feature2]);
    });

    it('handles duplicate features with no providers', () => {
      const feature1: AngularProviderFeature = { kind: 'feature1', providers: [] };
      const feature2: AngularProviderFeature = { kind: 'feature1', providers: [] };

      const result = mergeFeatures(feature1, feature2);

      expect(result).toEqual([feature2]); // The second feature replaces the first
    });
  });
});
