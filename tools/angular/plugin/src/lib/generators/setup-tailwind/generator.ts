import { findRootComponentStylesheetPath } from '@gamers-source/angular-tools-utils';
import { setupTailwindGenerator as nxSetupTailwindGenerator } from '@nx/angular/generators';
import {
  formatFiles,
  generateFiles,
  GeneratorCallback,
  joinPathFragments,
  offsetFromRoot,
  readProjectConfiguration,
  Tree
} from '@nx/devkit';
import { readFileSync } from 'fs';
import { join } from 'path';
import { SetupTailwindGeneratorOptions } from './schema';

/**
 * Appends the shared Tailwind layout styles to the resolved root component stylesheet.
 */
function appendTailwindStyles(tree: Tree, stylesheetPath: string): void {
  const stylesheetTemplate = readFileSync(
    join(__dirname, 'files', 'app', 'src', 'app', 'app.component.__style__'),
    'utf-8'
  ).trimEnd();

  if (!tree.exists(stylesheetPath)) {
    tree.write(stylesheetPath, `${stylesheetTemplate}\n`);
    return;
  }

  const existingStyles = tree.read(stylesheetPath, 'utf-8');

  // Avoid duplicating the Tailwind helpers if the generator is re-run.
  if (existingStyles?.includes('@apply block fill-space;')) {
    return;
  }

  const separator =
    existingStyles?.trim().length === 0 ? '' : existingStyles?.endsWith('\n') ? '\n' : '\n\n';
  tree.write(stylesheetPath, `${existingStyles}${separator}${stylesheetTemplate}\n`);
}

/**
 * Wraps Nx's Tailwind generator so workspace-specific templates can be layered on top.
 */
export async function setupTailwindGenerator(
  tree: Tree,
  rawOptions: SetupTailwindGeneratorOptions
): Promise<GeneratorCallback> {
  const projectConfig = readProjectConfiguration(tree, rawOptions.project);
  const hasTailwindConfig = tree.exists(
    joinPathFragments(projectConfig.root, 'tailwind.config.js')
  );
  let installTask: GeneratorCallback = async () => {
    // noop callback
  };

  if (!hasTailwindConfig) {
    installTask = await nxSetupTailwindGenerator(tree, rawOptions);

    // Only write the workspace preset when the project does not already own a Tailwind config.
    generateFiles(tree, joinPathFragments(__dirname, 'files', 'common'), projectConfig.root, {
      ...rawOptions,
      offsetFromRoot: offsetFromRoot(projectConfig.root),
      tmpl: ''
    });
  }

  const stylesheetPath = findRootComponentStylesheetPath(tree, projectConfig);

  if (stylesheetPath) {
    appendTailwindStyles(tree, stylesheetPath);
  }

  if (!rawOptions.skipFormat) {
    await formatFiles(tree);
  }

  return installTask;
}

export default setupTailwindGenerator;
