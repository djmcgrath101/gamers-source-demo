import { type ProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { addTestTypesToTsConfig, sortTsConfigBasePaths } from './ts-tools.utils';

describe('ts-tools.utils', () => {
  let projectConfig: ProjectConfiguration;
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    projectConfig = {
      name: 'auth-testing',
      root: 'libs/auth/testing'
    };
  });

  describe('addTestTypesToTsConfig', () => {
    it('adds jest to compiler options types', () => {
      writeTsConfigLib({
        compilerOptions: {
          types: []
        }
      });

      addTestTypesToTsConfig(tree, projectConfig, 'jest');

      expect(readTsConfigLib().compilerOptions.types).toEqual(['jest']);
    });

    it('adds vitest type packages for vitest-based runners', () => {
      writeTsConfigLib({
        compilerOptions: {
          types: ['node']
        }
      });

      addTestTypesToTsConfig(tree, projectConfig, 'vitest-angular');

      expect(readTsConfigLib().compilerOptions.types).toEqual([
        'node',
        'vitest/globals',
        'vitest/importMeta',
        'vite/client',
        'vitest'
      ]);
    });

    it('does not duplicate existing compiler option types', () => {
      writeTsConfigLib({
        compilerOptions: {
          types: ['vitest/globals', 'vite/client']
        }
      });

      addTestTypesToTsConfig(tree, projectConfig, 'vitest-analog');

      expect(readTsConfigLib().compilerOptions.types).toEqual([
        'vitest/globals',
        'vite/client',
        'vitest/importMeta',
        'vitest'
      ]);
    });

    it('does not update tsconfig when the test runner is none', () => {
      writeTsConfigLib({
        compilerOptions: {
          types: ['node']
        }
      });

      addTestTypesToTsConfig(tree, projectConfig, 'none');

      expect(readTsConfigLib().compilerOptions.types).toEqual(['node']);
    });
  });

  describe('sortTsConfigBasePaths', () => {
    it('sorts path aliases alphabetically', () => {
      writeTsConfigBase({
        compilerOptions: {
          paths: {
            '@gamers-source/zeta': ['./libs/zeta/src/index.ts'],
            '@gamers-source/alpha': ['./libs/alpha/src/index.ts'],
            '@gamers-source/beta': ['./libs/beta/src/index.ts']
          }
        }
      });

      sortTsConfigBasePaths(tree);

      expect(Object.keys(readTsConfigBase().compilerOptions.paths)).toEqual([
        '@gamers-source/alpha',
        '@gamers-source/beta',
        '@gamers-source/zeta'
      ]);
    });

    it('preserves mapped path values when sorting aliases', () => {
      writeTsConfigBase({
        compilerOptions: {
          paths: {
            '@gamers-source/zeta': [
              './libs/zeta/src/index.ts',
              './libs/zeta/src/public-api.ts'
            ],
            '@gamers-source/alpha': ['./libs/alpha/src/index.ts']
          }
        }
      });

      sortTsConfigBasePaths(tree);

      expect(readTsConfigBase().compilerOptions.paths).toEqual({
        '@gamers-source/alpha': ['./libs/alpha/src/index.ts'],
        '@gamers-source/zeta': ['./libs/zeta/src/index.ts', './libs/zeta/src/public-api.ts']
      });
    });

    it('does not update tsconfig when path aliases are not configured', () => {
      writeTsConfigBase({
        compilerOptions: {
          strict: true
        }
      });

      sortTsConfigBasePaths(tree);

      expect(readTsConfigBase()).toEqual({
        compilerOptions: {
          strict: true
        }
      });
    });
  });

  function readTsConfigBase() {
    return JSON.parse(tree.read('tsconfig.base.json', 'utf-8')!);
  }

  function readTsConfigLib() {
    return JSON.parse(tree.read(`${projectConfig.root}/tsconfig.lib.json`, 'utf-8')!);
  }

  function writeTsConfigBase(tsConfig: object): void {
    tree.write('tsconfig.base.json', JSON.stringify(tsConfig, null, 2));
  }

  function writeTsConfigLib(tsConfig: object): void {
    tree.write(`${projectConfig.root}/tsconfig.lib.json`, JSON.stringify(tsConfig, null, 2));
  }
});
