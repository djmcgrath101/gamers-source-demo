import { addProjectConfiguration, readNxJson, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { setDefaultProjectGenerator } from './generator';

describe('setDefaultProjectGenerator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('sets defaultProject in nx.json', async () => {
    addProjectConfiguration(tree, 'my-app', {
      root: 'apps/my-app',
      projectType: 'application',
      sourceRoot: 'apps/my-app/src',
      targets: {}
    });

    await setDefaultProjectGenerator(tree, {
      project: 'my-app',
      skipFormat: true
    });

    expect(readNxJson(tree)?.defaultProject).toBe('my-app');
  });

  it('throws when the project does not exist', async () => {
    await expect(
      setDefaultProjectGenerator(tree, {
        project: 'missing-project',
        skipFormat: true
      })
    ).rejects.toThrow('Cannot find configuration for');
  });
});
