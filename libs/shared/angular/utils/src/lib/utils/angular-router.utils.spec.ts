import { NavigationRoute } from './angular-router.utils';

describe('NavigationRoute', () => {
  describe('fromUrl', () => {
    it('creates a route from URL path, query params, and fragment', () => {
      const url = new URL('https://example.com/dashboard/report?id=123&tab=summary#details');

      const result = NavigationRoute.fromUrl(url);

      expect(result.linkParams).toEqual(['/dashboard/report']);
      expect(result.extras).toEqual({
        fragment: '#details',
        queryParams: {
          id: '123',
          tab: 'summary'
        }
      });
    });

    it('sets no fragment and empty query params when the URL has neither', () => {
      const url = new URL('https://example.com/dashboard/report');

      const result = NavigationRoute.fromUrl(url);

      expect(result.linkParams).toEqual(['/dashboard/report']);
      expect(result.extras).toEqual({
        fragment: undefined,
        queryParams: {}
      });
    });
  });
});
