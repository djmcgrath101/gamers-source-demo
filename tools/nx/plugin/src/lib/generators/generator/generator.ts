import {
  getPathToLibEntryPointFile,
  getRelativeImportToFile,
  isProjectOfType
} from '@gamers-source/nx-utils';
import {
  formatFiles,
  generateFiles,
  joinPathFragments,
  names,
  readProjectConfiguration,
  Tree
} from '@nx/devkit';
import { generatorGenerator } from '@nx/plugin/generators';
import { omit } from 'lodash-es';
import { NormalizedNxGeneratorGeneratorOptions, NxGeneratorGeneratorOptions } from './schema';

function appendGeneratorExportsToEntryPoint(
  tree: Tree,
  generatorDir: string,
  generatorName: string,
  project: ReturnType<typeof readProjectConfiguration>
): void {
  const entryPointPath = getPathToLibEntryPointFile(tree, project);
  if (!entryPointPath) {
    return;
  }

  const generatorPath = getRelativeImportToFile(
    entryPointPath,
    joinPathFragments(generatorDir, 'generator.ts')
  );
  const schemaPath = getRelativeImportToFile(
    entryPointPath,
    joinPathFragments(generatorDir, 'schema.ts')
  );
  const { propertyName } = names(generatorName);

  // Keep the public entry point aligned with the generated function name while only re-exporting the default.
  const nextContent = appendMissingLines(tree.read(entryPointPath, 'utf-8') ?? '', [
    `export { default as ${propertyName}Generator } from '${generatorPath}';`,
    `export * from '${schemaPath}';`
  ]);

  tree.write(entryPointPath, nextContent);
}

function appendMissingLines(content: string, lines: string[]): string {
  const missingLines = lines.filter(line => !content.includes(line));
  if (missingLines.length === 0) {
    return content;
  }

  const separator = content.length > 0 && !content.endsWith('\n') ? '\n' : '';
  return `${content}${separator}${missingLines.join('\n')}\n`;
}

function normalizeOptions(
  options: NxGeneratorGeneratorOptions
): NormalizedNxGeneratorGeneratorOptions {
  return {
    ...options,
    directory: options.directory || options.name,
    minimal: options.minimal ?? false
  };
}

/**
 * Creates a generator in an existing plugin project with workspace-specific defaults.
 */
export async function nxGeneratorGenerator(
  tree: Tree,
  rawOptions: NxGeneratorGeneratorOptions
): Promise<void> {
  const options = normalizeOptions(rawOptions);
  const projectConfig = readProjectConfiguration(tree, options.project);

  if (!isProjectOfType(projectConfig, 'plugin')) {
    throw new Error(`Project ${options.project} must be a plugin project.`);
  }

  const generatorsPath = joinPathFragments(projectConfig.root, 'src', 'lib', 'generators');
  const generatorDir = joinPathFragments(generatorsPath, options.directory);
  const generatorFile = joinPathFragments(generatorDir, 'generator');

  await generatorGenerator(tree, {
    path: generatorFile,
    ...omit(options, ['directory', 'project']),
    skipFormat: true
  });

  tree.delete(joinPathFragments(generatorDir, 'schema.d.ts'));

  const { className, propertyName } = names(options.name);
  generateFiles(tree, joinPathFragments(__dirname, 'files'), generatorDir, {
    className,
    generatorName: options.name,
    propertyName,
    tmpl: ''
  });
  appendGeneratorExportsToEntryPoint(tree, generatorDir, options.name, projectConfig);

  // Align with workspace minimal behavior by removing the templated README when requested.
  removeGeneratorReadmeForMinimal(tree, generatorDir, options.minimal);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

function removeGeneratorReadmeForMinimal(tree: Tree, generatorDir: string, minimal: boolean): void {
  if (!minimal) {
    return;
  }

  const readmePath = joinPathFragments(generatorDir, 'README.md');
  tree.delete(readmePath);
}

export default nxGeneratorGenerator;
