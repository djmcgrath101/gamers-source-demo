import { NxProjectUnitTestRunner } from '@gamers-source/nx-types';
import { joinPathFragments, type ProjectConfiguration, type Tree, updateJson } from '@nx/devkit';
import { TsConfigJson } from 'type-fest';

/**
 * Adds the selected unit test runner's ambient types to a library tsconfig.
 */
export function addTestTypesToTsConfig(
  tree: Tree,
  projectConfig: ProjectConfiguration,
  testRunner: NxProjectUnitTestRunner
): void {
  if (testRunner === 'none') {
    return;
  }

  const tsConfigLibPath = joinPathFragments(projectConfig.root, 'tsconfig.lib.json');
  const tsConfigLib = JSON.parse(tree.read(tsConfigLibPath, 'utf-8')!);
  const testRunnerTypes = testRunner.includes('vitest')
    ? ['vitest/globals', 'vitest/importMeta', 'vite/client', 'vitest']
    : [testRunner];

  tsConfigLib.compilerOptions ??= {};
  tsConfigLib.compilerOptions.types = Array.from(
    new Set([...(tsConfigLib.compilerOptions.types || []), ...testRunnerTypes])
  );

  tree.write(tsConfigLibPath, JSON.stringify(tsConfigLib, null, 2));
}

/**
 * Sorts the root TypeScript path aliases alphabetically while preserving their mapped values.
 */
export function sortTsConfigBasePaths(tree: Tree): void {
  const TS_CONFIG_BASE_PATH = 'tsconfig.base.json';

  if (!tree.exists(TS_CONFIG_BASE_PATH)) {
    return;
  }

  updateJson<TsConfigJson>(tree, TS_CONFIG_BASE_PATH, tsConfig => {
    const paths = tsConfig.compilerOptions?.paths;

    if (!paths) {
      return tsConfig;
    }

    tsConfig.compilerOptions!.paths = Object.fromEntries(
      Object.entries(paths).sort(([leftAlias], [rightAlias]) => leftAlias.localeCompare(rightAlias))
    );

    return tsConfig;
  });
}
