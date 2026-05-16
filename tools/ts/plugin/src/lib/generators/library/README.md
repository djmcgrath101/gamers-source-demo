# `ts-lib` Generator

Creates a TypeScript library using this workspace's project naming conventions and defaults.

## What It Does

- Wraps `@nx/js:library` and normalizes project options (`name`, `scope`, `type`).
- Creates a project-level `eslint.config.mjs` from template output.
- Optionally enables `@nx/dependency-checks` for JSON files when `checkDependencies=true`.
- Removes default boilerplate files in `src/lib` after library creation.
- Clears the library entry point and generates an initial typed file using `ts-file`.
- Ensures `tsconfig.lib.json` includes explicitly selected test runner types in `compilerOptions.types` for `testing` libraries without adding a test target.
- Defaults `unitTestRunner` to:
  - `vitest` for testable libraries such as `utils`.
  - `none` for non-testable libraries such as `testing` and `types`.
- Formats files unless `--skipFormat` is provided.

## Usage

```bash
pnpm nx g ts-plugin:ts-lib <name> --scope <scope> --type <type> [options]
```

## Options

- `name` (string, required): Library name in kebab-case.
- `scope` (`backend` | `frontend` | `shared` | `tools`, required): Library scope.
- `type` (`testing` | `types` | `utils`, required): Library dependency type.
- `directory` (string, optional): Directory where the library is created.
- `bundler` (`swc` | `tsc` | `rollup` | `vite` | `esbuild` | `none`, default `tsc`): Build configuration.
- `linter` (`eslint` | `none`, default `eslint`): Lint tool.
- `unitTestRunner` (`jest` | `vitest` | `none`, default inferred from `type`): Unit test runner. For `testing` libraries, this only controls ambient test types and does not create a test target.
- `testEnvironment` (`node` | `jsdom`, default `node`): Test environment when tests are enabled.
- `checkDependencies` (boolean, default `false`): Enables `@nx/dependency-checks` in generated ESLint config.
- `publishable` (boolean, default `false`): Configure the library for release workflows.
- `importPath` (string, optional): Required when `publishable=true`.
- `tags` (string, optional): Project tags.
- `skipFormat` (boolean, default `false`): Skip formatting.

## Constraints

- `frontend` + `utils` is intentionally blocked by this generator.
- Use `@gamers-source/angular-plugin:library` instead for frontend utility libraries.

## Examples

```bash
# Shared utility library
pnpm nx g ts-plugin:ts-lib date --scope shared --type utils

# Backend testing library with dependency checks enabled
pnpm nx g ts-plugin:ts-lib auth --scope backend --type testing --checkDependencies

# Publishable shared types library
pnpm nx g ts-plugin:ts-lib contracts --scope shared --type types --publishable --importPath=@myorg/contracts
```
