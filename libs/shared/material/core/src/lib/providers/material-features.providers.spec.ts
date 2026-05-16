import { MatSvgIconDefinition } from '@gamers-source/shared-material-types';
import {
  MAT_ICONS,
  MAT_SYMBOLS_STYLE,
  MaterialFeatureKind,
  withIcons,
  withSymbolsStyle
} from './material-features.providers';

describe('material-features.providers', () => {
  describe('withIcons', () => {
    it('returns a multi provider for icon definitions', () => {
      const iconDefinitions: readonly MatSvgIconDefinition[] = [
        {
          iconName: 'brand-mark',
          path: '/assets/icons/brand-mark.svg',
          prefix: 'app'
        }
      ];

      expect(withIcons(...iconDefinitions)).toEqual({
        kind: MaterialFeatureKind.Icons,
        providers: [
          {
            multi: true,
            provide: MAT_ICONS,
            useValue: iconDefinitions
          }
        ]
      });
    });
  });

  describe('withSymbolsStyle', () => {
    it('returns a provider for the Material Symbols style', () => {
      expect(withSymbolsStyle('sharp')).toEqual({
        kind: MaterialFeatureKind.SymbolsStyle,
        providers: [
          {
            provide: MAT_SYMBOLS_STYLE,
            useValue: 'sharp'
          }
        ]
      });
    });
  });
});
