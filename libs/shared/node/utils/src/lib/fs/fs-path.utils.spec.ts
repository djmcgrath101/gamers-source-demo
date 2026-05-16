import { getRelativePathBetweenFiles } from './fs-path.utils';

describe('fs-path.utils', () => {
  describe('getRelativePathBetweenFiles', () => {
    it('returns a relative import path for files in the same directory', () => {
      const result = getRelativePathBetweenFiles('src/utils/fileA.ts', 'src/utils/fileB.ts');
      expect(result).toBe('./fileB');
    });

    it('returns a relative import path for a file in a parent directory', () => {
      const result = getRelativePathBetweenFiles(
        'src/utils/helpers/fileA.ts',
        'src/utils/fileB.ts'
      );
      expect(result).toBe('../fileB');
    });

    it('returns a relative import path for a file in a subdirectory', () => {
      const result = getRelativePathBetweenFiles(
        'src/utils/fileA.ts',
        'src/utils/helpers/fileB.ts'
      );
      expect(result).toBe('./helpers/fileB');
    });

    it('returns a relative import path for deeply nested files', () => {
      const result = getRelativePathBetweenFiles(
        'src/components/ui/buttons/fileA.ts',
        'src/utils/helpers/fileB.ts'
      );
      expect(result).toBe('../../../utils/helpers/fileB');
    });
  });
});
