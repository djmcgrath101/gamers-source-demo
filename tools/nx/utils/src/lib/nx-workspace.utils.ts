import { readJson, readNxJson, Tree } from '@nx/devkit';
import { PackageJson } from 'type-fest';

export function getRootPackageJson(tree: Tree): PackageJson | null {
  try {
    return readJson(tree, 'package.json') as PackageJson;
  } catch {
    return null;
  }
}

export function getWorkspaceLibsDir(tree: Tree): string {
  const nxJson = readNxJson(tree);

  return nxJson?.workspaceLayout?.libsDir || 'libs';
}

export function getWorkspaceScope(tree: Tree): string {
  const packageJson = getRootPackageJson(tree);
  const { name } = packageJson ?? {};
  const parts = name?.split('/');

  if (!name || !parts || parts.length < 2) {
    return 'gamers-source';
  }

  return parts[0].substring(1);
}
