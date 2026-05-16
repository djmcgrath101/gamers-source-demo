# `signal-store-feature` Generator

Creates a Signal Store feature file pair inside an existing Nx project using this workspace's conventions.

## What It Does

- Validates that the target project is a supported project type: `app`, `data-access`, `feature`, `ui`, or `utils`.
- Generates `<name>.feature.ts` and `<name>.feature.spec.ts`.
- Defaults output to the project's `features` directory under its source-type folder (`src/lib` for libraries, `src/app` for applications).
- Optionally exports the generated feature from the project entry point.

## Usage

```bash
pnpm nx g ngrx-plugin:signal-store-feature <name> --project=<target-project> [options]
pnpm nx g @gamers-source/ngrx-plugin:signal-store-feature <name> --project=<target-project> [options]
```

## Options

- `name` (string, required): Signal Store feature name in kebab-case. This becomes `<name>.feature.ts`.
- `project` (string, required): Target project name. Must be an `app`, `data-access`, `feature`, `ui`, or `utils` project.
- `directory` (string, optional): Directory under the project's source-type folder. Defaults to `features`.
- `export` (boolean, default `true`): Export the generated feature from the project entry point.
- `skipFormat` (boolean, default `false`): Skip formatting generated files.

## Examples

```bash
# Generate in the default features directory
pnpm nx g ngrx-plugin:signal-store-feature orders --project=orders-data-access

# Generate in a custom subdirectory
pnpm nx g ngrx-plugin:signal-store-feature orders --project=orders-data-access --directory=state/features

# Generate without exporting from the project entry point
pnpm nx g ngrx-plugin:signal-store-feature orders --project=orders-data-access --export=false
```

## Generated Files

For `name=orders` with the default options:

```text
<project-root>/src/index.ts                       # updated when export=true
<project-root>/src/lib/features/orders.feature.ts
<project-root>/src/lib/features/orders.feature.spec.ts
```
