import {
  appendProjectTypeToSourceRootPath,
  exportFileFromLibraryEntryPoint,
  isProjectOfType
} from '@gamers-source/nx-utils';
import {
  formatFiles,
  generateFiles,
  joinPathFragments,
  names,
  ProjectConfiguration,
  readProjectConfiguration,
  Tree
} from '@nx/devkit';
import { startCase } from 'lodash-es';
import { SIGNAL_STORE_VALID_PROJECT_TYPES } from '../signal-store/generator';
import {
  NormalizedSignalStoreFeatureGeneratorOptions,
  SignalStoreFeatureGeneratorOptions
} from './schema';

export async function signalStoreFeatureGenerator(
  tree: Tree,
  rawOptions: SignalStoreFeatureGeneratorOptions
) {
  const options = normalizeOpts(rawOptions);
  const projectConfig = readProjectConfiguration(tree, options.project);

  if (!isValidProjectType(projectConfig)) {
    throw new Error(
      `Invalid project type for Signal Store Feature: "${
        projectConfig.projectType
      }".  Expected one of: ${SIGNAL_STORE_VALID_PROJECT_TYPES.join(', ')}`
    );
  }

  const srcFilesRoot = appendProjectTypeToSourceRootPath(projectConfig);
  const { className, propertyName } = names(options.name);

  const targetDir = joinPathFragments(srcFilesRoot, options.directory);
  generateFiles(tree, joinPathFragments(__dirname, 'files'), targetDir, {
    ...options,
    className,
    propertyName,
    titleName: startCase(options.name),
    tmpl: ''
  });

  if (options.export) {
    const exportFileName = `${options.name}.feature.ts`;
    const filePath = joinPathFragments(targetDir, exportFileName);

    exportFileFromLibraryEntryPoint(tree, filePath, projectConfig);
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

function isValidProjectType(projectConfig: ProjectConfiguration): boolean {
  return isProjectOfType(projectConfig, ...SIGNAL_STORE_VALID_PROJECT_TYPES);
}

function normalizeOpts(
  options: SignalStoreFeatureGeneratorOptions
): NormalizedSignalStoreFeatureGeneratorOptions {
  return {
    ...options,
    directory: options.directory || 'features',
    export: options.export ?? true
  };
}

export default signalStoreFeatureGenerator;
