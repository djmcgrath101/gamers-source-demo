import * as devkit from '@nx/devkit';
import { PackageJson } from 'type-fest';
import { Mock } from 'vitest';
import { getRootPackageJson, getWorkspaceLibsDir, getWorkspaceScope } from './nx-workspace.utils';

describe('nx-workspace.utils', () => {
  let tree: any;

  beforeEach(() => {
    tree = {};
  });

  describe('getRootPackageJson', () => {
    it('returns package.json content if it exists', () => {
      vitest.spyOn(devkit, 'readJson').mockReturnValueOnce({
        name: '@myorg/myapp',
        version: '1.0.0'
      });
      expect(getRootPackageJson(tree)).toEqual({
        name: '@myorg/myapp',
        version: '1.0.0'
      });
    });

    it('returns null if package.json does not exist', () => {
      vitest.spyOn(devkit, 'readJson').mockImplementationOnce(() => {
        throw new Error('File not found');
      });
      expect(getRootPackageJson(tree)).toBeNull();
    });
  });

  describe('getWorkspaceLibsDir', () => {
    it('returns custom libsDir from nx.json', () => {
      vitest.spyOn(devkit, 'readNxJson').mockReturnValueOnce({
        workspaceLayout: { libsDir: 'custom/libs' }
      });
      expect(getWorkspaceLibsDir(tree)).toBe('custom/libs');
    });

    it('returns "libs" if libsDir is not specified', () => {
      vitest.spyOn(devkit, 'readNxJson').mockReturnValueOnce({
        workspaceLayout: {}
      });
      expect(getWorkspaceLibsDir(tree)).toBe('libs');
    });

    it('returns "libs" if workspaceLayout is missing', () => {
      vitest.spyOn(devkit, 'readNxJson').mockReturnValueOnce({});
      expect(getWorkspaceLibsDir(tree)).toBe('libs');
    });

    it('returns "libs" if nxJson is null', () => {
      vitest.spyOn(devkit, 'readNxJson').mockReturnValueOnce(null);
      expect(getWorkspaceLibsDir(tree)).toBe('libs');
    });
  });

  describe('getWorkspaceScope', () => {
    const readJson = vitest.spyOn(devkit, 'readJson');

    afterEach(() => {
      vitest.resetAllMocks();
    });

    it('returns the scope when name is a valid scoped package', () => {
      (readJson as Mock).mockReturnValue({
        name: '@my-org/my-package'
      } satisfies PackageJson);

      const result = getWorkspaceScope(tree);
      expect(result).toBe('my-org');
    });

    it('returns default scope when name is unscoped', () => {
      (readJson as Mock).mockReturnValue({
        name: 'my-package'
      } satisfies PackageJson);

      const result = getWorkspaceScope(tree);
      expect(result).toBe('gamers-source');
    });

    it('returns default scope when name is missing', () => {
      (readJson as Mock).mockReturnValue({} as PackageJson);

      const result = getWorkspaceScope(tree);
      expect(result).toBe('gamers-source');
    });

    it('returns default scope for malformed scoped name', () => {
      (readJson as Mock).mockReturnValue({
        name: '@invalidscope'
      } satisfies PackageJson);

      const result = getWorkspaceScope(tree);
      expect(result).toBe('gamers-source');
    });

    it('returns scope despite overly long scoped name', () => {
      (readJson as Mock).mockReturnValue({
        name: '@org/pkg/extra'
      } satisfies PackageJson);

      const result = getWorkspaceScope(tree);
      expect(result).toBe('org');
    });
  });
});
