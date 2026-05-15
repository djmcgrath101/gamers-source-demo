import { addProjectConfiguration, readProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { pluginGenerator } from '@nx/plugin/generators';
import { nxPluginGenerator } from './generator';

vi.mock('@nx/plugin/generators', () => ({
  pluginGenerator: vi.fn(async (tree: Tree, options: { name: string; directory: string }) => {
    addProjectConfiguration(tree, options.name, {
      root: options.directory,
      sourceRoot: `${options.directory}/src`,
      projectType: 'library',
      targets: {},
      tags: []
    });

    tree.write(
      `${options.directory}/package.json`,
      JSON.stringify(
        {
          name: options.name
        },
        null,
        2
      )
    );

    return async () => {};
  })
}));

describe('nxPluginGenerator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('uses normalized plugin naming/location and generates eslint config', async () => {
    await nxPluginGenerator(tree, { name: 'test', skipFormat: true });

    const project = readProjectConfiguration(tree, 'test-plugin');
    const eslintPath = `${project.root}/eslint.config.mjs`;
    const eslintConfig = tree.read(eslintPath, 'utf-8');

    expect(project.root).toBe('tools/test/plugin');
    expect(tree.exists(eslintPath)).toBe(true);
    expect(eslintConfig).toContain("import baseConfig from '../../../eslint.config.mjs';");
    expect(eslintConfig).toContain("'@nx/nx-plugin-checks': 'error'");
  });

  it('does not include @nx/dependency-checks by default', async () => {
    await nxPluginGenerator(tree, { name: 'without-checks', skipFormat: true });

    const project = readProjectConfiguration(tree, 'without-checks-plugin');
    const eslintConfig = tree.read(`${project.root}/eslint.config.mjs`, 'utf-8');

    expect(eslintConfig).not.toContain('@nx/dependency-checks');
  });

  it('includes @nx/dependency-checks when checkDependencies=true', async () => {
    await nxPluginGenerator(tree, {
      name: 'with-checks',
      checkDependencies: true,
      skipFormat: true
    });

    const project = readProjectConfiguration(tree, 'with-checks-plugin');
    const eslintConfig = tree.read(`${project.root}/eslint.config.mjs`, 'utf-8');

    expect(eslintConfig).toContain('@nx/dependency-checks');
  });

  it('writes generated files to a custom directory when provided', async () => {
    await nxPluginGenerator(tree, {
      name: 'custom-location',
      directory: 'custom/location',
      skipFormat: true
    });

    const project = readProjectConfiguration(tree, 'custom-location-plugin');

    expect(project.root).toBe('custom/location');
    expect(tree.exists('custom/location/eslint.config.mjs')).toBe(true);
    expect(tree.exists('custom/location/src/lib/.gitkeep')).toBe(true);
  });

  it('returns the upstream plugin generator callback', async () => {
    const callback = await nxPluginGenerator(tree, { name: 'callback-test', skipFormat: true });

    expect(typeof callback).toBe('function');
    expect(pluginGenerator).toHaveBeenCalled();
  });
});
