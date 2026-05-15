import { formatFiles, readNxJson, readProjectConfiguration, Tree, updateNxJson } from '@nx/devkit';
import { DefaultProjectGeneratorOptions } from './schema';

export async function setDefaultProjectGenerator(
  tree: Tree,
  options: DefaultProjectGeneratorOptions
) {
  readProjectConfiguration(tree, options.project);

  const nxJson = readNxJson(tree);
  if (!nxJson) {
    throw new Error('Could not read nx.json.');
  }

  nxJson.defaultProject = options.project;
  updateNxJson(tree, nxJson);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default setDefaultProjectGenerator;
