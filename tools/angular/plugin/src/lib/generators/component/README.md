# `ng-comp` Generator

Creates an Angular component in a workspace-standard project location by delegating to the Nx Angular component generator.

## Usage

```bash
pnpm nx g @gamers-source/angular-plugin:ng-comp <name> --project=<project>
```

## Options

Required options:

- `name`: component name
- `project`: project that owns the generated component

Common Angular component options:

- `--path`: create the component below a path relative to the project's `src/app` or `src/lib` directory
- `--prefix` / `-p`: selector prefix
- `--selector`: explicit component selector
- `--standalone`: generate a standalone component (default: `true`)
- `--changeDetection` / `-c`: change detection strategy (default: `OnPush`)
- `--style`: stylesheet format (default: `scss`)
- `--inlineTemplate` / `-t`: inline the component template (default: `true`)
- `--inlineStyle` / `-s`: inline component styles (default: `false`)
- `--skipTests`: skip component spec generation (default: `false`)
- `--skipImport`: skip NgModule import when generating a non-standalone component (default: `false`)
- `--export`: export the component from the declaring NgModule and library entry point when applicable (default: `true`)

Workspace-specific options:

- `--type`: file suffix for the generated component (`component`, `form`, or `view`; default: `component`)
- `--skipFormat`: skip formatting generated files (default: `false`)

## File Naming

The `--type` option controls the component file suffix:

- `--type=component` generates `checkout.component.ts`
- `--type=form` generates `checkout.form.ts`
- `--type=view` generates `checkout.view.ts`

The wrapper passes the suffix through to the Nx Angular component generator.

## Examples

```bash
pnpm nx g @gamers-source/angular-plugin:ng-comp checkout --project=orders-ui
pnpm nx g @gamers-source/angular-plugin:ng-comp checkout --project=orders-ui --type=view
pnpm nx g @gamers-source/angular-plugin:ng-comp payment --project=orders-ui --type=form
pnpm nx g @gamers-source/angular-plugin:ng-comp summary --project=orders-ui --path=checkout
```
