# `nx-plugin`

Workspace-local Nx plugin for creating Nx plugins and scaffolding generators inside those plugins with this workspace's conventions.

## Available Generators

- `nx-plugin`: Creates a new Nx plugin project with normalized naming and plugin-specific lint setup.
- `nx-gen`: Creates a new generator inside an existing Nx plugin project with a minimal starter layout.
- `default-project`: Sets the `defaultProject` field in the workspace `nx.json`.

## Generator: `nx-plugin`

## What It Does

- Wraps `@nx/plugin:plugin`.
- Normalizes project naming and directory placement for this workspace.
- Applies the default tags `scope:tools,type:plugin`.
- Adds plugin-specific files after generation:
  - `eslint.config.mjs` extending the workspace base config.
  - `@nx/nx-plugin-checks` rules for plugin metadata files.
  - Optional `@nx/dependency-checks` JSON linting when `--checkDependencies` is enabled.
  - `src/lib/.gitkeep`.

## Usage

```bash
pnpm nx g nx-plugin:nx-plugin <name> [options]
pnpm nx g @gamers-source/nx-plugin:nx-plugin <name> [options]
```

## Options

- `name` (string, required): Plugin name in kebab-case.
- `directory` (string, optional): Directory where the plugin is placed.
- `importPath` (string, optional): Publish/import path such as `@myorg/my-plugin`.
- `linter` (`eslint` | `none`, default `eslint`): Lint tool.
- `unitTestRunner` (`jest` | `vitest` | `none`, default `jest`): Unit test runner.
- `e2eTestRunner` (`jest` | `none`, default `none`): E2E test runner.
- `compiler` (`tsc` | `swc`, default `tsc`): Compiler for build and test targets.
- `publishable` (boolean, default `false`): Generate npm publishing boilerplate.
- `tags` (string, optional): Additional project tags.
- `useProjectJson` (boolean, optional): Use `project.json` instead of package-level Nx config.
- `checkDependencies` (boolean, default `false`): Enable `@nx/dependency-checks` in the generated ESLint config.
- `setParserOptionsProject` (boolean, default `false`): Configure ESLint `parserOptions.project`.
- `skipLintChecks` (boolean, default `false`): Skip plugin JSON lint config setup.
- `skipTsConfig` (boolean, default `false`): Skip updating the workspace `tsconfig`.
- `skipFormat` (boolean, default `false`): Skip formatting generated files.

Deprecated:

- `standaloneConfig` (boolean): Nx now only supports standalone project configuration.

## Examples

```bash
# Basic
pnpm nx g nx-plugin:nx-plugin my-plugin

# Publishable plugin with an import path
pnpm nx g nx-plugin:nx-plugin my-plugin --importPath=@myorg/my-plugin --publishable

# Enable dependency-checking lint rules
pnpm nx g nx-plugin:nx-plugin my-plugin --checkDependencies

# Use SWC and Vitest
pnpm nx g nx-plugin:nx-plugin my-plugin --compiler=swc --unitTestRunner=vitest
```

## Generator: `nx-gen`

## What It Does

- Creates a generator at `src/lib/generators/<directory>/generator.ts` inside the target plugin project.
- Uses `project` plus `directory` instead of a raw `path` option.
- Defaults `directory` to the generator `name`.
- Validates that the target project is an Nx plugin project.
- Replaces `schema.d.ts` with `schema.ts` so TypeScript can type-check schema types directly.
- Rewrites generated types from `Schema` naming to `Options` naming for consistency.
- Replaces the default factory boilerplate with a minimal starter function.
- Appends exports to the plugin entry point so `src/index.ts` re-exports the generator default under its function name and re-exports the schema types.

## Usage

```bash
pnpm nx g nx-plugin:nx-gen <name> --project=<plugin-project> [options]
```

## Options

- `name` (string, required): Generator name exported in the plugin's `generators.json`.
- `project` (string, required): Target plugin project name.
- `directory` (string, optional): Folder under `src/lib/generators`; defaults to `name`.
- `description` (string, optional): Description for the generated generator entry.
- `unitTestRunner` (`jest` | `vitest` | `none`, default `jest`): Unit test runner for generated tests.
- `skipLintChecks` (boolean, default `false`): Skip adding ESLint config for plugin JSON files.
- `minimal` (boolean, default `false`): Skip generating the generator-local `README.md`.
- `skipFormat` (boolean, default `false`): Skip formatting generated files.

## Examples

```bash
# Basic
pnpm nx g nx-plugin:nx-gen my-generator --project=my-plugin

# Custom output folder
pnpm nx g nx-plugin:nx-gen my-generator --project=my-plugin --directory=custom-dir

# Vitest
pnpm nx g nx-plugin:nx-gen auth --project=my-plugin --unitTestRunner=vitest

# No tests and no formatting
pnpm nx g nx-plugin:nx-gen telemetry --project=my-plugin --unitTestRunner=none --skipFormat

# Minimal output with no generator README
pnpm nx g nx-plugin:nx-gen telemetry --project=my-plugin --minimal
```

## Generated Files

For `name=my-generator` and the default `directory`:

```text
<plugin-root>/src/index.ts       # adds generator + schema exports
<plugin-root>/src/lib/generators/my-generator/
  generator.ts
  generator.spec.ts            # unless unitTestRunner=none
  README.md                    # unless minimal=true
  schema.json
  schema.ts
  files/
    ...
```

## Generator: `default-project`

## What It Does

- Validates that the provided project exists.
- Updates `nx.json` to set `defaultProject`.

## Usage

```bash
pnpm nx g nx-plugin:default-project --project=<project-name>
```

## Options

- `project` (string, required): Project name to set as `defaultProject`.
- `skipFormat` (boolean, default `false`): Skip formatting.

## Examples

```bash
pnpm nx g nx-plugin:default-project --project=web
```

## Nx Targets

- Build: `pnpm nx build nx-plugin`
- Test: `pnpm nx test nx-plugin`
