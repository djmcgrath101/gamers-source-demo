import { joinPathFragments, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { libraryGenerator } from '@nx/js';
import tsFileGenerator from './generator';

describe('ts-file generator', () => {
  let tree: Tree;

  const libOptions = { name: 'test', directory: 'libs/test' };
  const srcPath = 'libs/test/src';
  const srcLibPath = joinPathFragments(srcPath, 'lib');

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();

    await libraryGenerator(tree, libOptions);
  });

  it('includes the type in the generated file name', async () => {
    await tsFileGenerator(tree, {
      project: 'test',
      name: 'my-file',
      type: 'service'
    });

    expect(tree.exists(joinPathFragments(srcLibPath, 'my-file.service.ts'))).toBe(true);
  });

  it('defaults to adding a spec file', async () => {
    await tsFileGenerator(tree, {
      project: 'test',
      name: 'my-file',
      type: 'service'
    });

    expect(tree.exists(joinPathFragments(srcLibPath, 'my-file.service.spec.ts'))).toBe(true);
  });

  it('omits spec file when addSpec option is set to false', async () => {
    await tsFileGenerator(tree, {
      project: 'test',
      name: 'my-file',
      type: 'service',
      addSpec: false
    });

    expect(tree.exists(joinPathFragments(srcLibPath, 'my-file.service.spec.ts'))).toBe(false);
  });

  it('exports the file from the library entry point by default', async () => {
    await tsFileGenerator(tree, {
      project: 'test',
      name: 'my-file',
      type: 'service'
    });

    const indexFile = tree.read(joinPathFragments(srcPath, 'index.ts'), 'utf-8');
    expect(indexFile).toContain(`export * from './lib/my-file.service';`);
  });

  it('does not export the file when export option is set to false', async () => {
    await tsFileGenerator(tree, {
      project: 'test',
      name: 'my-file',
      type: 'service',
      export: false
    });

    const indexFile = tree.read(joinPathFragments(srcPath, 'index.ts'), 'utf-8');
    expect(indexFile).not.toContain(`export * from './lib/my-file.service';`);
  });

  it('places the generated files in the specified directory', async () => {
    await tsFileGenerator(tree, {
      project: 'test',
      name: 'my-file',
      type: 'service',
      directory: 'utils'
    });

    expect(tree.exists(joinPathFragments(srcLibPath, 'utils', 'my-file.service.ts'))).toBe(true);
    expect(tree.exists(joinPathFragments(srcLibPath, 'utils', 'my-file.service.spec.ts'))).toBe(
      true
    );
  });
});
