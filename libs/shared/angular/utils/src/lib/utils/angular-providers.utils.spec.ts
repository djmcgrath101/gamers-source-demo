import { isMixedMultiProviders } from './angular-providers.utils';

describe('angular-providers.utils', () => {
  describe('isMixedMultiProviders', () => {
    let providers: any[];

    it('returns false if all providers are not multi', () => {
      providers = [{ provide: 'A' }, { provide: 'B' }];
      expect(isMixedMultiProviders(...providers)).toBe(false);
    });

    it('returns false if all providers are multi', () => {
      providers = [
        { provide: 'A', multi: true },
        { provide: 'B', multi: true }
      ];
      expect(isMixedMultiProviders(...providers)).toBe(false);
    });

    it('returns true if there is a mix of multi and non-multi providers', () => {
      providers = [{ provide: 'A', multi: true }, { provide: 'B' }];
      expect(isMixedMultiProviders(...providers)).toBe(true);
    });
  });
});
