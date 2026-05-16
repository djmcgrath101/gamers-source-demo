import { formatFiles, logger, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import packageVersionGenerator from '../package-version/generator';
import packageJsonGenerator from './generator';

vi.mock('@nx/devkit', async importOriginal => {
  const actual = await importOriginal<typeof import('@nx/devkit')>();

  return {
    ...actual,
    formatFiles: vi.fn().mockResolvedValue(undefined),
    logger: {
      ...actual.logger,
      error: vi.fn(),
      warn: vi.fn()
    }
  };
});

vi.mock('../package-version/generator', () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue(undefined)
}));

describe('packageJsonGenerator', () => {
  let tree: Tree;

  function writeRootPackageJson(options?: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    name?: string;
  }): void {
    tree.write(
      'package.json',
      JSON.stringify(
        {
          name: options?.name ?? '@gamers-source/workspace',
          dependencies: options?.dependencies ?? {},
          devDependencies: options?.devDependencies ?? {}
        },
        null,
        2
      )
    );
  }

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    writeRootPackageJson();
    vi.clearAllMocks();
  });

  describe('when package.json does not exist', () => {
    it('generates a private package.json with the workspace scope and default version', async () => {
      await packageJsonGenerator(tree, {
        dir: 'libs/test',
        name: 'widget',
        skipFormat: true
      });

      expect(JSON.parse(tree.read('libs/test/package.json', 'utf-8') ?? '{}')).toEqual({
        name: 'gamers-source/widget',
        private: true,
        version: '0.0.1'
      });
      expect(packageVersionGenerator).toHaveBeenCalledWith(tree, {
        path: 'libs/test/package.json',
        skipFormat: true,
        vers: '0.0.1'
      });
      expect(formatFiles).not.toHaveBeenCalled();
    });

    it('uses the default workspace scope when the root package name is unscoped', async () => {
      writeRootPackageJson({
        name: 'workspace'
      });

      await packageJsonGenerator(tree, {
        dir: 'libs/test',
        name: 'widget',
        skipFormat: true
      });

      expect(JSON.parse(tree.read('libs/test/package.json', 'utf-8') ?? '{}').name).toBe(
        'gamers-source/widget'
      );
    });

    it('respects explicit version and visibility options and formats files by default', async () => {
      writeRootPackageJson({
        name: '@custom/workspace'
      });

      await packageJsonGenerator(tree, {
        dir: 'libs/test',
        name: 'widget',
        private: false,
        vers: '2.3.4'
      });

      expect(JSON.parse(tree.read('libs/test/package.json', 'utf-8') ?? '{}')).toEqual({
        name: 'custom/widget',
        version: '2.3.4'
      });
      expect(packageVersionGenerator).toHaveBeenCalledWith(tree, {
        path: 'libs/test/package.json',
        skipFormat: true,
        vers: '2.3.4'
      });
      expect(formatFiles).toHaveBeenCalledWith(tree);
    });

    it('generates Node server fields and copies dependency versions from the root package.json', async () => {
      writeRootPackageJson({
        dependencies: {
          '@angular/core': '21.2.9',
          express: '^4.21.2'
        },
        devDependencies: {
          '@nx/angular': '22.7.1'
        }
      });

      await packageJsonGenerator(tree, {
        dependencies: ['@angular/core', '@nx/angular', 'express'],
        dir: 'apps/test',
        main: 'server/server.mjs',
        name: 'web-app',
        nodeEngine: '^20.19.0 || ^22.12.0 || ^24.0.0',
        skipFormat: true,
        startScript: 'node server/server.mjs'
      });

      expect(JSON.parse(tree.read('apps/test/package.json', 'utf-8') ?? '{}')).toEqual({
        name: 'gamers-source/web-app',
        version: '0.0.1',
        private: true,
        main: 'server/server.mjs',
        engines: {
          node: '^20.19.0 || ^22.12.0 || ^24.0.0'
        },
        scripts: {
          start: 'node server/server.mjs'
        },
        dependencies: {
          '@angular/core': '21.2.9',
          '@nx/angular': '22.7.1',
          express: '^4.21.2'
        }
      });
    });

    it('throws when nodeEngine is not a valid semver range', async () => {
      await expect(
        packageJsonGenerator(tree, {
          dir: 'apps/test',
          name: 'web-app',
          nodeEngine: 'twenty'
        })
      ).rejects.toThrow('Invalid nodeEngine "twenty". Expected a valid semver range.');
    });

    it('throws when a requested dependency is missing from the root package.json', async () => {
      await expect(
        packageJsonGenerator(tree, {
          dependencies: ['missing-package'],
          dir: 'apps/test',
          name: 'web-app'
        })
      ).rejects.toThrow(
        'Cannot add dependency "missing-package" to generated package.json because it was not found in the root package.json dependencies or devDependencies.'
      );
    });
  });

  describe('when package.json already exists', () => {
    it('warns and skips generation', async () => {
      vi.mocked(logger.warn).mockReturnValue(undefined);

      tree.write(
        'libs/test/package.json',
        JSON.stringify(
          {
            name: 'existing/widget',
            private: false,
            version: '9.9.9'
          },
          null,
          2
        )
      );

      await packageJsonGenerator(tree, {
        dir: 'libs/test',
        name: 'widget'
      });

      expect(JSON.parse(tree.read('libs/test/package.json', 'utf-8') ?? '{}')).toEqual({
        name: 'existing/widget',
        private: false,
        version: '9.9.9'
      });
      expect(packageVersionGenerator).not.toHaveBeenCalled();
      expect(formatFiles).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        'Package.json already exists at "libs/test/package.json". Skipping generation.'
      );
    });

    it('replaces the existing package.json when overwrite is true', async () => {
      tree.write(
        'libs/test/package.json',
        JSON.stringify(
          {
            custom: true,
            name: 'existing/widget',
            version: '9.9.9'
          },
          null,
          2
        )
      );

      await packageJsonGenerator(tree, {
        dir: 'libs/test',
        name: 'widget',
        overwrite: true,
        skipFormat: true
      });

      expect(JSON.parse(tree.read('libs/test/package.json', 'utf-8') ?? '{}')).toEqual({
        name: 'gamers-source/widget',
        private: true,
        version: '0.0.1'
      });
      expect(packageVersionGenerator).toHaveBeenCalledWith(tree, {
        path: 'libs/test/package.json',
        skipFormat: true,
        vers: '0.0.1'
      });
    });
  });
});
