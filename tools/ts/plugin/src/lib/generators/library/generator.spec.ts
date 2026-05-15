import { joinPathFragments, logger, readProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { vi } from 'vitest';
import tsLibraryGenerator from './generator';

describe('ts-lib generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('blocks frontend utils libraries', async () => {
    const loggerErrorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});

    await tsLibraryGenerator(tree, {
      name: 'date',
      scope: 'frontend',
      type: 'utils'
    });

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Use the @gamers-source/angular-plugin:library generator to generate frontend utils libraries'
    );
    expect(() => readProjectConfiguration(tree, 'date-utils')).toThrow();
  });

  it('generates a utils library and replaces default boilerplate with ts-file output', async () => {
    await tsLibraryGenerator(tree, {
      name: 'date',
      scope: 'shared',
      type: 'utils',
      skipFormat: true
    });

    const projectConfig = readProjectConfiguration(tree, 'date-utils');
    const srcLibPath = joinPathFragments(projectConfig.root, 'src', 'lib');
    const eslintPath = joinPathFragments(projectConfig.root, 'eslint.config.mjs');

    expect(projectConfig.root).toBe('libs/date/utils');
    expect(tree.exists(joinPathFragments(srcLibPath, 'date.utils.ts'))).toBe(true);
    expect(tree.exists(joinPathFragments(srcLibPath, 'date.utils.spec.ts'))).toBe(true);
    expect(tree.exists(joinPathFragments(srcLibPath, 'date-utils.ts'))).toBe(false);

    expect(tree.exists(eslintPath)).toBe(true);
    expect(tree.read(eslintPath, 'utf-8')).not.toContain('@nx/dependency-checks');

    const indexFilePath = joinPathFragments(projectConfig.root, 'src', 'index.ts');
    const indexFile = tree.read(indexFilePath, 'utf-8');
    expect(indexFile).toContain(`export * from './lib/date.utils';`);
  });

  it('defaults types libraries to no spec generation and no test target', async () => {
    await tsLibraryGenerator(tree, {
      name: 'contracts',
      scope: 'shared',
      type: 'types',
      skipFormat: true
    });

    const projectConfig = readProjectConfiguration(tree, 'contracts-types');
    const srcLibPath = joinPathFragments(projectConfig.root, 'src', 'lib');

    expect(tree.exists(joinPathFragments(srcLibPath, 'contracts.types.ts'))).toBe(true);
    expect(tree.exists(joinPathFragments(srcLibPath, 'contracts.types.spec.ts'))).toBe(false);
    expect(projectConfig.targets?.test).toBeUndefined();
  });

  it('adds dependency checks to eslint config when enabled', async () => {
    // A standard testing library should normalize silently unless
    // buildable was explicitly requested.
    const loggerWarnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

    await tsLibraryGenerator(tree, {
      name: 'auth',
      scope: 'backend',
      type: 'testing',
      checkDependencies: true,
      skipFormat: true
    });

    const projectConfig = readProjectConfiguration(tree, 'auth-testing');
    const eslintPath = joinPathFragments(projectConfig.root, 'eslint.config.mjs');
    const eslintConfig = tree.read(eslintPath, 'utf-8');

    expect(eslintConfig).toContain('@nx/dependency-checks');
    expect(eslintConfig).toContain('jsonc-eslint-parser');
    expect(loggerWarnSpy).not.toHaveBeenCalled();
  });

  it('adds vitest to tsconfig compiler types for testing libraries', async () => {
    await tsLibraryGenerator(tree, {
      name: 'auth',
      scope: 'backend',
      type: 'testing',
      unitTestRunner: 'vitest',
      skipFormat: true
    });

    const projectConfig = readProjectConfiguration(tree, 'auth-testing');
    const tsConfigLibPath = joinPathFragments(projectConfig.root, 'tsconfig.lib.json');
    const tsConfigLib = JSON.parse(tree.read(tsConfigLibPath, 'utf-8')!);

    expect(tsConfigLib.compilerOptions.types).toEqual(
      expect.arrayContaining(['vitest/globals', 'vitest/importMeta', 'vite/client', 'vitest'])
    );
  });

  it('warns when a testing library is requested as buildable', async () => {
    const loggerWarnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

    await tsLibraryGenerator(tree, {
      name: 'auth',
      scope: 'backend',
      type: 'testing',
      buildable: true,
      skipFormat: true
    });

    expect(loggerWarnSpy).toHaveBeenCalledWith(
      'The "testing" library type cannot be buildable. Setting buildable to false for project "auth-testing".'
    );
  });
});
