import { NxProjectScope, NxProjectType } from '@gamers-source/nx-types';
import { normalizeProjectOptions } from '@gamers-source/nx-utils';
import {
  formatFiles,
  generateFiles,
  joinPathFragments,
  offsetFromRoot,
  readProjectConfiguration,
  Tree
} from '@nx/devkit';
import { pluginGenerator } from '@nx/plugin/generators';
import { NormalizedNxPluginGeneratorOptions, NxPluginGeneratorOptions } from './schema';

function normalizeOptions(options: NxPluginGeneratorOptions): NormalizedNxPluginGeneratorOptions {
  const scope: NxProjectScope = 'tools';
  const type: NxProjectType = 'plugin';

  return {
    ...options,
    ...normalizeProjectOptions({ ...options, buildable: true, scope, type }),
    checkDependencies: options.checkDependencies ?? false,
    directory: joinPathFragments(
      options.directory || joinPathFragments('tools', options.name, 'plugin')
    )
  };
}

/**
 * Creates an Nx plugin project using workspace defaults and plugin-specific file/template updates.
 */
export async function nxPluginGenerator(tree: Tree, rawOptions: NxPluginGeneratorOptions) {
  const options = normalizeOptions(rawOptions);
  const callback = await pluginGenerator(tree, options);

  const projectConfig = readProjectConfiguration(tree, options.name);
  generateFiles(tree, joinPathFragments(__dirname, 'files'), projectConfig.root, {
    ...options,
    offsetFromRoot: offsetFromRoot(projectConfig.root),
    tmpl: ''
  });

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return callback;
}

export default nxPluginGenerator;
