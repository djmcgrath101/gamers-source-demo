# `nx-plugin` Generator

Creates a new Nx plugin project with this workspace's conventions.

## What It Does

- Wraps `@nx/plugin:plugin`.
- Normalizes project options with `scope: tools` and `type: plugin`.
- Normalizes naming and directory using `@gamers-source/nx-utils` conventions.
- Defaults `checkDependencies` to `false`.
- Adds plugin-specific files after generation:
  - `eslint.config.mjs` that extends the workspace base ESLint config.
  - `@nx/nx-plugin-checks` rules for `package.json` and `generators.json`.
  - Optional `@nx/dependency-checks` JSON lint rule when `checkDependencies=true`.
  - `src/lib/.gitkeep`.
- Formats files unless `--skipFormat` is provided.

## Usage

```bash
pnpm nx g nx-plugin:nx-plugin <name> [options]
```

You can also invoke it with the full package name:

```bash
pnpm nx g @gamers-source/nx-plugin:nx-plugin <name> [options]
```

## Options

- `name` (string, required): Plugin name (kebab-case).
- `directory` (string, optional): Directory where the plugin is placed, relative to the `/plugins` folder. Defaults to `/plugins/<name>`.
- `importPath` (string, optional): Publish/import path, for example `@myorg/my-plugin`.
- `linter` (`eslint` | `none`, default `eslint`): Lint tool.
- `unitTestRunner` (`jest` | `vitest` | `none`, default `jest`): Unit test runner.
- `e2eTestRunner` (`jest` | `none`, default `none`): E2E test runner.
- `compiler` (`tsc` | `swc`, default `tsc`): Compiler for build/test targets.
- `publishable` (boolean, default `false`): Generate npm publish boilerplate.
- `tags` (string, optional): Project tags for lint boundaries.
- `useProjectJson` (boolean, optional): Use `project.json` instead of `package.json` Nx config.
- `checkDependencies` (boolean, default `false`): Enable `@nx/dependency-checks` rule in generated ESLint config.
- `setParserOptionsProject` (boolean, default `false`): Configure ESLint `parserOptions.project`.
- `skipLintChecks` (boolean, default `false`): Skip plugin JSON lint config setup.
- `skipTsConfig` (boolean, default `false`): Skip root `tsconfig` updates.
- `skipFormat` (boolean, default `false`): Skip formatting.

Legacy/deprecated:

- `standaloneConfig` (boolean, deprecated): Nx now only supports standalone project config.

## Examples

```bash
# Basic
pnpm nx g nx-plugin:nx-plugin my-plugin

# Publishable plugin with import path
pnpm nx g nx-plugin:nx-plugin my-plugin --importPath=@myorg/my-plugin --publishable

# Enable dependency-checking lint rule in plugin JSON files
pnpm nx g nx-plugin:nx-plugin my-plugin --checkDependencies

# Use SWC and Vitest
pnpm nx g nx-plugin:nx-plugin my-plugin --compiler=swc --unitTestRunner=vitest
```
