vi.mock('@gamers-source/shared-node-utils', () => ({
  FileBufferArchiver: vi.fn()
}));

import { FileBufferArchiver } from '@gamers-source/shared-node-utils';
import { logger, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Mock } from 'vitest';
import fileArchiveGenerator from './generator';

describe('fileArchiveGenerator', () => {
  let tree: Tree;
  let archiveBuffer: Buffer;
  let archiveSpy: Mock<(format: 'tar' | 'zip') => Promise<Buffer>>;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    archiveBuffer = Buffer.from('archive-buffer');
    archiveSpy = vi.fn().mockResolvedValue(archiveBuffer);

    vi.clearAllMocks();

    vi.mocked(FileBufferArchiver).mockImplementation(function () {
      return {
        archive: archiveSpy
      } as unknown as FileBufferArchiver;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when the source directory has no files', () => {
    it('warns and skips archive creation', async () => {
      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

      await fileArchiveGenerator(tree, {
        source: 'tmp/archive-source'
      });

      expect(warnSpy).toHaveBeenCalledWith(
        'No files found in the source directory: tmp/archive-source.  Aborting archive creation.'
      );
      expect(FileBufferArchiver).not.toHaveBeenCalled();
      expect(tree.exists('tmp/archive-source/archive-source.zip')).toBe(false);
    });
  });

  describe('when the source directory contains files', () => {
    it('archives every file in the source directory using the default output options', async () => {
      const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => {});

      tree.write('tmp/archive-source/first.txt', 'first file');
      tree.write('tmp/archive-source/nested/second.txt', 'second file');

      await fileArchiveGenerator(tree, {
        source: 'tmp/archive-source'
      });

      expect(FileBufferArchiver).toHaveBeenCalledTimes(1);
      expect(vi.mocked(FileBufferArchiver).mock.calls[0]).toEqual([
        {
          content: Buffer.from('first file'),
          name: '/first.txt'
        },
        {
          content: Buffer.from('second file'),
          name: '/nested/second.txt'
        }
      ]);
      expect(archiveSpy).toHaveBeenCalledWith('zip');
      expect(tree.read('tmp/archive-source/archive-source.zip')).toEqual(archiveBuffer);
      expect(infoSpy).toHaveBeenNthCalledWith(
        1,
        'Creating archive file from source path: tmp/archive-source ...'
      );
      expect(infoSpy).toHaveBeenNthCalledWith(2, 'Found 2 files to include in the archive.');
      expect(infoSpy).toHaveBeenNthCalledWith(
        3,
        `Archive created: tmp/archive-source/archive-source.zip (${archiveBuffer.length} bytes)`
      );
    });

    it('uses the explicit destination, filename, and archive format when provided', async () => {
      vi.spyOn(logger, 'info').mockImplementation(() => {});

      tree.write('tmp/archive-source/report.json', '{"ok":true}');

      await fileArchiveGenerator(tree, {
        destination: 'dist/archives',
        filename: 'report.tar',
        format: 'tar',
        source: 'tmp/archive-source'
      });

      expect(FileBufferArchiver).toHaveBeenCalledWith({
        content: Buffer.from('{"ok":true}'),
        name: '/report.json'
      });
      expect(archiveSpy).toHaveBeenCalledWith('tar');
      expect(tree.read('dist/archives/report.tar')).toEqual(archiveBuffer);
    });

    it('warns and skips archive creation when the archive already exists by default', async () => {
      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
      const existingArchiveBuffer = Buffer.from('existing-archive-buffer');

      tree.write('tmp/archive-source/report.json', '{"ok":true}');
      tree.write('dist/archives/report.zip', existingArchiveBuffer);

      await fileArchiveGenerator(tree, {
        destination: 'dist/archives',
        filename: 'report.zip',
        source: 'tmp/archive-source'
      });

      expect(warnSpy).toHaveBeenCalledWith(
        'Archive file already exists: dist/archives/report.zip.  Set override option to true to overwrite the existing file.  Aborting archive creation.'
      );
      expect(FileBufferArchiver).not.toHaveBeenCalled();
      expect(tree.read('dist/archives/report.zip')).toEqual(existingArchiveBuffer);
    });

    it('overwrites the existing archive when overwrite is true', async () => {
      vi.spyOn(logger, 'info').mockImplementation(() => {});

      tree.write('tmp/archive-source/report.json', '{"ok":true}');
      tree.write('dist/archives/report.zip', 'existing-archive-buffer');

      await fileArchiveGenerator(tree, {
        destination: 'dist/archives',
        filename: 'report.zip',
        overwrite: true,
        source: 'tmp/archive-source'
      });

      expect(FileBufferArchiver).toHaveBeenCalledWith({
        content: Buffer.from('{"ok":true}'),
        name: '/report.json'
      });
      expect(archiveSpy).toHaveBeenCalledWith('zip');
      expect(tree.read('dist/archives/report.zip')).toEqual(archiveBuffer);
    });
  });
});
