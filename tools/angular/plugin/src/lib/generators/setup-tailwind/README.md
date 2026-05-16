# `setup-tailwind` Generator

Configures Tailwind CSS for an Angular application or buildable/publishable Angular library by
wrapping Nx's setup generator and layering on Gamers Source workspace defaults.

## Usage

```bash
pnpm nx g @gamers-source/angular-plugin:setup-tailwind <project> [options]
```

The generator delegates package installation and base Tailwind setup to Nx when the project does
not already have a `tailwind.config.js`. It then writes a project Tailwind config that extends the
workspace root preset and scans the project plus its dependencies.

For applications, the generator also appends the shared root layout helpers to the root component
stylesheet resolved from the project's bootstrap entry point. Re-running the generator will not
duplicate those helpers.

## Options

Required options:

- `project`: Angular application or buildable/publishable library project name

Optional options:

- `--buildTarget`: build target used for buildable/publishable libraries (default: `build`)
- `--stylesEntryPoint`: application styles entry point relative to the workspace root. Use this
  when Nx cannot infer the styles file automatically.
- `--skipPackageJson`: do not add Tailwind dependencies to `package.json` (default: `false`)
- `--skipFormat`: skip formatting generated files (default: `false`)

## Generated Files

- `<projectRoot>/tailwind.config.js`: created only when the project does not already have one
- root component stylesheet helpers: appended for applications when a root component stylesheet can
  be resolved

## Examples

```bash
pnpm nx g @gamers-source/angular-plugin:setup-tailwind web-shell
pnpm nx g @gamers-source/angular-plugin:setup-tailwind design-system-ui --buildTarget=build
pnpm nx g @gamers-source/angular-plugin:setup-tailwind web-shell --stylesEntryPoint=apps/web-shell/src/styles.scss
```
