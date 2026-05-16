import { SetRequired } from 'type-fest';

export interface SignalStoreGeneratorOptions {
  /**
   * A directory where the library is placed relative to the project 'src/(app|lib)' folder.  If not provided, the Signal Store will be placed in the 'stores/' folder.
   */
  readonly directory?: string;
  /**
   * Whether to export the generated file as part of the public API of the project.
   */
  readonly export?: boolean;
  /**
   * Name of the Signal Store.
   */
  readonly name: string;
  /**
   * The name of the project in which to place the Signal Store. Valid project types are: app, data-access, feature, ui, or utils.
   */
  readonly project: string;
  /**
   * If true, the Signal Store will be provided in the root injector. If false, the store will need to be provided manually.
   */
  readonly providedInRoot?: boolean;
  /**
   * Skip formatting files.
   */
  readonly skipFormat?: boolean;
  /**
   * Skip adding logger feature to the Signal Store.
   */
  readonly skipLogger?: boolean;
}

export type NormalizedSignalStoreGeneratorOptions = SetRequired<
  SignalStoreGeneratorOptions,
  'directory' | 'export' | 'providedInRoot' | 'skipLogger'
>;
