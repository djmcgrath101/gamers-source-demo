import { joinPathFragments, ProjectConfiguration, Tree } from '@nx/devkit';
import { posix } from 'path';

/**
 * Minimal subset of Angular build options used to locate the bootstrap entry point.
 */
type BuildTargetOptions = {
  browser?: string;
  main?: string;
};

/**
 * File extensions that should be treated as explicit source file references.
 */
type SupportedFileExtension =
  | '.cjs'
  | '.css'
  | '.js'
  | '.json'
  | '.jsx'
  | '.less'
  | '.mjs'
  | '.sass'
  | '.scss'
  | '.ts'
  | '.tsx';

/**
 * Returns the configured Angular browser bootstrap file for an application build target.
 */
export function findBootstrapEntryPoint(projectConfig: ProjectConfiguration): string | undefined {
  const buildOptions = projectConfig.targets?.['build']?.options as BuildTargetOptions | undefined;

  if (typeof buildOptions?.browser === 'string') {
    return buildOptions.browser;
  }

  if (typeof buildOptions?.main === 'string') {
    return buildOptions.main;
  }

  return undefined;
}

/**
 * Resolves the root component file by following the bootstrap entry point import.
 */
export function findRootComponentPath(
  tree: Tree,
  projectConfig: ProjectConfiguration
): string | undefined {
  const bootstrapEntryPoint = findBootstrapEntryPoint(projectConfig);

  if (bootstrapEntryPoint && tree.exists(bootstrapEntryPoint)) {
    const bootstrapContents = tree.read(bootstrapEntryPoint, 'utf-8');

    if (!bootstrapContents) {
      return undefined;
    }

    const bootstrapMatch = bootstrapContents.match(/bootstrapApplication\(\s*([A-Za-z0-9_]+)/);

    if (bootstrapMatch) {
      const componentIdentifier = bootstrapMatch[1];
      const importPattern = new RegExp(
        `import\\s+(?:\\{[^}]*\\b${componentIdentifier}\\b[^}]*\\}|${componentIdentifier})\\s+from\\s+['"](.+?)['"]`,
        'm'
      );
      const importMatch = bootstrapContents.match(importPattern);

      if (importMatch) {
        const componentPath = resolveImportPath(bootstrapEntryPoint, importMatch[1]);

        if (tree.exists(componentPath)) {
          return componentPath;
        }
      }
    }
  }

  const sourceRoot = projectConfig.sourceRoot ?? joinPathFragments(projectConfig.root, 'src');
  const defaultComponentPath = joinPathFragments(sourceRoot, 'app', 'app.component.ts');

  return tree.exists(defaultComponentPath) ? defaultComponentPath : undefined;
}

/**
 * Resolves the stylesheet referenced by the root Angular component metadata.
 */
export function findRootComponentStylesheetPath(
  tree: Tree,
  projectConfig: ProjectConfiguration
): string | undefined {
  const rootComponentPath = findRootComponentPath(tree, projectConfig);

  if (!rootComponentPath) {
    return undefined;
  }

  const componentContents = tree.read(rootComponentPath, 'utf-8');

  if (!componentContents) {
    return undefined;
  }

  const styleUrlMatch =
    componentContents.match(/styleUrl\s*:\s*['"](.+?)['"]/) ??
    componentContents.match(/styleUrls\s*:\s*\[\s*['"](.+?)['"]/);

  return styleUrlMatch ? resolveImportPath(rootComponentPath, styleUrlMatch[1]) : undefined;
}

/**
 * Resolves Angular source references found in bootstrap imports and component metadata.
 *
 * This is intentionally narrower than a general Node module resolver:
 * it only joins relative file-like paths inside the workspace source tree and
 * assumes extensionless component imports should resolve to `.ts` source files.
 * It does not handle package resolution, tsconfig path aliases, directory indexes,
 * or Node's runtime/module-loading semantics.
 */
export function resolveImportPath(fromFile: string, relativeImportPath: string): string {
  const resolvedPath = posix.normalize(posix.join(posix.dirname(fromFile), relativeImportPath));
  const resolvedExtension = posix.extname(resolvedPath) as SupportedFileExtension;
  const supportedExtensions: SupportedFileExtension[] = [
    '.cjs',
    '.css',
    '.js',
    '.json',
    '.jsx',
    '.less',
    '.mjs',
    '.sass',
    '.scss',
    '.ts',
    '.tsx'
  ];

  // Component import paths often end with ".component", which is not a real file extension.
  return supportedExtensions.includes(resolvedExtension) ? resolvedPath : `${resolvedPath}.ts`;
}
