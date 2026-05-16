vi.mock('@gamers-source/ts-plugin', () => ({
  tsLibraryGenerator: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('@nx/devkit', async importOriginal => {
  const actual = await importOriginal<typeof import('@nx/devkit')>();

  return {
    ...actual,
    formatFiles: vi.fn().mockResolvedValue(undefined)
  };
});

import { tsLibraryGenerator } from '@gamers-source/ts-plugin';
import { formatFiles, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { nodeLibGenerator } from './generator';
import { NodeLibraryGeneratorOptions } from './schema';

describe('nodeLibGenerator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    vi.clearAllMocks();
  });

  it('delegates to the ts library generator with the backend scope and internal formatting disabled', async () => {
    const options: NodeLibraryGeneratorOptions = {
      directory: 'shared',
      name: 'test',
      skipFormat: false,
      type: 'utils'
    };

    await nodeLibGenerator(tree, options);

    expect(tsLibraryGenerator).toHaveBeenCalledWith(tree, {
      ...options,
      scope: 'backend',
      skipFormat: true
    });
  });

  it('formats files when skipFormat is not requested', async () => {
    await nodeLibGenerator(tree, {
      name: 'test',
      type: 'utils'
    });

    expect(vi.mocked(formatFiles)).toHaveBeenCalledWith(tree);
  });

  it('skips formatting when skipFormat is true', async () => {
    await nodeLibGenerator(tree, {
      name: 'test',
      skipFormat: true,
      type: 'utils'
    });

    expect(vi.mocked(formatFiles)).not.toHaveBeenCalled();
  });
});
