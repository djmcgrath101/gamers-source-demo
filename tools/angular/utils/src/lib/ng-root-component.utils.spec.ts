import { addProjectConfiguration, ProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import {
  findBootstrapEntryPoint,
  findRootComponentPath,
  findRootComponentStylesheetPath,
  resolveImportPath
} from './ng-root-component.utils';

describe('ng-root-component.utils', () => {
  let tree: Tree;

  /**
   * Creates a minimal Angular application fixture for source file resolution tests.
   */
  function addAngularAppFixture(options?: {
    componentImportPath?: string;
    mainPath?: string;
    projectName?: string;
    root?: string;
    sourceRoot?: string;
    styleUrl?: string;
  }): ProjectConfiguration {
    const projectName = options?.projectName ?? 'test-app';
    const root = options?.root ?? `apps/${projectName}`;
    const sourceRoot = options?.sourceRoot ?? `${root}/src`;
    const mainPath = options?.mainPath ?? `${sourceRoot}/main.ts`;
    const componentImportPath = options?.componentImportPath ?? './app/app.component';
    const styleUrl = options?.styleUrl ?? './app.component.scss';

    addProjectConfiguration(tree, projectName, {
      root,
      sourceRoot,
      projectType: 'application',
      targets: {
        build: {
          executor: '@angular/build:application',
          options: {
            browser: mainPath
          }
        }
      },
      tags: []
    });

    tree.write(
      mainPath,
      `import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from '${componentImportPath}';

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
    tree.write(`${sourceRoot}/app/app.component.scss`, ':host {}\n');

    return {
      projectType: 'application',
      root,
      sourceRoot,
      targets: {
        build: {
          executor: '@angular/build:application',
          options: {
            browser: mainPath
          }
        }
      }
    } as ProjectConfiguration;
  }

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  describe('findBootstrapEntryPoint', () => {
    it('returns the browser entry point when present', () => {
      const projectConfig = {
        root: 'apps/test-app',
        targets: {
          build: {
            options: {
              browser: 'apps/test-app/src/main.ts'
            }
          }
        }
      } as ProjectConfiguration;

      expect(findBootstrapEntryPoint(projectConfig)).toBe('apps/test-app/src/main.ts');
    });

    it('falls back to the main entry point when browser is absent', () => {
      const projectConfig = {
        root: 'apps/test-app',
        targets: {
          build: {
            options: {
              main: 'apps/test-app/src/main.ts'
            }
          }
        }
      } as ProjectConfiguration;

      expect(findBootstrapEntryPoint(projectConfig)).toBe('apps/test-app/src/main.ts');
    });
  });

  describe('findRootComponentPath', () => {
    it('resolves the bootstrapped component import', () => {
      const projectConfig = addAngularAppFixture();

      expect(findRootComponentPath(tree, projectConfig)).toBe(
        'apps/test-app/src/app/app.component.ts'
      );
    });

    it('falls back to the conventional app component path', () => {
      addProjectConfiguration(tree, 'fallback-app', {
        root: 'apps/fallback-app',
        sourceRoot: 'apps/fallback-app/client',
        projectType: 'application',
        targets: {},
        tags: []
      });
      tree.write(
        'apps/fallback-app/client/app/app.component.ts',
        `import { Component } from '@angular/core';

@Component({
  selector: 'fallback-root',
  template: ''
})
export class AppComponent {}`
      );

      const projectConfig = {
        root: 'apps/fallback-app',
        sourceRoot: 'apps/fallback-app/client',
        projectType: 'application',
        targets: {}
      } as ProjectConfiguration;

      expect(findRootComponentPath(tree, projectConfig)).toBe(
        'apps/fallback-app/client/app/app.component.ts'
      );
    });
  });

  describe('findRootComponentStylesheetPath', () => {
    it('reads the component styleUrl metadata', () => {
      const projectConfig = addAngularAppFixture({
        styleUrl: './root-shell.css'
      });
      tree.write('apps/test-app/src/app/root-shell.css', ':host {}\n');

      expect(findRootComponentStylesheetPath(tree, projectConfig)).toBe(
        'apps/test-app/src/app/root-shell.css'
      );
    });

    it('reads the first component styleUrls entry', () => {
      const projectConfig = addAngularAppFixture();
      tree.write(
        'apps/test-app/src/app/app.component.ts',
        `import { Component } from '@angular/core';

@Component({
  selector: 'test-root',
  template: '',
  styleUrls: ['./first.css', './second.css']
})
export class AppComponent {}`
      );
      tree.write('apps/test-app/src/app/first.css', ':host {}\n');

      expect(findRootComponentStylesheetPath(tree, projectConfig)).toBe(
        'apps/test-app/src/app/first.css'
      );
    });
  });

  describe('resolveImportPath', () => {
    it('adds a ts extension when the import omits one', () => {
      expect(resolveImportPath('apps/test-app/src/main.ts', './app/app.component')).toBe(
        'apps/test-app/src/app/app.component.ts'
      );
    });

    it('preserves explicit file extensions', () => {
      expect(resolveImportPath('apps/test-app/src/app/app.component.ts', './root-shell.css')).toBe(
        'apps/test-app/src/app/root-shell.css'
      );
    });
  });
});
