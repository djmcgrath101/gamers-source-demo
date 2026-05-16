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
        standalone: false
      })
    );
    expect(readProjectConfiguration(tree, 'orders-feature').root).toBe('libs/orders/feature');
    expect(tree.read('libs/orders/feature/README.md', 'utf-8')).toBe('# orders-feature');
  });

  it('configures generated Jest configs to transform lodash-es', async () => {
    await ngLibGenerator(tree, {
      name: 'orders',
      style: 'scss',
      type: 'feature',
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
