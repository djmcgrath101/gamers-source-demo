import {
  NormalizedNxProjectOptions,
  NxProjectLibType,
  NxProjectOptions
} from '@gamers-source/nx-types';
import { Schema } from '@nx/angular/src/generators/library/schema';
import { Except, SetOptional, SetRequired, Simplify } from 'type-fest';

export type NgLibType = Extract<
  NxProjectLibType,
  'core' | 'data-access' | 'feature' | 'ui' | 'utils'
>;

export type NgLibGeneratorOptions = Simplify<
  // We keep `directory` optional so callers can override the default path normalization when needed.
  SetOptional<Schema, 'directory'> &
    // We also exclude `scope` from `NxProjectOptions` because we will hard-code it to be 'frontend'.
    Except<NxProjectOptions<'frontend', NgLibType>, 'scope'>
> & {
  /**
   * Generate a library with a minimal setup. No README.md generated.
   */
  readonly minimal?: boolean;
};

export type NormalizedNgLibGeneratorOptions = SetRequired<NgLibGeneratorOptions, 'directory'> &
  NormalizedNxProjectOptions<'frontend', NgLibType>;
