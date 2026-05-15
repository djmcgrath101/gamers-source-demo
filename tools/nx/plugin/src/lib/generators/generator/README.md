# `nx-gen` Generator

Creates a new generator inside an existing Nx plugin project using a consistent folder layout and minimal boilerplate.

## What It Does

- Generates a new generator at `src/lib/generators/<directory>/generator.ts` inside the target plugin project.
- Uses `project` + `directory` instead of a raw `path` option.
- Defaults `directory` to the generator `name` when not provided.
- Ensures the target project is a plugin project (`type:plugin`).
- Replaces `schema.d.ts` with `schema.ts` so TypeScript can type-check schema types directly.
- Rewrites generated types from `Schema` naming to `Options` naming for consistency.
- Replaces the default factory boilerplate with a minimal starter function.
- Appends exports to the plugin entry point so `src/index.ts` re-exports the generator default under its function name and re-exports the schema types.

## Usage

```bash
nx g nx-plugin:nx-gen <name> --project=<plugin-project> [options]
```

## Options

- `name` (string, required): Generator name exported in the plugin's `generators.json` (kebab-case).
- `project` (string, required): Target plugin project name. Must be an Nx plugin project.
- `directory` (string, optional): Folder under `src/lib/generators` where files are created. Defaults to `name`.
- `description` (string, optional): Description for the generated generator entry.
- `unitTestRunner` (`jest` | `vitest` | `none`, default `jest`): Unit test runner for generated tests.
- `skipLintChecks` (boolean, default `false`): Skip adding eslint config for plugin JSON files.
- `minimal` (boolean, default `false`): Skip generating `README.md` in the generated generator directory.
- `skipFormat` (boolean, default `false`): Skip formatting generated files.

## Examples

```bash
# Basic
nx g nx-plugin:nx-gen my-generator --project=my-plugin

# Custom output folder
nx g nx-plugin:nx-gen my-generator --project=my-plugin --directory=custom-dir

# Vitest
nx g nx-plugin:nx-gen auth --project=my-plugin --unitTestRunner=vitest

# No tests and no formatting
nx g nx-plugin:nx-gen telemetry --project=my-plugin --unitTestRunner=none --skipFormat

# Minimal output with no generator README
nx g nx-plugin:nx-gen telemetry --project=my-plugin --minimal
```

## Generated Files

For `name=my-generator` and default `directory`:

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
