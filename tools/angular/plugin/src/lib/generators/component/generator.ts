import { appendProjectTypeToSourceRootPath } from '@gamers-source/nx-utils';
import { componentGenerator as nxComponentGenerator } from '@nx/angular/generators';
import {
  formatFiles,
  joinPathFragments,
  ProjectConfiguration,
  readProjectConfiguration,
  Tree
} from '@nx/devkit';
import { NgComponentGeneratorOptions, NormalizedNgComponentOptions } from './schema';

/**
 * Generates an Angular component in the workspace-standard project source folder.
 */
export async function ngComponentGenerator(
  tree: Tree,
  rawOptions: NgComponentGeneratorOptions
): Promise<void> {
  const projectConfig = readProjectConfiguration(tree, rawOptions.project);
  const opts = normalizeOpts(rawOptions, projectConfig);

  await nxComponentGenerator(tree, {
    ...opts,
    path: joinPathFragments(opts.path, opts.name)
  });

  if (!rawOptions.skipFormat) {
    await formatFiles(tree);
  }
}

function normalizeOpts(
  schema: NgComponentGeneratorOptions,
  projectConfig: ProjectConfiguration
): NormalizedNgComponentOptions {
  let path = appendProjectTypeToSourceRootPath(projectConfig);

  if (schema.path) {
    path = joinPathFragments(path, schema.path);
  }

  return {
    ...schema,
    path
  };
}

export default ngComponentGenerator;
