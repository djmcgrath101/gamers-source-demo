import { SetRequired } from 'type-fest';

export interface TsFileGeneratorOptions {
  /**
   * Whether to add a spec file for the generated file.
   */
  readonly addSpec?: boolean;
  /**
   * Directory in which to place the file relative to the project root.
   */
  readonly directory?: string;
  /**
   * Whether to export the generated file as part of the public API of the project.
   */
  readonly export?: boolean;
  /**
   * Name of the file in kebab-case.
   */
  readonly name: string;
  /**
   * Name of the project in which to generate the file.
   */
  readonly project: string;
  /**
   * Whether to skip formatting files.
   */
  readonly skipFormat?: boolean;
  /**
   * Type of dependencies the file will be exporting.  This will determine the suffix portion of the generated filename.  Sensible defaults will also be defined if the type is one of the known project types.
   */
  readonly type: string;
}

export type NormalizedTsFileGeneratorOptions = SetRequired<
  TsFileGeneratorOptions,
  'addSpec' | 'export'
>;
