import { NxProjectScope, NxProjectType } from '@gamers-source/nx-types';

export const NX_PROJECT_SCOPES: readonly NxProjectScope[] = [
  'backend',
  'frontend',
  'shared',
  'tools'
];

/**
 * Array of recognized Nx project types.
 */
export const NX_PROJECT_TYPES: readonly NxProjectType[] = [
  'app',
  'data-access',
  'feature',
  'plugin',
  'testing',
  'types',
  'ui',
  'utils'
];
