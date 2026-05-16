import { configureAngularJestTransformIgnorePatterns } from '@gamers-source/angular-tools-utils';
import { normalizeProjectOptions } from '@gamers-source/nx-utils';
import { addTestTypesToTsConfig, type TestTypesRunner } from '@gamers-source/ts-utils';
import { libraryGenerator, UnitTestRunner } from '@nx/angular/generators';
import {
  formatFiles,
  generateFiles,
  joinPathFragments,
  logger,
  names,
  readProjectConfiguration,
  Tree
} from '@nx/devkit';
import { existsSync, readdirSync } from 'node:fs';
import setupTailwindGenerator from '../setup-tailwind/generator';
import { NgLibGeneratorOptions, NormalizedNgLibGeneratorOptions } from './schema';

export async function ngLibGenerator(tree: Tree, rawOptions: NgLibGeneratorOptions) {
  const testTypesRunner = getTestTypesRunner(rawOptions);
  const options = normalizeOptions(rawOptions);

  await libraryGenerator(tree, options);

  const projectConfig = readProjectConfiguration(tree, options.name);

  if (options.unitTestRunner === 'jest') {
    configureAngularJestTransformIgnorePatterns(tree, projectConfig.root);
  }

  if (options.type === 'feature' || options.type === 'ui') {
    if (options.addTailwind) {
      await setupTailwindGenerator(tree, {
        project: options.name,
        skipFormat: true
      });
    }
  }

  if (options.type === 'testing') {
    // We want to make globally available the types for the test runner being used.
    // These would normally be added to the `tsconfig.spec.json` file, but since testing
    // libraries aren't testable by default, they don't have that file. Adding the types
    // to `tsconfig.lib.json` ensures that they are available regardless of whether the
    // library is testable or not.
    addTestTypesToTsConfig(tree, projectConfig, testTypesRunner);
  }

  const filesPath = joinPathFragments(__dirname, 'files', options.type);
  if (hasTemplateFiles(filesPath)) {
    generateFiles(tree, filesPath, projectConfig.root, {
      ...options,
      ...names(options.name),
      // we use the raw name which doesn't include the 'utils' suffix
      // for the fileName.
      fileName: rawOptions.name,
      tmpl: ''
    });
  } else {
    logger.warn(`No additional files were generated for libraries of type "${options.type}".`);
  }

  if (!options.minimal) {
    tree.write(joinPathFragments(projectConfig.root, 'README.md'), `# ${options.name}`);
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

/**
 * Resolves the test runner ambient types needed by testing libraries.
 */
function getTestTypesRunner(rawOptions: NgLibGeneratorOptions): TestTypesRunner {
  return (rawOptions.unitTestRunner ||
    (rawOptions.buildable || rawOptions.publishable
      ? 'vitest-angular'
      : 'vitest-analog')) as TestTypesRunner;
}

/**
 * Returns whether a generator template directory exists and contains files.
 */
function hasTemplateFiles(filesPath: string): boolean {
  if (!existsSync(filesPath)) {
    return false;
  }

  return readdirSync(filesPath, { recursive: true, withFileTypes: true }).some(entry =>
    entry.isFile()
  );
}

function normalizeOptions(rawOptions: NgLibGeneratorOptions): NormalizedNgLibGeneratorOptions {
  const unitTestRunner = getTestTypesRunner(rawOptions) as UnitTestRunner;

  let options: NormalizedNgLibGeneratorOptions = {
    ...normalizeProjectOptions({ ...rawOptions, scope: 'frontend' }),
    minimal: rawOptions.minimal ?? false,
    unitTestRunner
  };

  if (options.type === 'core') {
    options = normalizeCoreOptions(options);
  } else if (options.type === 'feature') {
    options = normalizeFeatureOptions(options);
  } else if (options.type === 'ui') {
    options = normalizeUIOptions(options);
  } else if (options.type === 'data-access') {
    options = normalizeDataAccessOptions(options);
  } else if (options.type === 'utils') {
    options = normalizeUtilsOptions(options);
  } else if (options.type === 'testing') {
    options = normalizeTestingOptions(options);
  }

  return options;
}

function normalizeCoreOptions(
  options: NormalizedNgLibGeneratorOptions
): NormalizedNgLibGeneratorOptions {
  return {
    ...options,
    routing: options.routing ?? false,
    skipModule: options.skipModule ?? true,
    standalone: options.standalone ?? false
  };
}

function normalizeDataAccessOptions(
  options: NormalizedNgLibGeneratorOptions
): NormalizedNgLibGeneratorOptions {
  if (options.addTailwind) {
    logger.warn(
      'Tailwind is not allowed from data access libraries.  Please define your styles in a UI library.'
    );
  }

  if (options.routing) {
    logger.warn(
      'Routing is not allowed from data access libraries.  Please define your routing in a feature library.'
    );
  }

  if (options.standalone || options.skipModule === false) {
    logger.warn(
      'Data access libraries should not export any components or modules, so standalone and skipModule options are ignored.'
    );
  }

  return {
    ...options,
    addTailwind: false,
    routing: false,
    // data access libraries shouldn't export any
    // components or modules, so we skip both
    skipModule: true,
    standalone: false
  };
}

function normalizeFeatureOptions(
  options: NormalizedNgLibGeneratorOptions
): NormalizedNgLibGeneratorOptions {
  return {
    ...options,
    routing: options.routing ?? true,
    skipModule: options.skipModule ?? true,
    standalone: options.standalone ?? false
  };
}

function normalizeTestingOptions(
  options: NormalizedNgLibGeneratorOptions
): NormalizedNgLibGeneratorOptions {
  if (options.addTailwind) {
    logger.warn(
      'Tailwind is not allowed from testing libraries.  Please define your styles in a UI library.'
    );
  }

  return {
    ...options,
    addTailwind: false,
    routing: options.routing ?? false,
    skipModule: options.skipModule ?? true,
    standalone: options.standalone ?? false,
    unitTestRunner: 'none' as UnitTestRunner
  };
}

function normalizeUIOptions(
  options: NormalizedNgLibGeneratorOptions
): NormalizedNgLibGeneratorOptions {
  if (options.routing) {
    logger.warn(
      'Routing is not allowed from UI libraries.  Please define your routing in a feature library.'
    );
  }

  return {
    ...options,
    routing: false,
    skipModule: options.skipModule ?? true,
    standalone: options.standalone ?? false
  };
}

function normalizeUtilsOptions(
  options: NormalizedNgLibGeneratorOptions
): NormalizedNgLibGeneratorOptions {
  return {
    ...options,
    addTailwind: false,
    routing: false,
    skipModule: true,
    standalone: false
  };
}

export default ngLibGenerator;
