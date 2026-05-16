import { type ProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { addTestTypesToTsConfig } from './ts-tools.utils';

describe('addTestTypesToTsConfig', () => {
  let projectConfig: ProjectConfiguration;
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    projectConfig = {
      name: 'auth-testing',
      root: 'libs/auth/testing'
    };
  });

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

  function readTsConfigLib() {
    return JSON.parse(tree.read(`${projectConfig.root}/tsconfig.lib.json`, 'utf-8')!);
  }

  function writeTsConfigLib(tsConfig: object): void {
    tree.write(`${projectConfig.root}/tsconfig.lib.json`, JSON.stringify(tsConfig, null, 2));
  }
});
