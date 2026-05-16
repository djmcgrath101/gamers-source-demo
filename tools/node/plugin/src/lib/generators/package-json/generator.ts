import { getRootPackageJson, getWorkspaceScope } from '@gamers-source/nx-utils';
import { formatFiles, generateFiles, joinPathFragments, logger, Tree } from '@nx/devkit';
import { validRange } from 'semver';
import packageVersionGenerator from '../package-version/generator';
import { NormalizedPackageJsonGeneratorOptions, PackageJsonGeneratorOptions } from './schema';

/**
 * Generates a package.json and optionally copies deploy-time runtime metadata from the workspace.
 */
export async function packageJsonGenerator(
  tree: Tree,
  rawOptions: PackageJsonGeneratorOptions
): Promise<void> {
  const options = normalizeOptions(tree, rawOptions);
  const packageJsonPath = joinPathFragments(options.dir, 'package.json');

  if (tree.exists(packageJsonPath) && !options.overwrite) {
    logger.warn(`Package.json already exists at "${packageJsonPath}". Skipping generation.`);

    return;
  }

  generateFiles(tree, joinPathFragments(__dirname, 'files'), options.dir, {
    ...options,
    tmpl: ''
  });

  await packageVersionGenerator(tree, {
    path: packageJsonPath,
    skipFormat: true,
    vers: options.vers
  });

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

function normalizeOptions(
  tree: Tree,
  options: PackageJsonGeneratorOptions
): NormalizedPackageJsonGeneratorOptions {
  validateNodeEngine(options.nodeEngine);

  const npmScope = getWorkspaceScope(tree);
  const name = npmScope ? `${npmScope}/${options.name}` : options.name;

  return {
    ...options,
    dependencies: resolveDependencies(tree, options.dependencies),
    main: options.main,
    name,
    nodeEngine: options.nodeEngine,
    overwrite: options.overwrite ?? false,
    private: options.private ?? true,
    startScript: options.startScript,
    vers: options.vers || '0.0.1'
  };
}

function resolveDependencies(
  tree: Tree,
  dependencyNames: readonly string[] | undefined
): Readonly<Record<string, string>> | undefined {
  if (!dependencyNames?.length) {
    return undefined;
  }

  const rootPackageJson = getRootPackageJson(tree);

  if (!rootPackageJson) {
    logger.error('Cannot resolve dependencies because the root package.json was not found.');
    return undefined;
  }

  const rootDependencies = rootPackageJson.dependencies ?? {};
  const rootDevDependencies = rootPackageJson.devDependencies ?? {};

  return Object.fromEntries(
    dependencyNames.map(dependencyName => {
      const dependencyVersion =
        rootDependencies[dependencyName] ?? rootDevDependencies[dependencyName];

      if (!dependencyVersion) {
        throw new Error(
          `Cannot add dependency "${dependencyName}" to generated package.json because it was not found in the root package.json dependencies or devDependencies.`
        );
      }

      return [dependencyName, dependencyVersion];
    })
  );
}

function validateNodeEngine(nodeEngine: string | undefined): void {
  if (nodeEngine && !validRange(nodeEngine)) {
    throw new Error(`Invalid nodeEngine "${nodeEngine}". Expected a valid semver range.`);
  }
}

export default packageJsonGenerator;
