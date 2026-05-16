import { addProjectConfiguration, joinPathFragments, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { signalStoreGenerator } from './generator';

describe('signalStoreGenerator', () => {
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

  it('generates the store files in the default directory and exports the store by default', async () => {
    await signalStoreGenerator(tree, {
      name: 'orders',
      project: projectName,
      skipFormat: true
    });

    const storeFilePath = joinPathFragments(sourceRoot, 'lib', 'stores', 'orders.store.ts');
    const specFilePath = joinPathFragments(sourceRoot, 'lib', 'stores', 'orders.store.spec.ts');
    const indexFilePath = joinPathFragments(sourceRoot, 'index.ts');
    const indexSource = tree.read(indexFilePath, 'utf-8');
    const storeSource = tree.read(storeFilePath, 'utf-8');

    expect(tree.exists(storeFilePath)).toBe(true);
    expect(tree.exists(specFilePath)).toBe(true);
    expect(indexSource).toContain(`export * from './lib/stores/orders.store';`);
    expect(storeSource).toContain("import { withLogger } from '@gamers-source/shared-ngrx-utils';");
    expect(storeSource).toContain("{ providedIn: 'root' },");
  });

  it('omits optional logger and root-provider output when the related flags are disabled', async () => {
    await signalStoreGenerator(tree, {
      name: 'orders',
      project: projectName,
      providedInRoot: false,
      skipFormat: true,
      skipLogger: true
    });

    const storeFilePath = joinPathFragments(sourceRoot, 'lib', 'stores', 'orders.store.ts');
    const storeSource = tree.read(storeFilePath, 'utf-8');

    expect(storeSource).not.toContain('withLogger');
    expect(storeSource).not.toContain("providedIn: 'root'");
  });

  it('writes to a custom directory and skips the public export when export is false', async () => {
    await signalStoreGenerator(tree, {
      directory: 'state',
      export: false,
      name: 'orders',
      project: projectName,
      skipFormat: true
    });

    const storeFilePath = joinPathFragments(sourceRoot, 'lib', 'state', 'orders.store.ts');
    const indexFilePath = joinPathFragments(sourceRoot, 'index.ts');
    const indexSource = tree.read(indexFilePath, 'utf-8');

    expect(tree.exists(storeFilePath)).toBe(true);
    expect(indexSource).not.toContain(`export * from './lib/state/orders.store';`);
  });

  it('throws when the target project is not a supported library type', async () => {
    setupProject(invalidProjectName, invalidProjectRoot, invalidSourceRoot, ['type:types']);

    await expect(
      signalStoreGenerator(tree, {
        name: 'orders',
        project: invalidProjectName,
        skipFormat: true
      })
    ).rejects.toThrow('Invalid project type for Signal Store');
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
