import { isApplicationProject } from '@gamers-source/nx-utils';
import { joinPathFragments, ProjectConfiguration, Tree } from '@nx/devkit';

const ANGULAR_JEST_TRANSFORM_IGNORE_PATTERNS = `transformIgnorePatterns: [
    'node_modules/.pnpm/(?!(lodash-es)@|.*\\\\.mjs$)',
    'node_modules/(?!\\\\.pnpm|lodash-es/|.*\\\\.mjs$)'
  ]`;

const TRANSFORM_IGNORE_PATTERNS_REGEX = /transformIgnorePatterns:\s*\[[\s\S]*?\],/;

/**
 * Ensures generated Angular Jest configs transform ESM dependencies used by workspace code.
 */
export function configureAngularJestTransformIgnorePatterns(tree: Tree, projectRoot: string): void {
  const jestConfigPath = joinPathFragments(projectRoot, 'jest.config.ts');

  if (!tree.exists(jestConfigPath)) {
    return;
  }

  const jestConfig = tree.read(jestConfigPath, 'utf-8');

  if (!jestConfig) {
    return;
  }

  if (TRANSFORM_IGNORE_PATTERNS_REGEX.test(jestConfig)) {
    tree.write(
      jestConfigPath,
      jestConfig.replace(
        TRANSFORM_IGNORE_PATTERNS_REGEX,
        `${ANGULAR_JEST_TRANSFORM_IGNORE_PATTERNS},`
      )
    );

    return;
  }

  if (jestConfig.includes('  snapshotSerializers:')) {
    tree.write(
      jestConfigPath,
      jestConfig.replace(
        '  snapshotSerializers:',
        `  ${ANGULAR_JEST_TRANSFORM_IGNORE_PATTERNS},\n  snapshotSerializers:`
      )
    );

    return;
  }

  tree.write(
    jestConfigPath,
    jestConfig.replace(/\n};\s*$/, `,\n  ${ANGULAR_JEST_TRANSFORM_IGNORE_PATTERNS}\n};\n`)
  );
}

/**
 * Derives a selector prefix from the Angular application name.
 */
export function deriveSelectorPrefixFromNgAppName(name: string): string {
  const prefix = name
    .split('-')
    .map(part => part[0])
    .join('');

  return prefix;
}

/**
 * Determines if the given project configuration corresponds to an Angular application.
 */
export function isAngularApp(projectConfig: ProjectConfiguration): boolean {
  return (
    (isApplicationProject(projectConfig) &&
      projectConfig?.targets?.['build']?.executor?.includes('angular')) ||
    false
  );
}
