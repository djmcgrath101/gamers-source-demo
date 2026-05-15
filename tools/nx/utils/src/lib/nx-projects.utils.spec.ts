import { NxProjectOptions } from '@gamers-source/nx-types';
import { joinPathFragments, ProjectConfiguration } from '@nx/devkit';
import { NX_PROJECT_TYPES } from './nx-projects.consts';
import {
  appendProjectTypeToSourceRootPath,
  determineProjectDirFromOpts,
  determineProjectNameFromOpts,
  determineTopLevelProjectDir,
  getProjectSourceRoot,
  isApplicationProject,
  isBackendProject,
  isFrontendProject,
  isLibraryProject,
  isProjectOfType,
  isTestableProject,
  isToolsProject,
  normalizeProjectName,
  stripProjectTypeFromName
} from './nx-projects.utils';

describe('nx-projects.utils', () => {
  describe('appendProjectTypeToSourceRootPath', () => {
    it('appends "app" for applications', () => {
      const project: ProjectConfiguration = {
        root: 'apps/my-app',
        sourceRoot: 'apps/my-app/src',
        projectType: 'application'
      };

      const result = appendProjectTypeToSourceRootPath(project);
      expect(result).toBe(joinPathFragments('apps/my-app/src', 'app'));
    });

    it('appends "lib" for libraries', () => {
      const project: ProjectConfiguration = {
        root: 'libs/my-lib',
        sourceRoot: 'libs/my-lib/src',
        projectType: 'library'
      };

      const result = appendProjectTypeToSourceRootPath(project);
      expect(result).toBe(joinPathFragments('libs/my-lib/src', 'lib'));
    });

    it('defaults to "root/src" when sourceRoot is not defined', () => {
      const project: ProjectConfiguration = {
        root: 'libs/my-lib',
        projectType: 'library'
      };

      const result = appendProjectTypeToSourceRootPath(project);
      expect(result).toBe(joinPathFragments('libs/my-lib/src', 'lib'));
    });

    it('handles cases where projectType is not explicitly defined', () => {
      const project: ProjectConfiguration = {
        root: 'apps/unknown',
        sourceRoot: 'apps/unknown/src'
      };

      const result = appendProjectTypeToSourceRootPath(project);
      expect(result).toBe(joinPathFragments('apps/unknown/src', 'lib'));
    });
  });

  describe('determineProjectDirFromOpts', () => {
    it('uses the specified directory if provided', () => {
      const options: NxProjectOptions = {
        name: 'my-app',
        scope: 'frontend',
        type: 'app',
        directory: 'custom/dir'
      };

      const result = determineProjectDirFromOpts(options);
      expect(result).toBe('custom/dir');
    });

    it('generates the directory based on type and name if no directory is specified', () => {
      const options: NxProjectOptions = {
        name: 'my-lib',
        scope: 'shared',
        type: 'data-access'
      };

      const result = determineProjectDirFromOpts(options);
      expect(result).toBe('libs/my-lib/data-access');
    });
  });

  describe('determineProjectNameFromOpts', () => {
    it('returns normalized library names when no project prefix is applied', () => {
      const options: NxProjectOptions = {
        name: 'my-lib',
        scope: 'shared',
        type: 'utils'
      };

      const result = determineProjectNameFromOpts(options);
      expect(result).toBe('my-lib-utils');
    });

    it('returns app project names unchanged', () => {
      const options: NxProjectOptions = {
        name: 'my-app',
        scope: 'shared',
        type: 'app'
      };

      const result = determineProjectNameFromOpts(options);
      expect(result).toBe('my-app');
    });
  });

  describe('determineTopLevelProjectDir', () => {
    it('returns "apps" for application projects', () => {
      const options: NxProjectOptions = {
        name: 'my-app',
        type: 'app',
        scope: 'frontend'
      };

      const result = determineTopLevelProjectDir(options);
      expect(result).toBe('apps');
    });

    it('returns "tools" for tool projects', () => {
      const options: NxProjectOptions = {
        name: 'my-tool',
        type: 'utils',
        scope: 'tools'
      };

      const result = determineTopLevelProjectDir(options);
      expect(result).toBe('tools');
    });

    it('returns "libs" for library projects', () => {
      const options: NxProjectOptions = {
        name: 'my-lib',
        type: 'types',
        scope: 'shared'
      };

      const result = determineTopLevelProjectDir(options);
      expect(result).toBe('libs');
    });
  });

  describe('getProjectSourceRoot', () => {
    it('returns the sourceRoot if defined', () => {
      const projectConfig: ProjectConfiguration = {
        root: 'libs/my-lib',
        sourceRoot: 'libs/my-lib/src',
        projectType: 'library'
      };

      const result = getProjectSourceRoot(projectConfig);
      expect(result).toBe('libs/my-lib/src');
    });

    it('defaults to "root/src" when sourceRoot is not defined', () => {
      const projectConfig: ProjectConfiguration = {
        root: 'libs/my-lib',
        projectType: 'library'
      };

      const result = getProjectSourceRoot(projectConfig);
      expect(result).toBe('libs/my-lib/src');
    });
  });

  describe('isApplicationProject', () => {
    it('returns true when project type is "application"', () => {
      const projectConfig: ProjectConfiguration = {
        projectType: 'application'
      } as ProjectConfiguration;
      expect(isApplicationProject(projectConfig)).toBe(true);
    });

    it('returns false when project type is not "application"', () => {
      const projectConfig: ProjectConfiguration = {
        projectType: 'library'
      } as ProjectConfiguration;
      expect(isApplicationProject(projectConfig)).toBe(false);
    });
  });

  describe('isBackendProject', () => {
    it('returns true when backend scope tag is present', () => {
      const projectConfig: ProjectConfiguration = {
        tags: ['scope:backend']
      } as ProjectConfiguration;

      expect(isBackendProject(projectConfig)).toBe(true);
    });

    it('returns false when backend scope tag is not present', () => {
      const projectConfig: ProjectConfiguration = {
        tags: ['scope:frontend']
      } as ProjectConfiguration;

      expect(isBackendProject(projectConfig)).toBe(false);
    });
  });

  describe('isFrontendProject', () => {
    it('returns true when frontend scope tag is present', () => {
      const projectConfig: ProjectConfiguration = {
        tags: ['scope:frontend']
      } as ProjectConfiguration;

      expect(isFrontendProject(projectConfig)).toBe(true);
    });

    it('returns false when frontend scope tag is not present', () => {
      const projectConfig: ProjectConfiguration = {
        tags: ['scope:backend']
      } as ProjectConfiguration;

      expect(isFrontendProject(projectConfig)).toBe(false);
    });
  });

  describe('isLibraryProject', () => {
    it('returns true for library projects', () => {
      expect(isLibraryProject('data-access')).toBe(true);
    });

    it('returns false for application projects', () => {
      expect(isLibraryProject('app')).toBe(false);
    });
  });

  describe('isProjectOfType', () => {
    it('returns true for projects of the specified type', () => {
      const projectConfig = {
        tags: ['type:data-access']
      };
      expect(isProjectOfType(projectConfig, 'data-access')).toBe(true);
    });

    it('returns false for projects of a different type', () => {
      const projectConfig = {
        tags: ['type:data-access']
      };
      expect(isProjectOfType(projectConfig, 'ui')).toBe(false);
    });
  });

  describe('isTestableProject', () => {
    it('returns true for application projects', () => {
      expect(isTestableProject('app')).toBe(true);
    });

    it('returns true for data-access projects', () => {
      expect(isTestableProject('data-access')).toBe(true);
    });

    it('returns false for testing projects', () => {
      expect(isTestableProject('testing')).toBe(false);
    });

    it('returns false for types projects', () => {
      expect(isTestableProject('types')).toBe(false);
    });
  });

  describe('isToolsProject', () => {
    it('returns true when tools scope tag is present', () => {
      const projectConfig: ProjectConfiguration = {
        tags: ['scope:tools']
      } as ProjectConfiguration;

      expect(isToolsProject(projectConfig)).toBe(true);
    });

    it('returns false when tools scope tag is not present', () => {
      const projectConfig: ProjectConfiguration = {
        tags: ['scope:backend']
      } as ProjectConfiguration;

      expect(isToolsProject(projectConfig)).toBe(false);
    });
  });

  describe('normalizeProjectName', () => {
    it('returns the name unchanged for application projects', () => {
      const name = 'my-app';
      const type = 'app';
      const result = normalizeProjectName(name, type);
      expect(result).toBe(name);
    });

    it('appends the type suffix for library projects', () => {
      const name = 'my-lib';
      const type = 'data-access';
      const result = normalizeProjectName(name, type);
      expect(result).toBe('my-lib-data-access');
    });

    it('does not append the type suffix if already present', () => {
      const name = 'my-lib-data-access';
      const type = 'data-access';
      const result = normalizeProjectName(name, type);
      expect(result).toBe(name);
    });
  });

  describe('stripProjectTypeFromName', () => {
    it('strips all known suffixes from the project name', () => {
      NX_PROJECT_TYPES.forEach(type => {
        const name = `shared-${type}`;
        expect(stripProjectTypeFromName(name)).toEqual('shared');
      });
    });

    it("leaves intact names that don't contain the suffix", () => {
      const name = 'shared-models';
      expect(stripProjectTypeFromName(name)).toEqual('shared-models');
    });
  });
});
