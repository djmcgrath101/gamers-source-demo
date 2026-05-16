import { ProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import {
  configureAngularJestTransformIgnorePatterns,
  deriveSelectorPrefixFromNgAppName,
  isAngularApp
} from './ng-projects.utils';

describe('ng-projects.utils', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  describe('configureAngularJestTransformIgnorePatterns', () => {
    it('replaces an existing transformIgnorePatterns setting', () => {
      tree.write(
        'apps/test-app/jest.config.ts',
        `export default {
  displayName: 'test-app',
  transformIgnorePatterns: ['node_modules/(?!.*\\\\.mjs$)'],
  snapshotSerializers: []
};
`
      );

      configureAngularJestTransformIgnorePatterns(tree, 'apps/test-app');

      const jestConfig = tree.read('apps/test-app/jest.config.ts', 'utf-8');

      expect(jestConfig).toContain("'node_modules/.pnpm/(?!(lodash-es)@|.*\\\\.mjs$)'");
      expect(jestConfig).toContain("'node_modules/(?!\\\\.pnpm|lodash-es/|.*\\\\.mjs$)'");
      expect(jestConfig).not.toContain("['node_modules/(?!.*\\\\.mjs$)']");
    });

    it('inserts transformIgnorePatterns before snapshot serializers when the setting is missing', () => {
      tree.write(
        'apps/test-app/jest.config.ts',
        `export default {
  displayName: 'test-app',
  snapshotSerializers: []
};
`
      );

      configureAngularJestTransformIgnorePatterns(tree, 'apps/test-app');

      const jestConfig = tree.read('apps/test-app/jest.config.ts', 'utf-8');

      expect(jestConfig).toContain(`  transformIgnorePatterns: [
    'node_modules/.pnpm/(?!(lodash-es)@|.*\\\\.mjs$)',
    'node_modules/(?!\\\\.pnpm|lodash-es/|.*\\\\.mjs$)'
  ],
  snapshotSerializers: []`);
    });

    it('appends transformIgnorePatterns when there is no serializer anchor', () => {
      tree.write(
        'apps/test-app/jest.config.ts',
        `export default {
  displayName: 'test-app'
};
`
      );

      configureAngularJestTransformIgnorePatterns(tree, 'apps/test-app');

      const jestConfig = tree.read('apps/test-app/jest.config.ts', 'utf-8');

      expect(jestConfig).toContain(`export default {
  displayName: 'test-app',
  transformIgnorePatterns: [
    'node_modules/.pnpm/(?!(lodash-es)@|.*\\\\.mjs$)',
    'node_modules/(?!\\\\.pnpm|lodash-es/|.*\\\\.mjs$)'
  ]
};`);
    });

    it('does nothing when the project does not have a Jest config file', () => {
      configureAngularJestTransformIgnorePatterns(tree, 'apps/test-app');

      expect(tree.exists('apps/test-app/jest.config.ts')).toBe(false);
    });

    it('does nothing when the Jest config file is empty', () => {
      tree.write('apps/test-app/jest.config.ts', '');

      configureAngularJestTransformIgnorePatterns(tree, 'apps/test-app');

      expect(tree.read('apps/test-app/jest.config.ts', 'utf-8')).toBe('');
    });
  });

  describe('deriveSelectorPrefixFromNgAppName', () => {
    it('should derive prefix from app name', () => {
      expect(deriveSelectorPrefixFromNgAppName('my-angular-app')).toBe('maa');
    });
  });

  describe('isAngularApp', () => {
    it('returns true when project is both an application and an Angular project', () => {
      const projectConfig: ProjectConfiguration = {
        projectType: 'application',
        targets: { build: { executor: '@angular-devkit/build-angular:browser' } },
        root: ''
      } as ProjectConfiguration;

      expect(isAngularApp(projectConfig)).toBe(true);
    });

    it('returns false when project is not an application', () => {
      const projectConfig: ProjectConfiguration = {
        projectType: 'library',
        targets: { build: { executor: '@angular-devkit/build-angular:browser' } },
        root: ''
      } as ProjectConfiguration;

      expect(isAngularApp(projectConfig)).toBe(false);
    });
  });
});
