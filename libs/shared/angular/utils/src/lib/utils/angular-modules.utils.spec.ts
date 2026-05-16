import { NgModule } from '@angular/core';
import { throwIfAlreadyLoaded } from './angular-modules.utils';

describe('angular-modules.utils', () => {
  describe('throwIfAlreadyLoaded', () => {
    it('should not throw error if module has not been loaded', () => {
      const test = vitest.fn(() => {
        throwIfAlreadyLoaded(false as unknown as NgModule, '');
      });

      expect(test).not.toThrow();
    });

    it('should throw error if module has been loaded', () => {
      class TestModule {}
      const instance = new TestModule();

      const test = vitest.fn(() => {
        throwIfAlreadyLoaded(instance, 'TestModule');
      });

      expect(test).toThrow(
        'TestModule has already been loaded. Core modules can only be imported once.'
      );
    });
  });
});
