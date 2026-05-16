# `signal-store` Generator

Creates a Signal Store file pair inside an existing Nx project using this workspace's conventions.

## What It Does

- Validates that the target project is a supported project type: `app`, `data-access`, `feature`, `ui`, or `utils`.
- Generates `<name>.store.ts` and `<name>.store.spec.ts`.
- Defaults output to the project's `src/lib/stores` directory.
- Optionally exports the generated store from the project entry point.
- Supports toggling `providedIn: 'root'` and the `withLogger` feature in the generated store template.

## Usage

```bash
pnpm nx g ngrx-plugin:signal-store <name> --project=<target-project> [options]
pnpm nx g @gamers-source/ngrx-plugin:signal-store <name> --project=<target-project> [options]
```

## Options

- `name` (string, required): Signal Store name in kebab-case. This becomes `<name>.store.ts`.
- `project` (string, required): Target project name. Must be a `app`, `data-access`, `feature`, `ui`, or `utils` project.
- `directory` (string, optional): Directory under the project's `src/lib` folder. Defaults to `stores`.
- `export` (boolean, default `true`): Export the generated store from the project entry point.
- `providedInRoot` (boolean, default `true`): Include `{ providedIn: 'root' }` in the generated `signalStore(...)`.
- `skipLogger` (boolean, default `false`): Omit the `withLogger(...)` feature and its import.
- `skipFormat` (boolean, default `false`): Skip formatting generated files.

## Examples

```bash
# Generate in the default src/lib/stores directory
pnpm nx g ngrx-plugin:signal-store orders --project=orders-data-access

# Generate in a custom subdirectory
pnpm nx g ngrx-plugin:signal-store orders --project=orders-data-access --directory=state

# Generate without exporting from the project entry point
pnpm nx g ngrx-plugin:signal-store orders --project=orders-data-access --export=false

# Generate a store that is provided manually and does not include the logger feature
pnpm nx g ngrx-plugin:signal-store orders --project=orders-data-access --providedInRoot=false --skipLogger
```

## Generated Files

For `name=orders` with the default options:

```text
<project-root>/src/index.ts                   # updated when export=true
<project-root>/src/lib/stores/orders.store.ts
<project-root>/src/lib/stores/orders.store.spec.ts
```
