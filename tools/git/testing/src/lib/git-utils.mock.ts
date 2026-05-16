import type { Mock } from 'vitest';
import { vi } from 'vitest';

/**
 * Vitest mock constructor for the `GitUtils` class export.
 */
export type MockGitUtilsConstructor = Mock<new (...args: unknown[]) => MockGitUtilsInstance>;

/**
 * Vitest mock function typed to one `GitUtils` method signature.
 */
export type MockGitUtilsMethod<T extends (...args: never[]) => unknown> = Mock<T>;

export interface MockGitUtilsInstance {
  branchExists: MockGitUtilsMethod<(branchName: string) => Promise<boolean>>;
  getCurrentBranch: MockGitUtilsMethod<() => Promise<string>>;
  getLastCommitHash: MockGitUtilsMethod<(opts?: { length: number }) => Promise<string>>;
  getLocalUserEmail: MockGitUtilsMethod<() => Promise<string>>;
  getLocalUserName: MockGitUtilsMethod<() => Promise<string>>;
  isCleanBranch: MockGitUtilsMethod<() => Promise<boolean>>;
  isCurrentBranch: MockGitUtilsMethod<(branchName: string) => Promise<boolean>>;
}

export interface MockGitUtilsModule {
  mocks: MockGitUtilsInstance;
  module: {
    __mockGitUtils: MockGitUtilsInstance;
    GitUtils: MockGitUtilsConstructor;
  };
}

/**
 * Creates an isolated module mock for `@cybertec/git-utils`.
 */
export function createMockGitUtilsModule(): MockGitUtilsModule {
  const mocks: MockGitUtilsInstance = {
    branchExists: vi.fn<(branchName: string) => Promise<boolean>>(),
    getCurrentBranch: vi.fn<() => Promise<string>>(),
    getLastCommitHash: vi.fn<(opts?: { length: number }) => Promise<string>>(),
    getLocalUserEmail: vi.fn<() => Promise<string>>(),
    getLocalUserName: vi.fn<() => Promise<string>>(),
    isCleanBranch: vi.fn<() => Promise<boolean>>(),
    isCurrentBranch: vi.fn<(branchName: string) => Promise<boolean>>()
  };

  return {
    mocks,
    module: {
      __mockGitUtils: mocks,
      GitUtils: vi
        .fn<new (...args: unknown[]) => MockGitUtilsInstance>()
        .mockImplementation(() => mocks)
    }
  };
}
