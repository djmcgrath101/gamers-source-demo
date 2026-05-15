import { addProjectConfiguration, ProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { relative } from 'node:path';
import { Mocked } from 'vitest';
import {
  getRelativeImportToFile,
  getRelativePathBetweenProjects,
  isEmptyDir,
  listFilesRecursively
} from './nx-tree.utils';

describe('nx-tree.utils', () => {
  let tree: Tree;
  let mockTree: Mocked<Pick<Tree, 'exists' | 'children' | 'isFile'>>;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    mockTree = {
      exists: vitest.fn(),
      children: vitest.fn(),
      isFile: vitest.fn()
    };
  });

  describe('getRelativeImportToFile', () => {
    it('returns the correct relative import path', () => {
      const from = 'src/index.ts';
      const to = 'src/lib/utils/test.utils.ts';
      const result = getRelativeImportToFile(from, to);
      expect(result).toBe('./lib/utils/test.utils');
    });
  });

  describe('getRelativePathBetweenProjects', () => {
    it('returns the relative path between project roots when given project configurations', () => {
      const sourceProject: ProjectConfiguration = {
        name: 'shared-data-access',
        root: 'libs/shared/data-access',
        sourceRoot: 'libs/shared/data-access/custom-src',
        projectType: 'library'
      };
      const targetProject: ProjectConfiguration = {
        name: 'shared-ui',
        root: 'libs/shared/ui',
        sourceRoot: 'libs/shared/ui/src',
        projectType: 'library'
      };

      const result = getRelativePathBetweenProjects(tree, sourceProject, targetProject);
      expect(result).toBe(relative(sourceProject.root, targetProject.root));
    });

    it('reads project configurations from the tree when given project names', () => {
      addProjectConfiguration(tree, 'admin-dashboard', {
        root: 'apps/admin/dashboard',
        sourceRoot: 'apps/admin/dashboard/src',
        projectType: 'application'
      });
      addProjectConfiguration(tree, 'admin-shell', {
        root: 'apps/admin/shell',
        sourceRoot: 'apps/admin/shell/app-src',
        projectType: 'application'
      });

      const result = getRelativePathBetweenProjects(tree, 'admin-dashboard', 'admin-shell');
      expect(result).toBe(relative('apps/admin/dashboard', 'apps/admin/shell'));
    });
  });

  describe('isEmptyDir', () => {
    it('returns true if directory does not exist', () => {
      mockTree.exists.mockReturnValue(false);
      const result = isEmptyDir(mockTree as Mocked<Tree>, 'non-existent-dir');
      expect(result).toBe(true);
    });

    it('returns true if directory exists but has no children', () => {
      mockTree.exists.mockReturnValue(true);
      mockTree.children.mockReturnValue([]);
      const result = isEmptyDir(mockTree as any, 'empty-dir');
      expect(result).toBe(true);
    });

    it('returns false if directory exists and has children', () => {
      mockTree.exists.mockReturnValue(true);
      mockTree.children.mockReturnValue(['file1.txt']);
      const result = isEmptyDir(mockTree as any, 'non-empty-dir');
      expect(result).toBe(false);
    });

    it('returns false if directory exists and has subdirectories', () => {
      mockTree.exists.mockReturnValue(true);
      mockTree.children.mockReturnValue(['subdir']);
      const result = isEmptyDir(mockTree as any, 'non-empty-dir');
      expect(result).toBe(false);
    });

    it('returns false if directory exists and has files and subdirectories', () => {
      mockTree.exists.mockReturnValue(true);
      mockTree.children.mockReturnValue(['file1.txt', 'subdir']);
      const result = isEmptyDir(mockTree as any, 'non-empty-dir');
      expect(result).toBe(false);
    });
  });

  describe('listFilesRecursively', () => {
    it('returns an empty array if directory does not exist', () => {
      mockTree.exists.mockReturnValue(false);
      const result = listFilesRecursively(mockTree as any, 'non-existent-dir');
      expect(result).toEqual([]);
    });

    it('returns a list of file paths for a flat directory', () => {
      mockTree.exists.mockReturnValue(true);
      mockTree.children.mockReturnValue(['file1.txt', 'file2.txt']);
      mockTree.isFile.mockImplementation(path => path.includes('.txt'));

      const result = listFilesRecursively(mockTree as any, 'dir');
      expect(result).toEqual(['dir/file1.txt', 'dir/file2.txt']);
    });

    it('returns a list of file paths including subdirectories', () => {
      mockTree.exists.mockReturnValue(true);
      mockTree.children.mockImplementation(path => {
        if (path === 'dir') return ['file1.txt', 'subdir'];
        if (path === 'dir/subdir') return ['file2.txt'];
        return [];
      });
      mockTree.isFile.mockImplementation(path => path.includes('.txt'));

      const result = listFilesRecursively(mockTree as any, 'dir');
      expect(result).toEqual(['dir/file1.txt', 'dir/subdir/file2.txt']);
    });

    it('handles nested empty directories', () => {
      mockTree.exists.mockReturnValue(true);
      mockTree.children.mockImplementation(path => {
        if (path === 'dir') return ['subdir'];
        if (path === 'dir/subdir') return [];
        return [];
      });
      mockTree.isFile.mockImplementation(() => false);

      const result = listFilesRecursively(mockTree as any, 'dir');
      expect(result).toEqual([]);
    });
  });
});
