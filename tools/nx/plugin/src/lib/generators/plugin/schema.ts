import { NormalizedNxProjectOptions, NxProjectOptions } from '@gamers-source/nx-types';
import { Schema as NxPluginGeneratorSchema } from '@nx/plugin/src/generators/plugin/schema';
import { Except, SetOptional, SetRequired } from 'type-fest';

export type NxPluginGeneratorOptions = Except<NxProjectOptions, 'scope' | 'type'> &
  SetOptional<NxPluginGeneratorSchema, 'directory'> & {
    /**
     * Enables the @nx/dependency-checks ESLint rule to ensure that the library
     * does not import dependencies that are not listed in its `package.json`.
     */
    checkDependencies?: boolean;
  };

export type NormalizedNxPluginGeneratorOptions = SetRequired<
  NxPluginGeneratorOptions,
  'checkDependencies'
> &
  NormalizedNxProjectOptions;
