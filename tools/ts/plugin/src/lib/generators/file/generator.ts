import { exportFileFromLibraryEntryPoint, stripProjectTypeFromName } from '@gamers-source/nx-utils';
import {
  formatFiles,
  generateFiles,
  joinPathFragments,
  readProjectConfiguration,
  Tree
} from '@nx/devkit';
import { NormalizedTsFileGeneratorOptions, TsFileGeneratorOptions } from './schema';

export async function tsFileGenerator(tree: Tree, rawOptions: TsFileGeneratorOptions) {
  const options = normalizeOptions(rawOptions);
  const projectConfig = readProjectConfiguration(tree, options.project);

  let targetDir = joinPathFragments(projectConfig.root, 'src', 'lib');
  if (options.directory) targetDir = joinPathFragments(targetDir, options.directory);

  const fileName = `${stripProjectTypeFromName(options.name)}`;

  generateFiles(tree, joinPathFragments(__dirname, 'files', 'common'), targetDir, {
    ...options,
    fileName,
    tmpl: ''
  });

  if (options.addSpec) {
    generateFiles(tree, joinPathFragments(__dirname, 'files', 'spec'), targetDir, {
      ...options,
      fileName,
      tmpl: ''
    });
  }

  if (options.export) {
    const exportFileName = `${fileName}.${options.type}.ts`;
    const filePath = joinPathFragments(targetDir, exportFileName);

    exportFileFromLibraryEntryPoint(tree, filePath, projectConfig);
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

function normalizeOptions(rawOptions: TsFileGeneratorOptions): NormalizedTsFileGeneratorOptions {
  return {
    ...rawOptions,
    addSpec: rawOptions.addSpec ?? true,
    export: rawOptions.export ?? true
  };
}

export default tsFileGenerator;
