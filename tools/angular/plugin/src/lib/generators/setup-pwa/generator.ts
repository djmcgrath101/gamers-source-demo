import {
  formatFiles,
  generateFiles,
  GeneratorCallback,
  joinPathFragments,
  ProjectConfiguration,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration
} from '@nx/devkit';
import { wrapAngularDevkitSchematic } from '@nx/devkit/ngcli-adapter';
import { startCase } from 'lodash-es';
import { SetupPwaGeneratorOptions } from './schema';

type PwaAssetsLocation = {
  readonly generatorFilesDir: 'assets' | 'public';
  readonly outputPath: string;
};

function getPwaAssetsLocation(tree: Tree, projectConfig: ProjectConfiguration): PwaAssetsLocation {
  const sourcePath = projectConfig.sourceRoot ?? joinPathFragments(projectConfig.root, 'src');
  const assetsPath = joinPathFragments(sourcePath, 'assets');

  // Match Angular's `@angular/pwa` asset placement so the wrapper updates the same files.
  if (tree.exists(assetsPath)) {
    return {
      generatorFilesDir: 'assets',
      outputPath: assetsPath
    };
  }

  return {
    generatorFilesDir: 'public',
    outputPath: joinPathFragments(projectConfig.root, 'public')
  };
}

function renameGeneratedIconsDirectory(tree: Tree, assetRoot: string): void {
  const faviconsPath = joinPathFragments(assetRoot, 'images', 'favicons');
  const iconsPath = joinPathFragments(assetRoot, 'icons');

  // Re-runs should not fail once the icons directory has already been moved.
  if (tree.exists(iconsPath) && !tree.exists(faviconsPath)) {
    tree.rename(iconsPath, faviconsPath);
  }
}

/**
 * Wraps Angular's PWA schematic so workspace-specific manifest and favicon paths stay consistent.
 */
export async function setupPwaGenerator(
  tree: Tree,
  rawOptions: SetupPwaGeneratorOptions
): Promise<GeneratorCallback> {
  const generator = wrapAngularDevkitSchematic('@angular/pwa', 'ng-add');
  const callback = await generator(tree, { project: rawOptions.project });

  const projectConfig = readProjectConfiguration(tree, rawOptions.project);
  const pwaAssetsLocation = getPwaAssetsLocation(tree, projectConfig);

  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files', pwaAssetsLocation.generatorFilesDir),
    pwaAssetsLocation.outputPath,
    {
      title: startCase(projectConfig.name),
      tmpl: ''
    }
  );
  renameGeneratedIconsDirectory(tree, pwaAssetsLocation.outputPath);

  // NOTE: Running the Angular PWA generator as part of a generator pipeline
  // does not set the serviceWorker option in the build target, so we set it manually.
  if (!projectConfig.targets?.build?.options?.serviceWorker) {
    projectConfig.targets.build.options.serviceWorker = joinPathFragments(
      projectConfig.root,
      'ngsw-config.json'
    );
    updateProjectConfiguration(tree, rawOptions.project, projectConfig);
  }

  if (!rawOptions.skipFormat) {
    await formatFiles(tree);
  }

  return callback;
}

export default setupPwaGenerator;
