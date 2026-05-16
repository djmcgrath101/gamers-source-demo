import { setupTailwindGenerator as nxSetupTailwindGenerator } from '@nx/angular/generators';
import { addProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { setupTailwindGenerator } from './generator';

vi.mock('@nx/angular/generators', () => ({
  setupTailwindGenerator: vi.fn(async () => async () => {})
}));

describe('setupTailwindGenerator', () => {
  let tree: Tree;

  // Keep fixtures minimal so each test only exercises generator branching.
  function addTestApplicationProject(options?: {
    name?: string;
    root?: string;
    sourceRoot?: string;
    styleUrl?: string;
    styleContents?: string;
  }): void {
    const name = options?.name ?? 'test-app';
    const root = options?.root ?? `apps/${name}`;
    const sourceRoot = options?.sourceRoot ?? `${root}/src`;
    const styleUrl = options?.styleUrl ?? './app.component.scss';
    const resolvedStylePath = styleUrl.replace('./', '');

    addProjectConfiguration(tree, name, {
      root,
      sourceRoot,
      projectType: 'application',
      targets: {
        build: {
          executor: '@angular/build:application',
          options: {
            browser: `${sourceRoot}/main.ts`,
            inlineStyleLanguage: 'scss'
          }
        }
      },
      tags: []
    });

    tree.write(
      `${sourceRoot}/main.ts`,
      `import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

void bootstrapApplication(AppComponent);`
    );
    tree.write(
      `${sourceRoot}/app/app.component.ts`,
      `import { Component } from '@angular/core';

@Component({
  selector: 'test-root',
  template: '',
  styleUrl: '${styleUrl}'
})
export class AppComponent {}`
    );
    tree.write(
      `${sourceRoot}/app/${resolvedStylePath}`,
      options?.styleContents ?? ':host { display: block; }\n'
    );
  }

  function addTestLibraryProject(): void {
    addProjectConfiguration(tree, 'test-lib', {
      root: 'libs/test-lib',
      sourceRoot: 'libs/test-lib/src',
      projectType: 'library',
      targets: {
        build: {
          executor: '@nx/angular:package',
          options: {}
        }
      },
      tags: []
    });
  }

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    vi.mocked(nxSetupTailwindGenerator).mockClear();
  });

  it('updates the root component stylesheet referenced by the bootstrap entry point', async () => {
    addTestApplicationProject({
      styleContents: ':host { display: block; }\n'
    });

    await setupTailwindGenerator(tree, {
      project: 'test-app',
      skipFormat: true
    });

    expect(tree.exists('apps/test-app/src/app/app.component.scss')).toBe(true);
    expect(tree.read('apps/test-app/src/app/app.component.scss', 'utf-8')).toContain(
      '@apply block fill-space;'
    );
    expect(tree.read('apps/test-app/src/app/app.component.scss', 'utf-8')).toContain(
      ':host { display: block; }'
    );
  });

  it('uses the component metadata instead of assuming app.component.scss', async () => {
    addTestApplicationProject({
      name: 'custom-style-app',
      styleUrl: './root-shell.css'
    });

    await setupTailwindGenerator(tree, {
      project: 'custom-style-app',
      skipFormat: true
    });

    expect(tree.exists('apps/custom-style-app/src/app/root-shell.css')).toBe(true);
    expect(tree.read('apps/custom-style-app/src/app/root-shell.css', 'utf-8')).toContain(
      '@apply block fill-space;'
    );
    expect(tree.exists('apps/custom-style-app/src/app/app.component.scss')).toBe(false);
  });

  it('does not create an app stylesheet template for libraries', async () => {
    addTestLibraryProject();

    await setupTailwindGenerator(tree, {
      project: 'test-lib',
      skipFormat: true
    });

    expect(tree.exists('libs/test-lib/src/app/app.component.scss')).toBe(false);
  });

  it('returns the upstream install task when it creates a Tailwind config', async () => {
    addTestApplicationProject();
    const installTask = vi.fn();
    vi.mocked(nxSetupTailwindGenerator).mockResolvedValueOnce(installTask);

    const callback = await setupTailwindGenerator(tree, {
      project: 'test-app',
      skipFormat: true
    });

    expect(typeof callback).toBe('function');
    expect(callback).toBe(installTask);
    expect(nxSetupTailwindGenerator).toHaveBeenCalledWith(tree, {
      project: 'test-app',
      skipFormat: true
    });
    expect(tree.exists('apps/test-app/tailwind.config.js')).toBe(true);
  });

  it('does not overwrite an existing Tailwind config', async () => {
    addTestApplicationProject();
    tree.write('apps/test-app/tailwind.config.js', 'module.exports = { presets: [] };');

    const callback = await setupTailwindGenerator(tree, {
      project: 'test-app',
      skipFormat: true
    });

    expect(typeof callback).toBe('function');
    expect(nxSetupTailwindGenerator).not.toHaveBeenCalled();
    expect(tree.read('apps/test-app/tailwind.config.js', 'utf-8')).toBe(
      'module.exports = { presets: [] };'
    );
  });

  it('uses the configured sourceRoot when resolving the application stylesheet', async () => {
    addTestApplicationProject({
      name: 'custom-root-app',
      root: 'apps/custom-root-app',
      sourceRoot: 'apps/custom-root-app/client'
    });

    await setupTailwindGenerator(tree, {
      project: 'custom-root-app',
      skipFormat: true
    });

    expect(tree.exists('apps/custom-root-app/client/app/app.component.scss')).toBe(true);
    expect(tree.read('apps/custom-root-app/client/app/app.component.scss', 'utf-8')).toContain(
      '@apply block fill-space;'
    );
  });
});
