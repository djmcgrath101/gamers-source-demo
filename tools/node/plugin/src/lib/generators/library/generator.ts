import { tsLibraryGenerator } from '@gamers-source/ts-plugin';
import { formatFiles, Tree } from '@nx/devkit';
import { NodeLibraryGeneratorOptions } from './schema';

export async function nodeLibGenerator(tree: Tree, rawOptions: NodeLibraryGeneratorOptions) {
  await tsLibraryGenerator(tree, { ...rawOptions, scope: 'backend', skipFormat: true });

  if (!rawOptions.skipFormat) {
    await formatFiles(tree);
  }
}

export default nodeLibGenerator;
