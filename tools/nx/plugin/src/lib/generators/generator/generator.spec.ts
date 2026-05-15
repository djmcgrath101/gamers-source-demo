import {
  addProjectConfiguration,
  joinPathFragments,
  ProjectConfiguration,
  readProjectConfiguration,
  Tree
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { nxGeneratorGenerator } from './generator';
import { NxGeneratorGeneratorOptions } from './schema';

describe('nxGeneratorGenerator', () => {
  let tree: Tree;
  let config: ProjectConfiguration;

  async function setupTest(tags = 'type:plugin') {
    tree = createTreeWithEmptyWorkspace();

    addProjectConfiguration(tree, 'test-plugin', {
      root: 'plugins/test',
      sourceRoot: 'plugins/test/src',
      projectType: 'library',
      tags: [tags],
      targets: {}
    });
    // Seed the minimum plugin package metadata expected by @nx/plugin:generator internals.
    tree.write(
      'plugins/test/package.json',
      JSON.stringify({
        name: '@proj/test-plugin',
        version: '0.0.0'
      })
    );
    // Seed the plugin entry point so the generator can append exports for the new generator entry points.
    tree.write('plugins/test/src/index.ts', '');

    config = readProjectConfiguration(tree, 'test-plugin');
  }

  it('creates test plugin', async () => {
    await setupTest();
    expect(config).toBeDefined();
  });

  it('uses the generator name as the directory name when no custom directory is defined', async () => {
    const options: NxGeneratorGeneratorOptions = {
      project: 'test-plugin',
      name: 'my-generator',
      skipLintChecks: true,
      unitTestRunner: 'jest'
    };
    await setupTest();

    const expectedPath = joinPathFragments(
      config.root,
      'src',
      'lib',
      'generators',
      options.name,
      'generator.ts'
    );

    await nxGeneratorGenerator(tree, options);

    expect(tree.exists(expectedPath)).toBe(true);
  });

  it('places the generator in a custom directory if specified', async () => {
    const options: NxGeneratorGeneratorOptions = {
      project: 'test-plugin',
      name: 'my-generator',
      directory: 'custom-dir',
      skipLintChecks: true,
      unitTestRunner: 'jest'
    };
    await setupTest();

    const expectedPath = joinPathFragments(
      config.root,
      'src',
      'lib',
      'generators',
      options.directory!,
      'generator.ts'
    );

    await nxGeneratorGenerator(tree, options);

    expect(tree.exists(expectedPath)).toBe(true);
  });

  it('renames the schema.d.ts file to schema.ts', async () => {
    const options: NxGeneratorGeneratorOptions = {
      project: 'test-plugin',
      name: 'my-generator',
      skipLintChecks: true,
      unitTestRunner: 'jest'
    };
    await setupTest();

    const generatorDir = joinPathFragments(config.root, 'src', 'lib', 'generators', options.name);

    const schemaDtsPath = joinPathFragments(generatorDir, 'schema.d.ts');
    const schemaTsPath = joinPathFragments(generatorDir, 'schema.ts');

    await nxGeneratorGenerator(tree, options);

    expect(tree.exists(schemaDtsPath)).toBe(false);
    expect(tree.exists(schemaTsPath)).toBe(true);
  });

  it('exports the generated generator default and schema from the plugin entry point file', async () => {
    const options: NxGeneratorGeneratorOptions = {
      project: 'test-plugin',
      name: 'my-generator',
      skipLintChecks: true,
      unitTestRunner: 'jest'
    };
    await setupTest();

    await nxGeneratorGenerator(tree, options);

    expect(tree.read('plugins/test/src/index.ts', 'utf-8')).toBe(
      [
        "export { default as myGeneratorGenerator } from './lib/generators/my-generator/generator';",
        "export * from './lib/generators/my-generator/schema';",
        ''
      ].join('\n')
    );
  });

  it('creates a README.md file by default', async () => {
    const options: NxGeneratorGeneratorOptions = {
      project: 'test-plugin',
      name: 'with-readme',
      skipLintChecks: true,
      unitTestRunner: 'jest'
    };
    await setupTest();

    const readmePath = joinPathFragments(
      config.root,
      'src',
      'lib',
      'generators',
      options.name,
      'README.md'
    );

    await nxGeneratorGenerator(tree, options);

    expect(tree.exists(readmePath)).toBe(true);
  });

  it('does not create a README.md file when minimal=true', async () => {
    const options: NxGeneratorGeneratorOptions = {
      project: 'test-plugin',
      name: 'minimal-generator',
      minimal: true,
      skipLintChecks: true,
      unitTestRunner: 'jest'
    };
    await setupTest();

    const readmePath = joinPathFragments(
      config.root,
      'src',
      'lib',
      'generators',
      options.name,
      'README.md'
    );

    await nxGeneratorGenerator(tree, options);

    expect(tree.exists(readmePath)).toBe(false);
  });

  it('throws an error if the project is not a plugin', async () => {
    await setupTest('type:app');

    await expect(
      nxGeneratorGenerator(tree, {
        project: 'test-plugin',
        name: 'my-generator',
        skipLintChecks: true,
        unitTestRunner: 'jest'
      })
    ).rejects.toThrow('Project test-plugin must be a plugin project.');
  });
});
