import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { exportFileFromLibraryEntryPoint, getPathToLibEntryPointFile } from './nx-libs.utils';

describe('nx-libs.utils', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    vitest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vitest.restoreAllMocks();
  });

  describe('exportFileFromLibraryEntryPoint', () => {
    it('exports the file from the library entry point', () => {
      const projectConfig: any = {
        sourceRoot: 'libs/test/src'
      };
      const filePath = 'libs/test/src/lib/components/test/test.component.ts';

      const entryPointPath = 'libs/test/src/index.ts';
      tree.write(entryPointPath, '');

      exportFileFromLibraryEntryPoint(tree, filePath, projectConfig);

      const entryPointContent = tree.read(entryPointPath, 'utf-8');
      expect(entryPointContent).toContain(`export * from './lib/components/test/test.component';`);
    });

    it("does not export the file if the entry point couldn't be found", () => {
      const projectConfig: any = {
        sourceRoot: 'libs/test/src'
      };
      const entryPointPath = 'libs/test/src/index.ts';
      const filePath = 'libs/test/src/lib/components/test/test.component.ts';

      exportFileFromLibraryEntryPoint(tree, filePath, projectConfig);

      expect(tree.exists(entryPointPath)).toBe(false);
    });
  });

  describe('getPathToLibEntryPointFile', () => {
    const entryPointPath = 'libs/test/src/index.ts';
    const projectConfig: any = {
      sourceRoot: 'libs/test/src'
    };

    it('locates the library entry point without specifying a starting directory', () => {
      tree.write(entryPointPath, '');

      const result = getPathToLibEntryPointFile(tree, projectConfig);
      expect(result).toBe(entryPointPath);
    });

    it("isn't able to locate the entry point when the directory isn't part of the project source root", () => {
      tree.write(entryPointPath, '');

      const result = getPathToLibEntryPointFile(tree, projectConfig, 'libs/test2/src');
      expect(result).toBe(null);
    });

    it("isn't able to locate the entry point when it doesn't exist", () => {
      const result = getPathToLibEntryPointFile(tree, projectConfig);
      expect(result).toBe(null);
    });
  });
});
