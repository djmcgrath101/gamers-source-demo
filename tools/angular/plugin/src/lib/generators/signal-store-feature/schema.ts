import { SetRequired } from 'type-fest/source/set-required';

export interface SignalStoreFeatureGeneratorOptions {
  /**
   * A directory where the library is placed relative to the project 'src/(app|lib)' folder.  If not provided, the Signal Store Feature will be placed in the 'features' folder.
   */
  readonly directory?: string;
  /**
   * Whether to export the generated file as part of the public API of the project.
   */
  readonly export?: boolean;
  /**
   * Name of the Signal Store Feature.
   */
  readonly name: string;
  /**
   * The name of the project in which to place the Signal Store Feature. Valid project types are: app, data-access, feature, utils and ui.
   */
  readonly project: string;
  /**
   * Skip formatting files.
   */
  readonly skipFormat?: boolean;
}

export type NormalizedSignalStoreFeatureGeneratorOptions = SetRequired<
  SignalStoreFeatureGeneratorOptions,
  'directory' | 'export'
>;
