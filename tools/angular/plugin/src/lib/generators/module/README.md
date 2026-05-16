# `ng-module` Generator

Creates an Angular NgModule by delegating to `@schematics/angular:module` and then applying workspace-specific module conventions. The generator preserves the Angular-generated module structure and only augments it when custom options are enabled.

## Usage

```bash
pnpm nx g @gamers-source/angular-plugin:ng-module <name> --project=<project>
```

## Options

Required options:

- `name`: module name
- `project`: project that owns the generated module

Angular module options:

- `--path`: create the module at a specific path relative to the workspace root
- `--flat`: generate files directly in the target directory (default: `false`)
- `--routing`: create a routing module
- `--routingScope`: choose the routing scope (`Child` or `Root`, default: `Child`)
- `--route`: create a lazy-loaded route and register it in the declaring module
- `--module` / `-m`: declare the new module in an existing Angular module
- `--commonModule`: include `CommonModule` in the generated module imports (default: `true`)

Workspace-specific options:

- `--core`: add a guard that throws if the module is imported more than once
- `--forRoot`: add a static `forRoot()` method that returns `ModuleWithProviders`
- `--ui`: add an exported `declarations` array placeholder for UI-facing declarations
- `--skipSpec`: skip generating the module spec file (default: `false`)
- `--skipFormat`: skip formatting generated files (default: `false`)

## Examples

```bash
pnpm nx g @gamers-source/angular-plugin:ng-module auth --project=shared-auth
pnpm nx g @gamers-source/angular-plugin:ng-module settings --project=admin-shell --route=settings --module=app
pnpm nx g @gamers-source/angular-plugin:ng-module shared-ui --project=design-system --ui --flat
pnpm nx g @gamers-source/angular-plugin:ng-module core --project=shared-core --core --forRoot
```
