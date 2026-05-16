import { TestBed } from '@angular/core/testing';
import { PageNotFoundView } from './page-not-found.view';

describe('PageNotFoundView', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PageNotFoundView]
    });
    TestBed.overrideComponent(PageNotFoundView, {
      set: {
        styles: []
      }
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PageNotFoundView);

    expect(fixture).toBeTruthy();
  });
});
