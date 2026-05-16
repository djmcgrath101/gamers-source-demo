import { basename, dirname, join, relative } from 'node:path';

/**
 * Returns the relative path between two files.
 *
 * @param sourceFilePath - The path to the source file.
 * @param targetFilePath - The path to the target file.
 * @returns The relative path between the two files.
 */
export function getRelativePathBetweenFiles(
  sourceFilePath: string,
  targetFilePath: string
): string {
  const relativeDirToTarget = relative(dirname(sourceFilePath), dirname(targetFilePath));
  const importPath = join(relativeDirToTarget, basename(targetFilePath, '.ts'));

  // Normalize to use forward slashes for cross-platform compatibility
  const normalizedPath = importPath.replace(/\\/g, '/');

  return normalizedPath.startsWith('.') ? normalizedPath : `./${normalizedPath}`;
}
