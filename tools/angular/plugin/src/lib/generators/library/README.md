# `ng-lib` Generator

Creates a workspace-standard Angular library by wrapping the upstream Nx Angular library generator
and applying Gamers Source project naming, tagging, folder, Jest, and library-type conventions.

## Usage

```bash
pnpm nx g @gamers-source/angular-plugin:ng-lib <name> --type=<type> [options]
```

The generator treats every library as a frontend-scoped project. Unless `--directory` is provided,
the project is created under `libs/<name>/<type>` and the project name receives the type suffix.
For example, `orders --type=feature` becomes the `orders-feature` project at
`libs/orders/feature`.

## Options

Required options:

- `name`: library name in kebab case
- `type`: dependency type exported by the library (`core`, `data-access`, `feature`, `testing`,
  `ui`, or `utils`)

Workspace-specific options:

- `--directory`: override the default `libs/<name>/<type>` project path
- `--minimal`: skip the generated project `README.md` (default: `false`)
- `--addTailwind`: configure Tailwind CSS for `feature` and `ui` libraries; ignored for
  `data-access` and `utils` libraries

Common Angular library options:

- `--buildable`: generate a buildable library (default: `false`)
- `--publishable`: generate a publishable library (default: `false`)
- `--importPath`: package import path for publishable libraries
- `--prefix` / `-p`: selector prefix (default: `cy`)
- `--routing`: add routing support where the selected library type allows it
- `--lazy`: use lazy route configuration when routing is enabled
- `--parent`: parent route configuration path for route registration
- `--standalone`: use a standalone component entry point where the selected library type allows it
- `--skipModule`: skip the default NgModule where the selected library type allows it
- `--unitTestRunner`: unit test runner (`vitest-angular`, `vitest-analog`, `jest`, or `none`;
  defaults to `vitest-analog`, or `vitest-angular` for buildable and publishable libraries)
- `--linter`: lint tool (`eslint` or `none`; default: `eslint`)
- `--strict`: enable stricter type checking and build options (default: `true`)
- `--style`: generated component style extension for standalone libraries (default: `scss`)
- `--skipTests`: skip generated standalone component specs (default: `false`)
- `--skipFormat`: skip formatting generated files (default: `false`)

## Library Types

- `core`: creates a frontend core library. Routing defaults to `false`; modules are skipped by
  default.
- `data-access`: creates `features`, `services`, and `stores` folders. Tailwind, routing,
  standalone components, and modules are intentionally disabled because data-access libraries
  should not export UI.
- `feature`: creates a `views` folder. Routing defaults to `true`; modules are skipped by default.
- `testing`: creates a non-testable testing helper library and adds the selected test runner's
  ambient types to `tsconfig.lib.json`. Tailwind is intentionally disabled.
- `ui`: creates `components`, `directives`, `forms`, and `pipes` folders. Routing is intentionally
  disabled.
- `utils`: creates a starter utility file and spec named from the raw library name. Tailwind,
  routing, standalone components, and modules are disabled.

Generated Jest configs are patched to transform workspace-approved ESM dependencies such as
`lodash-es`, while preserving Angular's `.mjs` handling.

## Examples

```bash
pnpm nx g @gamers-source/angular-plugin:ng-lib catalog --type=data-access
pnpm nx g @gamers-source/angular-plugin:ng-lib orders --type=feature --routing
pnpm nx g @gamers-source/angular-plugin:ng-lib auth --type=testing --unitTestRunner=jest
pnpm nx g @gamers-source/angular-plugin:ng-lib design-system --type=ui --addTailwind --buildable
pnpm nx g @gamers-source/angular-plugin:ng-lib date --type=utils --minimal
```
