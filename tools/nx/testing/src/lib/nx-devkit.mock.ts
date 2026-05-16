import { Mock } from 'vitest';

export interface MockNxDevkitLogger {
  debug: Mock;
  error: Mock;
  fatal: Mock;
  info: Mock;
  log: Mock;
  warn: Mock;
  verbose: Mock;
}

export interface MockNxDevkit {
  createProjectGraphAsync: Mock;
  formatFiles: Mock;
  logger: MockNxDevkitLogger;
}

export interface MockNxDevkitModule {
  mocks: MockNxDevkit;
  module: typeof import('@nx/devkit') & {
    __mockNxDevkit: MockNxDevkit;
    formatFiles: MockNxDevkit['formatFiles'];
    logger: MockNxDevkitLogger;
  };
}

/**
 * Creates an isolated module mock for `@nx/devkit`.
 */
export async function createMockNxDevkitModule(): Promise<MockNxDevkitModule> {
  const actual = await vitest.importActual<typeof import('@nx/devkit')>('@nx/devkit');
  const mocks: MockNxDevkit = {
    createProjectGraphAsync: vitest.fn(),
    formatFiles: vitest.fn().mockResolvedValue(undefined),
    logger: {
      debug: vitest.fn(),
      error: vitest.fn(),
      fatal: vitest.fn(),
      info: vitest.fn(),
      log: vitest.fn(),
      warn: vitest.fn(),
      verbose: vitest.fn()
    }
  };

  return {
    mocks,
    module: {
      ...actual,
      __mockNxDevkit: mocks,
      createProjectGraphAsync: mocks.createProjectGraphAsync,
      formatFiles: mocks.formatFiles,
      logger: mocks.logger
    }
  };
}
