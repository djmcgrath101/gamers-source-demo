# `@gamers-source/ts-plugin`

Workspace Nx plugin for TypeScript project and file generation.

## Generators

### `ts-lib`

Creates a TypeScript library using the workspace naming, tagging, linting, and test defaults.

```bash
pnpm nx g ts-plugin:ts-lib <name> --scope <scope> --type <type> [options]
```

Use this generator for `testing`, `types`, and `utils` libraries. It wraps `@nx/js:library`, normalizes the project name and directory, writes the project ESLint config, removes Nx boilerplate, and generates the initial typed source file through `ts-file`.

Common examples:

```bash
pnpm nx g ts-plugin:ts-lib date --scope shared --type utils
pnpm nx g ts-plugin:ts-lib auth --scope backend --type testing --checkDependencies
pnpm nx g ts-plugin:ts-lib contracts --scope shared --type types --publishable --importPath=@gamers-source/contracts
```

Notes:

- `frontend` + `utils` is blocked here. Use `@gamers-source/angular-plugin:library` for frontend utility libraries.
- Testable libraries such as `utils` default to Vitest.
- Non-testable libraries such as `testing` and `types` default to no unit test runner.
- `testing` libraries add the selected runner types to `tsconfig.lib.json`.

### `ts-file`

Generates a typed TypeScript file inside an existing library's `src/lib` folder.

```bash
pnpm nx g ts-plugin:ts-file <name> --project <project> --type <type> [options]
```

The generated filename follows `<name>.<type>.ts`. By default the generator also creates a matching `.spec.ts` file and exports the file from the library entry point.

Common examples:

```bash
pnpm nx g ts-plugin:ts-file user --project accounts --type model --addSpec=false
pnpm nx g ts-plugin:ts-file format-date --project shared-utils --type util --directory date
pnpm nx g ts-plugin:ts-file normalize-user --project accounts --type mapper --export=false
```

## Project Commands

Build the plugin:

```bash
pnpm nx run ts-plugin:build
```

Run unit tests:

```bash
pnpm nx run ts-plugin:test
```

Run type checking:

```bash
pnpm nx run ts-plugin:typecheck
```

Run lint:

```bash
pnpm nx run ts-plugin:lint
```

## More Detail

- `src/lib/generators/library/README.md` documents `ts-lib` options and behavior.
- `src/lib/generators/file/README.md` documents `ts-file` options and behavior.
