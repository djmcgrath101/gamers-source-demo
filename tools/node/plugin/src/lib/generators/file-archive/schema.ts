import { FileArchiveFormat } from '@gamers-source/shared-node-utils';
import { SetRequired } from 'type-fest';

export interface FileArchiveGeneratorOptions {
  /**
   * Path to folder where the archive file should be placed (relative to the workspace root).
   * If not provided, defaults to the source folder.
   */
  readonly destination?: string;
  /**
   * Name of the archive file.  Defaults to the source directory name if not provided
   */
  readonly filename?: string;
  /**
   * The format of the archive, either zip or tar. Defaults to 'zip' if not provided.
   */
  readonly format?: FileArchiveFormat;
  /**
   * Whether to overwrite the archive file if it already exists. Defaults to false.
   */
  readonly overwrite?: boolean;
  /**
   * Path to folder containing the files to be archived (relative to the workspace root).
   */
  readonly source: string;
}

export type NormalizedFileArchiveGeneratorOptions = SetRequired<
  FileArchiveGeneratorOptions,
  'destination' | 'filename' | 'format'
>;
