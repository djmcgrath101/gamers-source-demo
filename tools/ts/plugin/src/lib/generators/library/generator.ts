import {
  getPathToLibEntryPointFile,
  isTestableProject,
  normalizeProjectOptions
} from '@gamers-source/nx-utils';
import { addTestTypesToTsConfig } from '@gamers-source/ts-utils';
import {
  formatFiles,
  generateFiles,
  joinPathFragments,
  logger,
  offsetFromRoot,
  readProjectConfiguration,
  Tree
} from '@nx/devkit';
import { libraryGenerator as nxTsLibraryGenerator } from '@nx/js';
import tsFileGenerator from '../file/generator';
import { NormalizedTsLibraryGeneratorOptions, TsLibraryGeneratorOptions } from './schema';

function normalizeOptions(options: TsLibraryGeneratorOptions): NormalizedTsLibraryGeneratorOptions {
  return {
    ...options,
    ...normalizeProjectOptions(options),
    checkDependencies: options.checkDependencies ?? false,
    unitTestRunner: options.unitTestRunner
      ? options.unitTestRunner
      : isTestableProject(options.type)
        ? 'vitest'
        : 'none'
  };
}

/**
 * Creates a TypeScript library and applies workspace-specific defaults/templates.
 */
export async function tsLibraryGenerator(tree: Tree, rawOptions: TsLibraryGeneratorOptions) {
  const options = normalizeOptions(rawOptions);

  if (options.scope === 'frontend') {
    logger.warn(
      `Use the @gamers-source/angular-plugin:library generator to generate frontend libraries`
    );
    return;
  }

  await nxTsLibraryGenerator(tree, options);

  const projectConfig = readProjectConfiguration(tree, options.name);

  // We want to make globally available the types for the test runner being used.
  // These would normally be added to the `tsconfig.spec.json` file, but since testing
  // libraries aren't testable by default, they don't have that file. Adding the types
  // to `tsconfig.lib.json` ensures that they are available regardless of whether the
  // library is testable or not.
  if (options.type === 'testing') {
    addTestTypesToTsConfig(tree, projectConfig, options.unitTestRunner);
  }

  generateFiles(tree, joinPathFragments(__dirname, 'files'), projectConfig.root, {
    ...options,
    offsetFromRoot: offsetFromRoot(projectConfig.root),
    tmpl: ''
  });

  // Remove the default boilerplate files and export before generating
  // the custom files.
  const srcLibPath = joinPathFragments(projectConfig.root, 'src', 'lib');
  for (const file of tree.children(srcLibPath)) {
    tree.delete(joinPathFragments(srcLibPath, file));
  }
  const entryPointPath = getPathToLibEntryPointFile(tree, projectConfig)!;
  tree.write(entryPointPath, '');

  await tsFileGenerator(tree, {
    name: options.name,
    type: options.type,
    project: options.name,
    addSpec: isTestableProject(options.type),
    skipFormat: true
  });

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default tsLibraryGenerator;
