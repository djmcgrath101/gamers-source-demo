import { configureAngularJestTransformIgnorePatterns } from '@gamers-source/angular-tools-utils';
import { normalizeProjectOptions } from '@gamers-source/nx-utils';
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
import setupTailwindGenerator from '../setup-tailwind/generator';
import { NgLibGeneratorOptions, NormalizedNgLibGeneratorOptions } from './schema';

export async function ngLibGenerator(tree: Tree, rawOptions: NgLibGeneratorOptions) {
  const options = normalizeOptions(rawOptions);

  await libraryGenerator(tree, options);

  const projectConfig = readProjectConfiguration(tree, options.name);

  configureAngularJestTransformIgnorePatterns(tree, projectConfig.root);

  if (options.type === 'feature' || options.type === 'ui') {
    if (options.addTailwind) {
      await setupTailwindGenerator(tree, {
        project: options.name,
        skipFormat: true
      });
    }
  }

  generateFiles(tree, joinPathFragments(__dirname, 'files', options.type), projectConfig.root, {
    ...options,
    ...names(options.name),
    // we use the raw name which doesn't include the 'utils' suffix
    // for the fileName.
    fileName: rawOptions.name,
    tmpl: ''
  });

  if (!options.minimal) {
    tree.write(joinPathFragments(projectConfig.root, 'README.md'), `# ${options.name}`);
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

function normalizeOptions(rawOptions: NgLibGeneratorOptions): NormalizedNgLibGeneratorOptions {
  const unitTestRunner =
    rawOptions.unitTestRunner ||
    ((rawOptions.buildable || rawOptions.publishable
      ? 'vitest-angular'
      : 'vitest-analog') as UnitTestRunner);

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
