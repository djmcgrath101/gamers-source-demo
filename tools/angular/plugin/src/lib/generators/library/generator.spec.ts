import { libraryGenerator } from '@nx/angular/generators';
import { logger, readProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import setupTailwindGenerator from '../setup-tailwind/generator';
import { ngLibGenerator } from './generator';

vi.mock('@nx/angular/generators', () => ({
  libraryGenerator: vi.fn(async (tree, options) => {
    const { addProjectConfiguration } =
      await vi.importActual<typeof import('@nx/devkit')>('@nx/devkit');

    // Keep the upstream mock minimal so these tests only cover local branching.
    addProjectConfiguration(tree, options.name, {
      root: options.directory,
      sourceRoot: `${options.directory}/src`,
      projectType: 'library',
      targets: {},
      tags: []
    });

    tree.write(
      `${options.directory}/jest.config.ts`,
      `export default {
  displayName: '${options.name}',
  transformIgnorePatterns: ['node_modules/(?!.*\\\\.mjs$)'],
  snapshotSerializers: []
};
`
    );
    tree.write(
      `${options.directory}/tsconfig.lib.json`,
      JSON.stringify(
        {
          compilerOptions: {
            types: []
          }
        },
        null,
        2
      )
    );
  })
}));

vi.mock('../setup-tailwind/generator', () => ({
  __esModule: true,
  default: vi.fn(async () => {})
}));

describe('ngLibGenerator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    vi.clearAllMocks();
  });

  it('normalizes feature libraries', async () => {
    await ngLibGenerator(tree, {
      name: 'orders',
      style: 'scss',
      type: 'feature',
      skipFormat: true
    });

    expect(libraryGenerator).toHaveBeenCalledWith(
      tree,
      expect.objectContaining({
        directory: 'libs/orders/feature',
        name: 'orders-feature',
        routing: true,
        skipModule: true,
        standalone: false,
        unitTestRunner: 'vitest-analog'
      })
    );
    expect(readProjectConfiguration(tree, 'orders-feature').root).toBe('libs/orders/feature');
    expect(tree.read('libs/orders/feature/README.md', 'utf-8')).toBe('# orders-feature');
  });

  it('sorts tsconfig base paths after library generation', async () => {
    tree.write(
      'tsconfig.base.json',
      JSON.stringify(
        {
          compilerOptions: {
            paths: {
              '@gamers-source/zeta': ['./libs/zeta/src/index.ts'],
              '@gamers-source/alpha': ['./libs/alpha/src/index.ts']
            }
          }
        },
        null,
        2
      )
    );

    await ngLibGenerator(tree, {
      name: 'orders',
      style: 'scss',
      type: 'feature',
      skipFormat: true
    });

    const tsConfigBase = JSON.parse(tree.read('tsconfig.base.json', 'utf-8')!);
    const aliases = Object.keys(tsConfigBase.compilerOptions.paths);

    expect(aliases).toEqual([...aliases].sort((left, right) => left.localeCompare(right)));
  });

  it('uses vitest-angular by default for buildable libraries', async () => {
    await ngLibGenerator(tree, {
      buildable: true,
      name: 'orders',
      type: 'core',
      skipFormat: true
    });

    expect(libraryGenerator).toHaveBeenCalledWith(
      tree,
      expect.objectContaining({
        buildable: true,
        name: 'orders-core',
        unitTestRunner: 'vitest-angular'
      })
    );
  });

  it('uses vitest-angular by default for publishable libraries', async () => {
    await ngLibGenerator(tree, {
      importPath: '@gamers-source/orders-core',
      name: 'orders',
      publishable: true,
      type: 'core',
      skipFormat: true
    });

    expect(libraryGenerator).toHaveBeenCalledWith(
      tree,
      expect.objectContaining({
        name: 'orders-core',
        publishable: true,
        unitTestRunner: 'vitest-angular'
      })
    );
  });

  it('preserves an explicitly configured unit test runner', async () => {
    await ngLibGenerator(tree, {
      buildable: true,
      name: 'orders',
      type: 'core',
      skipFormat: true,
      unitTestRunner: 'jest'
    });

    expect(libraryGenerator).toHaveBeenCalledWith(
      tree,
      expect.objectContaining({
        buildable: true,
        name: 'orders-core',
        unitTestRunner: 'jest'
      })
    );
  });

  it('configures generated Jest configs to transform lodash-es', async () => {
    await ngLibGenerator(tree, {
      name: 'orders',
      style: 'scss',
      type: 'feature',
      unitTestRunner: 'jest',
      skipFormat: true
    });

    const jestConfig = tree.read('libs/orders/feature/jest.config.ts', 'utf-8');

    expect(jestConfig).toContain("'node_modules/.pnpm/(?!(lodash-es)@|.*\\\\.mjs$)'");
    expect(jestConfig).toContain("'node_modules/(?!\\\\.pnpm|lodash-es/|.*\\\\.mjs$)'");
    expect(jestConfig).not.toContain("['node_modules/(?!.*\\\\.mjs$)']");
  });

  it('uses the raw name for generated utils files', async () => {
    await ngLibGenerator(tree, {
      name: 'parse-date',
      type: 'utils',
      skipFormat: true
    });

    expect(tree.exists('libs/parse-date/utils/src/lib/parse-date.utils.ts')).toBe(true);
    expect(tree.exists('libs/parse-date/utils/src/lib/parse-date-utils.utils.ts')).toBe(false);
  });

  it('adds default vitest types to tsconfig for testing libraries without generating test targets', async () => {
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

    await ngLibGenerator(tree, {
      name: 'auth',
      type: 'testing',
      skipFormat: true
    });

    const tsConfigLib = JSON.parse(tree.read('libs/auth/testing/tsconfig.lib.json', 'utf-8')!);

    expect(libraryGenerator).toHaveBeenCalledWith(
      tree,
      expect.objectContaining({
        name: 'auth-testing',
        routing: false,
        skipModule: true,
        standalone: false,
        unitTestRunner: 'none'
      })
    );
    expect(tsConfigLib.compilerOptions.types).toEqual(
      expect.arrayContaining(['vitest/globals', 'vitest/importMeta', 'vite/client', 'vitest'])
    );
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('adds explicitly requested jest types to tsconfig for testing libraries', async () => {
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

    await ngLibGenerator(tree, {
      name: 'auth',
      type: 'testing',
      unitTestRunner: 'jest',
      skipFormat: true
    });

    const tsConfigLib = JSON.parse(tree.read('libs/auth/testing/tsconfig.lib.json', 'utf-8')!);

    expect(libraryGenerator).toHaveBeenCalledWith(
      tree,
      expect.objectContaining({
        name: 'auth-testing',
        unitTestRunner: 'none'
      })
    );
    expect(tsConfigLib.compilerOptions.types).toEqual(['jest']);
    warnSpy.mockRestore();
  });

  it('skips readme generation for minimal libraries', async () => {
    await ngLibGenerator(tree, {
      minimal: true,
      name: 'shared',
      type: 'core',
      skipFormat: true
    });

    expect(tree.exists('libs/shared/core/README.md')).toBe(false);
  });

  it('overrides unsupported data-access options and warns when they are ignored', async () => {
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

    await ngLibGenerator(tree, {
      addTailwind: true,
      name: 'catalog',
      routing: true,
      skipFormat: true,
      skipModule: false,
      standalone: true,
      type: 'data-access'
    });

    expect(libraryGenerator).toHaveBeenCalledWith(
      tree,
      expect.objectContaining({
        addTailwind: false,
        name: 'catalog-data-access',
        routing: false,
        skipModule: true,
        standalone: false
      })
    );
    expect(setupTailwindGenerator).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      'Tailwind is not allowed from data access libraries.  Please define your styles in a UI library.'
    );
    expect(warnSpy).toHaveBeenCalledWith(
      'Routing is not allowed from data access libraries.  Please define your routing in a feature library.'
    );
    expect(warnSpy).toHaveBeenCalledWith(
      'Data access libraries should not export any components or modules, so standalone and skipModule options are ignored.'
    );
    warnSpy.mockRestore();
  });
});
