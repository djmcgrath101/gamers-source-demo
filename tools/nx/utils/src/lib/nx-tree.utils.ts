import {
  joinPathFragments,
  ProjectConfiguration,
  readProjectConfiguration,
  Tree
} from '@nx/devkit';
import { isString } from 'lodash-es';
import { basename, dirname, relative } from 'node:path';

/**
 * Determines the relative import path between two files.
 * The from parameter is expected to be the path to a file
 * in a parent directory or the same directory as the
 * to parameter.
 */
export function getRelativeImportToFile(from: string, to: string): string {
  const relativeDirToTarget = relative(dirname(from), dirname(to));

  return `./${joinPathFragments(relativeDirToTarget, basename(to, '.ts'))}`;
}

/**
 * Gets the relative path between the root directory of two projects.
 */
export function getRelativePathBetweenProjects(
  tree: Tree,
  srcConfigOrName: ProjectConfiguration | string,
  targetConfigOrName: ProjectConfiguration | string
): string {
  const fromConfig = isString(srcConfigOrName)
    ? readProjectConfiguration(tree, srcConfigOrName)
    : srcConfigOrName;
  const toConfig = isString(targetConfigOrName)
    ? readProjectConfiguration(tree, targetConfigOrName)
    : targetConfigOrName;

  return relative(fromConfig.root, toConfig.root);
}

/**
 * Determines whether the given directory is empty.
 */
export function isEmptyDir(tree: Tree, dir: string): boolean {
  return !tree.exists(dir) || tree.children(dir).length === 0;
}

/**
 * Recursively lists all the file paths from the given directory
 * and subdirectories.
 *
 * @param tree - The virtual file system tree.
 * @param dir - The directory to read files from.
 * @returns An array of all the file paths.
 */
export function listFilesRecursively(tree: Tree, dir: string): readonly string[] {
  const files = [];

  if (tree.exists(dir)) {
    for (const child of tree.children(dir)) {
      const path = joinPathFragments(dir, child);

      if (tree.isFile(path)) {
        files.push(path);
      } else {
        files.push(...listFilesRecursively(tree, path));
      }
    }
  }

  return files;
}
