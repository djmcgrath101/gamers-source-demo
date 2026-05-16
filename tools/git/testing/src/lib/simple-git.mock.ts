import type { Mock } from 'vitest';
import { vi } from 'vitest';

/**
 * Vitest mock factory for the `simple-git` default export.
 */
export type MockSimpleGitFactory = Mock<() => MockSimpleGitInstance>;

/**
 * Vitest mock function typed to one `SimpleGit` method signature.
 */
export type MockSimpleGitMethod<T extends (...args: never[]) => unknown> = Mock<T>;

export interface MockSimpleGitInstance {
  add: MockSimpleGitMethod<(files: string[]) => Promise<void>>;
  checkout: MockSimpleGitMethod<(branchName: string) => Promise<void>>;
  checkoutLocalBranch: MockSimpleGitMethod<(branchName: string) => Promise<void>>;
  commit: MockSimpleGitMethod<(message: string) => Promise<void>>;
  pull: MockSimpleGitMethod<(remote: string, branchName: string) => Promise<void>>;
  push: MockSimpleGitMethod<
    (remote: string, branchName: string, options: string[]) => Promise<void>
  >;
}

export interface MockSimpleGitModule {
  mocks: MockSimpleGitInstance;
  module: {
    __esModule: true;
    __mockGit: MockSimpleGitInstance;
    default: MockSimpleGitFactory;
  };
}

/**
 * Creates an isolated module mock for `simple-git`.
 */
export function createMockSimpleGitModule(): MockSimpleGitModule {
  const mocks: MockSimpleGitInstance = {
    add: vi.fn<(files: string[]) => Promise<void>>(),
    checkout: vi.fn<(branchName: string) => Promise<void>>(),
    checkoutLocalBranch: vi.fn<(branchName: string) => Promise<void>>(),
    commit: vi.fn<(message: string) => Promise<void>>(),
    pull: vi.fn<(remote: string, branchName: string) => Promise<void>>(),
    push: vi.fn<(remote: string, branchName: string, options: string[]) => Promise<void>>()
  };

  return {
    mocks,
    module: {
      __esModule: true,
      __mockGit: mocks,
      default: vi.fn<() => MockSimpleGitInstance>().mockImplementation(() => mocks)
    }
  };
}
