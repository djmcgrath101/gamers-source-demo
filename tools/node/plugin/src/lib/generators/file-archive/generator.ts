import { listFilesRecursively } from '@gamers-source/nx-utils';
import { FileBufferArchiver } from '@gamers-source/shared-node-utils';
import { joinPathFragments, logger, Tree } from '@nx/devkit';
import { basename } from 'node:path';
import { FileArchiveGeneratorOptions, NormalizedFileArchiveGeneratorOptions } from './schema';

export async function fileArchiveGenerator(tree: Tree, rawOptions: FileArchiveGeneratorOptions) {
  const options = normalizeOpts(rawOptions);
  const filePaths = listFilesRecursively(tree, options.source);

  if (filePaths.length === 0) {
    logger.warn(
      `No files found in the source directory: ${options.source}.  Aborting archive creation.`
    );
    return;
  }

  if (!options.overwrite && tree.exists(joinPathFragments(options.destination, options.filename))) {
    logger.warn(
      `Archive file already exists: ${joinPathFragments(
        options.destination,
        options.filename
      )}.  Set override option to true to overwrite the existing file.  Aborting archive creation.`
    );
    return;
  }

  logger.info(`Creating archive file from source path: ${options.source} ...`);

  const fileSources = filePaths.map(path => ({
    content: tree.read(path) as Buffer,
    name: path.replace(options.source, '')
  }));

  logger.info(`Found ${fileSources.length} files to include in the archive.`);

  const destination = joinPathFragments(options.destination, options.filename);
  const zipBuffer = await new FileBufferArchiver(...fileSources).archive(options.format);

  tree.write(destination, zipBuffer);

  logger.info(`Archive created: ${destination} (${zipBuffer.length} bytes)`);
}

function normalizeOpts(opts: FileArchiveGeneratorOptions): NormalizedFileArchiveGeneratorOptions {
  const format = opts.format || 'zip';

  return {
    ...opts,
    destination: opts.destination || opts.source,
    filename: opts.filename || `${basename(opts.source)}.${format}`,
    format,
    overwrite: opts.overwrite ?? false
  };
}

export default fileArchiveGenerator;
