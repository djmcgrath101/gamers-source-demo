import {
  addProjectConfiguration,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration
} from '@nx/devkit';
import { wrapAngularDevkitSchematic } from '@nx/devkit/ngcli-adapter';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { setupPwaGenerator } from './generator';

vi.mock('@nx/devkit/ngcli-adapter', () => ({
  wrapAngularDevkitSchematic: vi.fn()
}));

describe('setupPwaGenerator', () => {
  let tree: Tree;

  function addTestApplicationProject(options?: {
    name?: string;
    root?: string;
    sourceRoot?: string;
    withAssetsDir?: boolean;
  }): void {
    const name = options?.name ?? 'test-app';
    const root = options?.root ?? `apps/${name}`;
    const sourceRoot = options?.sourceRoot ?? `${root}/src`;
    const withAssetsDir = options?.withAssetsDir ?? false;

    addProjectConfiguration(tree, name, {
      root,
      sourceRoot,
      projectType: 'application',
      targets: {
        build: {
          executor: '@angular/build:application',
          options: {
            browser: `${sourceRoot}/main.ts`,
            serviceWorker: false
          }
        }
      },
      tags: []
    });

    tree.write(`${sourceRoot}/main.ts`, 'console.log("bootstrap");\n');

    if (withAssetsDir) {
      tree.write(`${sourceRoot}/assets/.gitkeep`, '');
    }
  }

  function mockUpstreamPwaGenerator(
    writeGeneratedFiles?: (host: Tree, options: { project: string }) => void
  ): void {
    vi.mocked(wrapAngularDevkitSchematic).mockReturnValue(
      vi.fn(async (host: Tree, generatorOptions: { [k: string]: any }) => {
        // Seed only the files that Angular's schematic would have added for this branch.
        if (
          writeGeneratedFiles &&
          generatorOptions &&
          typeof generatorOptions.project === 'string'
        ) {
          writeGeneratedFiles(host, { project: generatorOptions.project });
        }
        return async () => Promise.resolve();
      })
    );
  }

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    vi.mocked(wrapAngularDevkitSchematic).mockReset();
    mockUpstreamPwaGenerator();
  });

  it('rewrites the PWA files inside sourceRoot assets when the project already uses assets', async () => {
    addTestApplicationProject({
      withAssetsDir: true
    });

    mockUpstreamPwaGenerator((host, options) => {
      host.write(`apps/${options.project}/src/assets/icons/icon-72x72.png`, 'icon');
      host.write(
        `apps/${options.project}/src/assets/manifest.webmanifest`,
        '{"icons":[{"src":"icons/icon-72x72.png"}]}'
      );
    });

    await setupPwaGenerator(tree, {
      project: 'test-app',
      skipFormat: true
    });

    expect(tree.exists('apps/test-app/src/assets/images/favicons/icon-72x72.png')).toBe(true);
    expect(tree.exists('apps/test-app/src/assets/icons/icon-72x72.png')).toBe(false);
    expect(tree.read('apps/test-app/src/assets/manifest.webmanifest', 'utf-8')).toContain(
      'images/favicons/icon-72x72.png'
    );
    expect(tree.read('apps/test-app/src/assets/manifest.webmanifest', 'utf-8')).toContain(
      '"name": "Test App"'
    );

    expect(readProjectConfiguration(tree, 'test-app').targets?.build.options.serviceWorker).toBe(
      'apps/test-app/ngsw-config.json'
    );
  });

  it('rewrites the PWA files inside public when the project does not use assets', async () => {
    addTestApplicationProject();

    mockUpstreamPwaGenerator((host, options) => {
      host.write(`apps/${options.project}/public/icons/icon-72x72.png`, 'icon');
      host.write(
        `apps/${options.project}/public/manifest.webmanifest`,
        '{"icons":[{"src":"icons/icon-72x72.png"}]}'
      );
    });

    await setupPwaGenerator(tree, {
      project: 'test-app',
      skipFormat: true
    });

    expect(tree.exists('apps/test-app/public/images/favicons/icon-72x72.png')).toBe(true);
    expect(tree.exists('apps/test-app/public/icons/icon-72x72.png')).toBe(false);
    expect(tree.read('apps/test-app/public/manifest.webmanifest', 'utf-8')).toContain(
      'images/favicons/icon-72x72.png'
    );
    expect(tree.read('apps/test-app/public/manifest.webmanifest', 'utf-8')).toContain(
      '"name": "Test App"'
    );

    expect(wrapAngularDevkitSchematic).toHaveBeenCalledWith('@angular/pwa', 'ng-add');
    expect(readProjectConfiguration(tree, 'test-app').targets?.build.options.serviceWorker).toBe(
      'apps/test-app/ngsw-config.json'
    );
  });

  it('does not fail when re-running after the icons directory has already been moved', async () => {
    addTestApplicationProject();
    tree.write('apps/test-app/public/images/favicons/icon-72x72.png', 'icon');

    mockUpstreamPwaGenerator();

    await expect(
      setupPwaGenerator(tree, {
        project: 'test-app',
        skipFormat: true
      })
    ).resolves.toEqual(expect.any(Function));
  });

  it('preserves an existing service worker build option', async () => {
    addTestApplicationProject();
    const projectConfiguration = readProjectConfiguration(tree, 'test-app');
    const buildTarget = projectConfiguration.targets?.build;

    if (!buildTarget) {
      throw new Error('Expected test project to have a build target.');
    }

    buildTarget.options.serviceWorker = 'custom-ngsw-config.json';
    updateProjectConfiguration(tree, 'test-app', projectConfiguration);

    await setupPwaGenerator(tree, {
      project: 'test-app',
      skipFormat: true
    });

    expect(readProjectConfiguration(tree, 'test-app').targets?.build.options.serviceWorker).toBe(
      'custom-ngsw-config.json'
    );
  });
});
