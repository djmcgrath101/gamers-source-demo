import { SetRequired } from 'type-fest';

/**
 * Sets required properties common to all Nx project options.
 */
export type NormalizedNxProjectOptions<
  S extends NxProjectScope = NxProjectScope,
  T extends NxProjectType = NxProjectType
> = SetRequired<NxProjectOptions<S, T>, 'buildable' | 'directory' | 'tags'>;

/**
 * Union of all valid Nx project library types.
 */
export type NxProjectLibType =
  | 'core'
  | 'data-access'
  | 'feature'
  | 'plugin'
  | 'testing'
  | 'types'
  | 'ui'
  | 'utils';

/**
 * Common options for all Nx project generators.
 */
export interface NxProjectOptions<
  S extends NxProjectScope = NxProjectScope,
  T extends NxProjectType = NxProjectType
> {
  buildable?: boolean;
  directory?: string;
  name: string;
  tags?: string;
  scope: S;
  type: T;
}

/**
 * Union of all valid Nx project scopes.
 */
export type NxProjectScope = 'shared' | 'tools';

/**
 * Union of all valid Nx project types.
 */
export type NxProjectType = 'app' | NxProjectLibType;
