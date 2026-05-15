import {
  NormalizedNxProjectOptions,
  NxProjectOptions,
  NxProjectType
} from '@gamers-source/nx-types';
import { joinPathFragments, logger, ProjectConfiguration } from '@nx/devkit';
import { createProjectTags, NxProjectTags } from './nx-project-tags.utils';
import { NX_PROJECT_TYPES } from './nx-projects.consts';

/**
 * Appends the project type to the path of the project source root.
 * (ie. 'app' for applications, 'lib' for libraries).
 */
export function appendProjectTypeToSourceRootPath(project: ProjectConfiguration): string {
  const root = project.sourceRoot ? project.sourceRoot : joinPathFragments(project.root, 'src');
  const projectTypeDir = project.projectType === 'application' ? 'app' : 'lib';

  return joinPathFragments(root, projectTypeDir);
}

/**
 * Determines the project directory based on the provided options.
 * If a directory is specified, it uses that; otherwise, it constructs
 * the directory based on the project type and name.
 */
export function determineProjectDirFromOpts<T extends NxProjectOptions>(options: T): string {
  const { directory, name, type } = options;

  if (directory) {
    return directory;
  }

  const pathFragments = [determineTopLevelProjectDir(options)];

  pathFragments.push(stripProjectTypeFromName(name));

  if (isLibraryProject(type)) {
    pathFragments.push(type);
  }

  return joinPathFragments(...pathFragments);
}

export function determineProjectNameFromOpts<T extends NxProjectOptions>(options: T): string {
  const { name, type } = options;

  return normalizeProjectName(name, type);
}

/**
 * Determines the top-level project directory based on the project options.
 */
export function determineTopLevelProjectDir<T extends NxProjectOptions>(options: T): string {
  if (options.type === 'app') {
    return 'apps';
  } else if (options.scope === 'tools') {
    return 'tools';
  } else {
    return 'libs';
  }
}

/**
 * Retrieves the source root for the specified project configuration.
 * If the source root is not explicitly defined in the configuration,
 * it defaults to '<project root>/src'.
 */
export function getProjectSourceRoot(projectConfig: ProjectConfiguration): string {
  return projectConfig.sourceRoot || joinPathFragments(projectConfig.root, 'src');
}

/**
 * Determines whether a project is an application based on its
 * project type.
 */
export function isApplicationProject(projectConfig: ProjectConfiguration): boolean {
  return projectConfig?.projectType === 'application' || false;
}

/**
 * Determines whether a project is a frontend application based on its
 * project scope.
 */
export function isBackendProject(projectConfig: ProjectConfiguration): boolean {
  const tags = new NxProjectTags(projectConfig.tags);
  return tags.hasTag('scope', 'backend');
}

/**
 * Determines whether a project is a frontend application based on its
 * project scope.
 */
export function isFrontendProject(projectConfig: ProjectConfiguration): boolean {
  const tags = new NxProjectTags(projectConfig.tags);
  return tags.hasTag('scope', 'frontend');
}

/**
 * Determines whether a project is a library based on its
 * project type.
 */
export function isLibraryProject(type: NxProjectType): boolean {
  return type !== 'app';
}

/**
 * Determines whether a project is of a specific type.
 */
export function isProjectOfType<
  T extends Pick<ProjectConfiguration, 'tags'>,
  U extends NxProjectType
>(projectConfig: T, ...types: U[]): boolean {
  const tags = projectConfig.tags ?? [];
  return types.some(type => tags.includes(`type:${type}`));
}

/**
 * Determines whether a project should be configured for testing
 * based on its type.
 */
export function isTestableProject(type: NxProjectType): boolean {
  return type !== 'testing' && type !== 'types';
}

/**
 * Determines whether a project is a tools project based on its
 * project scope.
 */
export function isToolsProject(projectConfig: ProjectConfiguration): boolean {
  const tags = new NxProjectTags(projectConfig.tags);
  return tags.hasTag('scope', 'tools');
}

/**
 * For applicable project types, ensures the project name ends with the type suffix.
 */
export function normalizeProjectName(name: string, type: NxProjectType): string {
  if (type === 'app') {
    return name;
  }

  return name.endsWith(`-${type}`) ? name : `${name}-${type}`;
}

export function normalizeProjectOptions<T extends NxProjectOptions>(
  options: T
): T & NormalizedNxProjectOptions {
  const name = determineProjectNameFromOpts(options);
  const directory = determineProjectDirFromOpts(options);
  const requestedBuildable = !!options.buildable;

  let buildable = requestedBuildable;

  // Production libraries import testing libraries, which causes
  // Nx to treat them as buildable dependencies. To avoid this,
  // we force explicitly requested testing libraries to be non-buildable.
  if (options.type === 'testing' && requestedBuildable) {
    logger.warn(
      `The "testing" library type cannot be buildable. Setting buildable to false for project "${name}".`
    );
    buildable = false;
  }

  return {
    ...options,
    buildable,
    directory,
    name,
    tags: createProjectTags(options).toString()
  };
}

/**
 * Strips the project type suffix from the project name.
 */
export function stripProjectTypeFromName(name: string): string {
  const suffixPattern = new RegExp(`-(${NX_PROJECT_TYPES.join('|')})$`, 'g');

  return name.replace(suffixPattern, '');
}
