import { Spectator, createComponentFactory } from '@ngneat/spectator/vitest';
import { PageNotFoundView } from './page-not-found.view';

describe('PageNotFoundView', () => {
  let spectator: Spectator<PageNotFoundView>;
  const createComponent = createComponentFactory(PageNotFoundView);

  beforeEach(() => (spectator = createComponent()));

  it('should create', () => {
    expect(spectator.fixture).toBeTruthy();
  });
});
