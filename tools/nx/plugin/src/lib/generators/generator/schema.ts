import { Schema as NxGeneratorSchema } from '@nx/plugin/src/generators/generator/schema';
import { Except, SetRequired } from 'type-fest';

/**
 * Normalized `nx-gen` options used at runtime.
 */
export type NormalizedNxGeneratorGeneratorOptions = SetRequired<
  NxGeneratorGeneratorOptions,
  'directory' | 'minimal'
>;

/**
 * User-facing options for the `nx-gen` generator.
 */
export interface NxGeneratorGeneratorOptions extends Except<NxGeneratorSchema, 'path'> {
  /**
   * A directory relative to the plugin's `src/lib/generators` directory in which to create the generator files.  Defaults to the generator name.
   */
  readonly directory?: string;
  /**
   * Generate a minimal generator setup with no README.md file in the generated generator directory.
   */
  readonly minimal?: boolean;
  /**
   * The generator name to export in the plugin generators collection.
   */
  readonly name: string;
  /**
   * The name of the project in which to place the generator.  Project must be of type `plugin`.
   */
  readonly project: string;
}
