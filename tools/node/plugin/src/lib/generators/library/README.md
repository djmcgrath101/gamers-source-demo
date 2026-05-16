# `node-lib` Generator

Creates a backend TypeScript library using this workspace's library naming and directory conventions.

## What It Does

- Wraps `@gamers-source/ts-plugin:ts-lib` and always sets `scope=backend`.
- Normalizes the project name to include the library `type` suffix when needed.
- Uses workspace path conventions for backend libraries.
- Delegates library creation to the shared TypeScript library generator.
- Formats files unless `--skipFormat` is provided.

## Naming And Paths

- Project names are normalized to `<name>-<type>`.
- When `directory` is omitted, backend libraries are created under `libs/<name>/<type>`.
- Example: `pnpm nx g node-plugin:node-lib auth --type utils` creates project `auth-utils` in `libs/auth/utils`.

## Usage

```bash
pnpm nx g node-plugin:node-lib <name> --type <type> [options]
```

## Options

- `name` (string, required): Library name in kebab-case.
- `type` (`testing` | `types` | `utils`, required): Library dependency type.
- `directory` (string, optional): Override the generated project directory.
- `bundler` (`swc` | `tsc` | `rollup` | `vite` | `esbuild` | `none`, default `tsc`): Build configuration.
- `linter` (`eslint` | `none`, default `eslint`): Lint tool.
- `unitTestRunner` (`jest` | `vitest` | `none`, default `jest`): Unit test runner.
- `testEnvironment` (`node` | `jsdom`, default `node`): Test environment when tests are enabled.
- `publishable` (boolean, default `false`): Configure the library for release workflows.
- `importPath` (string, optional): Required when `publishable=true`.
- `buildable` (boolean, default `true`): Legacy alias for buildable output. Prefer `bundler`.
- `tags` (string, optional): Project tags.
- `minimal` (boolean, default `false`): Generate a minimal setup.
- `skipFormat` (boolean, default `false`): Skip formatting generated files.

## Constraints

- This generator always creates backend libraries. `scope` is not exposed as an option.
- The shared TS library defaults still apply after scope normalization.

## Examples

```bash
# Backend utility library
pnpm nx g node-plugin:node-lib auth --type utils

# Backend types library in an explicit directory
pnpm nx g node-plugin:node-lib contracts --type types --directory libs/domain/contracts/types

# Publishable backend testing library
pnpm nx g node-plugin:node-lib auth-test-kit --type testing --publishable --importPath=@myorg/auth-test-kit
```
