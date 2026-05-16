import { Format, TarOptions, ZipOptions, create as createArchiver } from 'archiver';
import { PassThrough, Readable } from 'node:stream';

export type FileArchiveFormat = Format;

export type FileArchiveOptions = TarOptions | ZipOptions;

// Describes a single file to include in the archive
export interface FileArchiveSource {
  /**
   * The content of the file as a string, buffer, or stream
   */
  readonly content: string | Buffer | Readable;
  /**
   * Name of the file inside the archive
   */
  readonly name: string;
}

/**
 * Abstract base class for creating an archive from multiple sources.
 * Defines common behavior and interface for different output types (Buffer, Readable).
 */
export abstract class FileArchiver<T extends Buffer | Readable> {
  protected readonly sources: FileArchiveSource[] = [];

  /**
   * Optionally initialize with sources.
   * @param sources Initial files to add.
   */
  constructor(...sources: readonly FileArchiveSource[]) {
    this.addSources(...sources);
  }

  /**
   * Adds one or more sources to the archive.
   * @param sources Files to add.
   * @returns This instance (for chaining).
   */
  addSources(...sources: readonly FileArchiveSource[]): this {
    this.sources.push(...sources);

    return this;
  }

  /**
   * Creates an archive in the specified format.
   * Must be implemented by subclasses.
   */
  abstract archive(format: 'zip', options?: ZipOptions): Promise<T>;
  abstract archive(format: 'tar', options?: TarOptions): Promise<T>;
  abstract archive(format: FileArchiveFormat, options?: FileArchiveOptions): Promise<T>;

  /**
   * Creates a tar archive with maximum gzip compression by default.
   * @param options Optional tar-specific options.
   * @returns Archive as the output type defined by subclass.
   */
  async tar(options?: TarOptions): Promise<T> {
    const tarOptions: TarOptions = {
      ...options,
      gzip: true,
      gzipOptions: { level: 9, ...(options?.gzipOptions ?? {}) }
    };

    return this.archive('tar', tarOptions);
  }

  /**
   * Creates a zip archive with maximum compression by default.
   * @param options Optional zip-specific options.
   * @returns Archive as the output type defined by subclass.
   */
  async zip(options?: ZipOptions): Promise<T> {
    const zipOptions: ZipOptions = {
      ...options,
      zlib: { level: 9, ...(options?.zlib ?? {}) }
    };

    return this.archive('zip', zipOptions);
  }
}

/**
 * Concrete implementation of FileArchiver that returns a complete archive as a Buffer.
 */
export class FileBufferArchiver extends FileArchiver<Buffer> {
  async archive(format: FileArchiveFormat, options?: FileArchiveOptions): Promise<Buffer> {
    const archive = createArchiver(format, options);
    let chunks: readonly Uint8Array<ArrayBufferLike>[] = [];
    const stream = new PassThrough(); // Memory-based passthrough stream

    // Collect archive data into memory
    stream.on('data', chunk => {
      chunks = [...chunks, chunk];
    });

    archive.on('error', err => {
      throw new Error(`Archiver error: ${err.message}`);
    });

    // Pipe archiver output into memory stream
    archive.pipe(stream);

    // Append all sources to the archive
    this.sources.forEach(({ content, name }) => {
      archive.append(content, { name });
    });

    // Finalize the archive and wait for stream closure
    await Promise.all([
      archive.finalize(),
      new Promise<void>((resolve, reject) => {
        stream.on('close', resolve);
        stream.on('error', reject);
        archive.on('error', reject);
      })
    ]);

    // Combine collected chunks into a single Buffer
    return Buffer.concat(chunks);
  }
}

/**
 * Concrete implementation of FileArchiver that returns a Readable stream of the archive.
 * Useful for streaming large archives directly to a destination.
 */
export class FileStreamArchiver extends FileArchiver<Readable> {
  async archive(format: FileArchiveFormat, options?: FileArchiveOptions): Promise<Readable> {
    const archive = createArchiver(format, options);

    archive.on('error', err => {
      throw new Error(`Archiver error: ${err.message}`);
    });

    // Append all sources to the archive
    this.sources.forEach(({ content, name }) => {
      archive.append(content, { name });
    });

    // Delay finalization to allow caller to attach listeners before data starts flowing
    process.nextTick(() => archive.finalize());

    return archive;
  }
}
