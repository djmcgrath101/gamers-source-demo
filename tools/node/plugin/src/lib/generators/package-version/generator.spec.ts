import { formatFiles, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import packageVersionGenerator from './generator';

vi.mock('@nx/devkit', async importOriginal => {
  const actual = await importOriginal<typeof import('@nx/devkit')>();

  return {
    ...actual,
    formatFiles: vi.fn().mockResolvedValue(undefined)
  };
});

describe('packageVersionGenerator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    vi.clearAllMocks();
  });

  it('sets an explicit semantic version', async () => {
    tree.write(
      'libs/test/package.json',
      JSON.stringify(
        {
          name: '@proj/test',
          version: '1.2.3',
          private: true
        },
        null,
        2
      )
    );

    await packageVersionGenerator(tree, {
      path: 'libs/test/package.json',
      vers: '2.0.0',
      skipFormat: true
    });

    expect(JSON.parse(tree.read('libs/test/package.json', 'utf-8') ?? '{}')).toEqual({
      name: '@proj/test',
      version: '2.0.0',
      private: true
    });
    expect(formatFiles).not.toHaveBeenCalled();
  });

  it('bumps the version for a release type', async () => {
    tree.write(
      'libs/test/package.json',
      JSON.stringify(
        {
          name: '@proj/test',
          version: '1.2.3'
        },
        null,
        2
      )
    );

    await packageVersionGenerator(tree, {
      path: 'libs/test/package.json',
      vers: 'minor',
      skipFormat: true
    });

    expect(JSON.parse(tree.read('libs/test/package.json', 'utf-8') ?? '{}').version).toBe('1.3.0');
  });

  it('preserves the version field position in package.json', async () => {
    tree.write(
      'libs/test/package.json',
      JSON.stringify(
        {
          name: '@proj/test',
          version: '1.2.3',
          private: true
        },
        null,
        2
      )
    );

    await packageVersionGenerator(tree, {
      path: 'libs/test/package.json',
      vers: 'patch',
      skipFormat: true
    });

    expect(tree.read('libs/test/package.json', 'utf-8')).toContain(
      ['{', '  "name": "@proj/test",', '  "version": "1.2.4",', '  "private": true', '}'].join('\n')
    );
  });

  it('formats files by default', async () => {
    tree.write(
      'libs/test/package.json',
      JSON.stringify(
        {
          name: '@proj/test',
          version: '1.2.3'
        },
        null,
        2
      )
    );

    await packageVersionGenerator(tree, {
      path: 'libs/test/package.json',
      vers: 'patch'
    });

    expect(formatFiles).toHaveBeenCalledWith(tree);
  });

  it('throws when the package.json file does not exist', async () => {
    await expect(
      packageVersionGenerator(tree, {
        path: 'libs/missing/package.json',
        vers: 'patch',
        skipFormat: true
      })
    ).rejects.toThrow('Package.json not found at path: libs/missing/package.json');
  });

  it('throws when the current package.json version is invalid', async () => {
    tree.write(
      'libs/test/package.json',
      JSON.stringify(
        {
          name: '@proj/test',
          version: 'invalid'
        },
        null,
        2
      )
    );

    await expect(
      packageVersionGenerator(tree, {
        path: 'libs/test/package.json',
        vers: 'patch',
        skipFormat: true
      })
    ).rejects.toThrow('Invalid version in package.json: undefined');
  });
});
