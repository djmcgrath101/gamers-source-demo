import { Injector, runInInjectionContext } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';
import { provideMockLogger } from '@gamers-source/shared-angular-testing';
import { injectLogger } from './angular-logger.utils';

describe('injectLogger', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockLogger()]
    });
  });

  it('injects a Logger instance using the TestClass name as the scope', inject(
    [Injector],
    (injector: Injector) => {
      class TestClass {}
      const logger = runInInjectionContext(injector, () => injectLogger(TestClass))!;
      expect(logger).toBeDefined();
      expect(logger.namespace).toContain('test-class');
    }
  ));

  it('injects a Logger instance using the provided string as the scope', inject(
    [Injector],
    (injector: Injector) => {
      const logger = runInInjectionContext(injector, () => injectLogger('CustomSource'))!;
      expect(logger).toBeDefined();
      expect(logger.namespace).toContain('custom-source');
    }
  ));
});
