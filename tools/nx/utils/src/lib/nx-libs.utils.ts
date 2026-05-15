import { joinPathFragments, logger, ProjectConfiguration, stripIndents, Tree } from '@nx/devkit';
import { dirname } from 'node:path';
import { getProjectSourceRoot } from './nx-projects.utils';
import { getRelativeImportToFile } from './nx-tree.utils';

/**
 * Adds an export statement for the specified file
 * to the bottom of the entry point for the specified
 * project.
 */
export function exportFileFromLibraryEntryPoint(
  tree: Tree,
  filePath: string,
  projectConfig: ProjectConfiguration
): void {
  const projectEntryPoint = getPathToLibEntryPointFile(tree, projectConfig);
  if (!projectEntryPoint) {
    logger.warn(
      `Could not locate the entry point for project '${projectConfig.name}'. Please manually export the new file if desired.`
    );
    return;
  }

  const relativeImportPath = getRelativeImportToFile(projectEntryPoint, filePath);
  const updateEntryPointContent = stripIndents`${tree.read(
    projectEntryPoint,
    'utf-8'
  )}export * from '${relativeImportPath}';`;

  tree.write(projectEntryPoint, updateEntryPointContent);
}

/**
 * Given a starting directory, traverses the directory
 * hierarchy recursively to locate the library entry point
 * (index.ts file), which is expected to be placed in the
 * project source root.  Returns null if the entry point
 * couldn't be located.
 *
 * @param tree - The file system tree
 * @param projectConfig - The project configuration
 * @param startingDir - The directory to start the search from
 *
 */
export function getPathToLibEntryPointFile(
  tree: Tree,
  projectConfig: ProjectConfiguration,
  startingDir = getProjectSourceRoot(projectConfig)
): string | null {
  const projectSourceRoot = getProjectSourceRoot(projectConfig);

  // Don't even bother looking for the entry point if the starting directory is outside the project source root
  if (!startingDir.startsWith(projectSourceRoot)) {
    logger.warn(
      `Starting directory '${startingDir}' is outside the project source root '${projectSourceRoot}'.  Aborting.`
    );
    return null;
  }

  if (startingDir === projectSourceRoot) {
    const indexFile = joinPathFragments(projectSourceRoot, 'index.ts');

    return tree.exists(indexFile) ? indexFile : null;
  } else {
    return getPathToLibEntryPointFile(tree, projectConfig, dirname(startingDir));
  }
}
