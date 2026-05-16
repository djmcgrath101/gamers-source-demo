import { BranchSummary, SimpleGit, StatusResult, TagResult } from 'simple-git';
import { Mocked } from 'vitest';
import { GitUtils } from './git.utils';

describe('GitUtils', () => {
  let gitMock: Mocked<SimpleGit>;
  let gitUtils: GitUtils;

  beforeEach(() => {
    gitMock = {
      branchLocal: vi.fn(),
      status: vi.fn(),
      tags: vi.fn()
    } as unknown as Mocked<SimpleGit>;

    gitUtils = new GitUtils(gitMock);
  });

  it('creates an instance', () => {
    expect(gitUtils).toBeTruthy();
  });

  describe('branchExists', () => {
    it('returns true when the branch exists', async () => {
      const branchName = 'feature-branch';

      gitMock.branchLocal.mockResolvedValue({
        all: ['main', 'develop', 'feature-branch']
      } as BranchSummary);

      const result = await gitUtils.branchExists(branchName);

      expect(result).toBe(true);
      expect(gitMock.branchLocal).toHaveBeenCalledTimes(1);
    });

    it('returns false when the branch does not exist', async () => {
      const branchName = 'non-existent-branch';

      gitMock.branchLocal.mockResolvedValue({
        all: ['main', 'develop']
      } as BranchSummary);

      const result = await gitUtils.branchExists(branchName);

      expect(result).toBe(false);
      expect(gitMock.branchLocal).toHaveBeenCalledTimes(1);
    });
  });

  describe('getLatestProjectVersion', () => {
    it('returns the newest matching version', async () => {
      gitMock.tags.mockResolvedValue({
        all: ['my-app@1.2.0', 'other-app@9.9.9', 'my-app@1.10.0', 'my-app@1.3.0']
      } as TagResult);

      const result = await gitUtils.getLatestProjectVersion('my-app');

      expect(result).toBe('1.10.0');
      expect(gitMock.tags).toHaveBeenCalledTimes(1);
    });

    it('returns undefined when no matching versions exist', async () => {
      gitMock.tags.mockResolvedValue({
        all: ['other-app@1.0.0']
      } as TagResult);

      const result = await gitUtils.getLatestProjectVersion('my-app');

      expect(result).toBeUndefined();
      expect(gitMock.tags).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCurrentBranch', () => {
    it('returns the current local branch name', async () => {
      gitMock.branchLocal.mockResolvedValue({
        current: 'feature/release-work'
      } as BranchSummary);

      const result = await gitUtils.getCurrentBranch();

      expect(result).toBe('feature/release-work');
      expect(gitMock.branchLocal).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProjectVersions', () => {
    it('returns matching versions sorted descending by default', async () => {
      gitMock.tags.mockResolvedValue({
        all: ['my-app@1.2.0', 'other-app@9.9.9', 'my-app@1.10.0', 'my-app@1.3.0']
      } as TagResult);

      const result = await gitUtils.getProjectVersions('my-app');

      expect(result).toEqual(['1.10.0', '1.3.0', '1.2.0']);
      expect(gitMock.tags).toHaveBeenCalledTimes(1);
    });

    it('returns matching versions sorted ascending when requested', async () => {
      gitMock.tags.mockResolvedValue({
        all: ['my-app@1.2.0', 'other-app@9.9.9', 'my-app@1.10.0', 'my-app@1.3.0']
      } as TagResult);

      const result = await gitUtils.getProjectVersions('my-app', 'asc');

      expect(result).toEqual(['1.2.0', '1.3.0', '1.10.0']);
      expect(gitMock.tags).toHaveBeenCalledTimes(1);
    });
  });

  describe('isCleanBranch', () => {
    it('returns true when the branch is clean', async () => {
      gitMock.status.mockResolvedValue({
        isClean: () => true
      } as StatusResult);

      const result = await gitUtils.isCleanBranch();

      expect(result).toBe(true);
      expect(gitMock.status).toHaveBeenCalledWith(['--porcelain']);
    });

    it('returns false when the branch has uncommitted changes', async () => {
      gitMock.status.mockResolvedValue({
        isClean: () => false
      } as StatusResult);

      const result = await gitUtils.isCleanBranch();

      expect(result).toBe(false);
      expect(gitMock.status).toHaveBeenCalledWith(['--porcelain']);
    });

    it('throws an error if simple-git fails', async () => {
      gitMock.status.mockRejectedValue(new Error('Git error'));

      await expect(gitUtils.isCleanBranch()).rejects.toThrow('Git error');

      expect(gitMock.status).toHaveBeenCalledWith(['--porcelain']);
    });
  });
});
