import { componentGenerator as nxComponentGenerator } from '@nx/angular/generators';
import { addProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { ngComponentGenerator } from './generator';

vitest.mock('@nx/angular/generators', () => ({
  componentGenerator: vitest.fn(async () => {})
}));

describe('ngComponentGenerator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, 'orders-ui', {
      root: 'libs/orders/ui',
      sourceRoot: 'libs/orders/ui/src',
      projectType: 'library',
      targets: {},
      tags: []
    });
    tree.write('libs/orders/ui/src/index.ts', '');
    vitest.clearAllMocks();
  });

  it('delegates to the Nx component generator with the workspace-standard source path', async () => {
    await ngComponentGenerator(tree, {
      name: 'checkout',
      project: 'orders-ui',
      skipFormat: true,
      type: 'view'
    });

    expect(nxComponentGenerator).toHaveBeenCalledWith(
      tree,
      expect.objectContaining({
        name: 'checkout',
        path: 'libs/orders/ui/src/lib/checkout',
        type: 'view'
      })
    );
  });

  it('appends the component name below a custom relative path', async () => {
    await ngComponentGenerator(tree, {
      name: 'checkout',
      path: 'flows',
      project: 'orders-ui',
      skipFormat: true,
      type: 'form'
    });

    expect(nxComponentGenerator).toHaveBeenCalledWith(
      tree,
      expect.objectContaining({
        name: 'checkout',
        path: 'libs/orders/ui/src/lib/flows/checkout',
        type: 'form'
      })
    );
  });
});
