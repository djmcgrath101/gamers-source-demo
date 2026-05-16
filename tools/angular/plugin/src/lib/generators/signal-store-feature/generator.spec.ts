import { addProjectConfiguration, joinPathFragments, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { signalStoreFeatureGenerator } from './generator';

describe('signalStoreFeatureGenerator', () => {
  const invalidProjectName = 'orders-types';
  const invalidProjectRoot = 'libs/orders/types';
  const invalidSourceRoot = joinPathFragments(invalidProjectRoot, 'src');
  const projectName = 'orders-data-access';
  const projectRoot = 'libs/orders/data-access';
  const sourceRoot = joinPathFragments(projectRoot, 'src');
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    setupProject(projectName, projectRoot, sourceRoot);
  });

  it('generates the feature files in the default directory and exports the feature by default', async () => {
    await signalStoreFeatureGenerator(tree, {
      name: 'orders',
      project: projectName,
      skipFormat: true
    });

    const featureFilePath = joinPathFragments(sourceRoot, 'lib', 'features', 'orders.feature.ts');
    const featureSource = tree.read(featureFilePath, 'utf-8');
    const indexFilePath = joinPathFragments(sourceRoot, 'index.ts');
    const indexSource = tree.read(indexFilePath, 'utf-8');
    const specFilePath = joinPathFragments(sourceRoot, 'lib', 'features', 'orders.feature.spec.ts');

    expect(tree.exists(featureFilePath)).toBe(true);
    expect(tree.exists(specFilePath)).toBe(true);
    expect(indexSource).toContain(`export * from './lib/features/orders.feature';`);
    expect(featureSource).toContain('signalStoreFeature');
    expect(featureSource).toContain('export function withOrders');
  });

  it('throws when the target project is not a supported project type', async () => {
    setupProject(invalidProjectName, invalidProjectRoot, invalidSourceRoot, ['type:types']);

    await expect(
      signalStoreFeatureGenerator(tree, {
        name: 'orders',
        project: invalidProjectName,
        skipFormat: true
      })
    ).rejects.toThrow('Invalid project type for Signal Store Feature');
  });

  it('writes to a custom directory and skips the public export when export is false', async () => {
    await signalStoreFeatureGenerator(tree, {
      directory: 'state',
      export: false,
      name: 'orders',
      project: projectName,
      skipFormat: true
    });

    const featureFilePath = joinPathFragments(sourceRoot, 'lib', 'state', 'orders.feature.ts');
    const indexFilePath = joinPathFragments(sourceRoot, 'index.ts');
    const indexSource = tree.read(indexFilePath, 'utf-8');

    expect(tree.exists(featureFilePath)).toBe(true);
    expect(indexSource).not.toContain(`export * from './lib/state/orders.feature';`);
  });

  function setupProject(
    name: string,
    root: string,
    sourceRootPath: string,
    tags: readonly string[] = ['type:data-access']
  ): void {
    // Mirror the minimum library shape required for entry-point export updates.
    addProjectConfiguration(tree, name, {
      root,
      sourceRoot: sourceRootPath,
      projectType: 'library',
      tags: [...tags]
    });

    tree.write(joinPathFragments(sourceRootPath, 'index.ts'), '');
  }
});
