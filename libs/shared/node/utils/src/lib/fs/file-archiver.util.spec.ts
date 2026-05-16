import { Readable } from 'node:stream';
import { list } from 'tar';
import { Open } from 'unzipper';
import { FileArchiveSource, FileBufferArchiver, FileStreamArchiver } from './file-archiver.util';

describe('file-archiver.util', () => {
  describe('FileBufferArchiver', () => {
    const sources: FileArchiveSource[] = [
      { name: 'file1.txt', content: 'Hello world!' },
      { name: 'file2.txt', content: Buffer.from('Buffer content') }
    ];

    let archiver: FileBufferArchiver;

    beforeEach(() => {
      archiver = new FileBufferArchiver(...sources);
    });

    it('creates a zip archive as a Buffer', async () => {
      const zipBuffer = await archiver.zip();
      expect(zipBuffer.length).toBeGreaterThan(0);

      const files: string[] = [];
      const directory = await Open.buffer(zipBuffer);
      for (const entry of directory.files) {
        files.push(entry.path);
      }

      expect(files).toContain('file1.txt');
      expect(files).toContain('file2.txt');
    });

    it('creates a tar archive as a Buffer', async () => {
      const tarBuffer = await archiver.tar();
      expect(tarBuffer.length).toBeGreaterThan(0);

      const entries: string[] = [];

      await new Promise<void>((resolve, reject) => {
        const extract = list({
          onReadEntry: entry => {
            entries.push(entry.path);
          }
        }) as NodeJS.WritableStream;

        extract.on('end', resolve);
        extract.on('error', reject);

        // Pipe the buffer into the tar extractor
        Readable.from(tarBuffer).pipe(extract);
      });

      expect(entries).toContain('file1.txt');
      expect(entries).toContain('file2.txt');
    });
  });

  describe('FileStreamArchiver', () => {
    const sources: FileArchiveSource[] = [
      { name: 'stream1.txt', content: 'Stream content 1' },
      { name: 'stream2.txt', content: 'Stream content 2' }
    ];

    let archiver: FileStreamArchiver;

    beforeEach(() => {
      archiver = new FileStreamArchiver(...sources);
    });

    it('returns a Readable stream for zip', async () => {
      const zipStream = await archiver.zip();

      let chunks: readonly Uint8Array<ArrayBufferLike>[] = [];
      for await (const chunk of zipStream) {
        chunks = [...chunks, chunk];
      }
      const zipBuffer = Buffer.concat(chunks);

      const directory = await Open.buffer(zipBuffer);
      const fileNames = directory.files.map(f => f.path);

      expect(fileNames).toContain('stream1.txt');
      expect(fileNames).toContain('stream2.txt');
    });

    it('returns a Readable stream for tar', async () => {
      const tarStreamOut = await archiver.tar();

      let chunks: readonly Uint8Array<ArrayBufferLike>[] = [];
      for await (const chunk of tarStreamOut) {
        chunks = [...chunks, chunk];
      }
      const tarBuffer = Buffer.concat(chunks);

      const entries: string[] = [];

      await new Promise<void>((resolve, reject) => {
        const extract = list({
          onentry: entry => {
            entries.push(entry.path);
          }
        }) as NodeJS.WritableStream;

        extract.on('end', resolve);
        extract.on('error', reject);

        // Pipe the buffer into the tar extractor
        Readable.from(tarBuffer).pipe(extract);
      });

      expect(entries).toContain('stream1.txt');
      expect(entries).toContain('stream2.txt');
    });
  });
});
