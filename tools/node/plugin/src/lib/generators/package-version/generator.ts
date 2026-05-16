import { formatFiles, readJson, Tree, writeJson } from '@nx/devkit';
import { inc, parse, ReleaseType, valid } from 'semver';
import { PackageVersionGeneratorOptions } from './schema';

export async function packageVersionGenerator(
  tree: Tree,
  rawOptions: PackageVersionGeneratorOptions
) {
  const { path, skipFormat, vers } = rawOptions;

  if (!tree.exists(path)) {
    throw new Error(`Package.json not found at path: ${path}`);
  }

  const packageJson = readJson(tree, path);

  let newVers: string;

  // If an explicit version is provided, use it.
  if (valid(vers)) {
    newVers = vers;
  }
  // Otherwise, bump the version based on the release type.
  else {
    const currentVers = parse(packageJson.version)?.version;

    if (!currentVers) {
      throw new Error(`Invalid version in package.json: ${currentVers}`);
    }

    const releaseType = vers as ReleaseType;

    newVers = inc(currentVers, releaseType) as string;
  }

  // Maintain the position of the version field in the package.json.
  packageJson.version = newVers;

  writeJson(tree, path, packageJson);

  if (!skipFormat) {
    await formatFiles(tree);
  }
}

export default packageVersionGenerator;
