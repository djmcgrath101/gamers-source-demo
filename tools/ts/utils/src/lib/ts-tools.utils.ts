import { joinPathFragments, type ProjectConfiguration, type Tree } from '@nx/devkit';

export type TestTypesRunner = 'jest' | 'vitest' | 'vitest-angular' | 'vitest-analog' | 'none';

/**
 * Adds the selected unit test runner's ambient types to a library tsconfig.
 */
export function addTestTypesToTsConfig(
  tree: Tree,
  projectConfig: ProjectConfiguration,
  testRunner: TestTypesRunner
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
