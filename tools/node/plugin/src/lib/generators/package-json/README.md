# `package-json` Generator

Creates a minimal `package.json` file in a target directory.

## What It Does

- Generates `<dir>/package.json` when the file does not already exist.
- Prefixes the provided package `name` with the workspace npm scope when one is configured.
- Sets `version` to `0.0.1` by default, or uses an explicit semantic version when `--vers` is provided.
- Marks the package as private by default.
- Optionally writes `main`, `engines.node`, and `scripts.start` for deployable Node packages.
- Optionally copies selected dependency versions from the root `package.json` into the generated package.
- Delegates version assignment to the `package-version` generator so version handling stays consistent.
- Skips generation and logs a warning when `package.json` already exists at the target path.
- Replaces an existing `package.json` only when `--overwrite` is provided.
- Formats files unless `--skipFormat` is provided.

## Usage

```bash
pnpm nx g node-plugin:package-json <dir> --name <package-name> [options]
```

## Options

- `dir` (string, required): Directory where `package.json` is created.
- `name` (string, required): Package name without the workspace npm scope. If the workspace scope is `gamers-source` and `name=widget`, the generated package name becomes `gamers-source/widget`.
- `dependencies` (string array): Package names to copy from the root `package.json` dependencies or devDependencies.
- `main` (string): Entry point to write to the generated package.
- `nodeEngine` (string): Semver range to write to `engines.node`.
- `overwrite` (boolean, default `false`): Replace an existing `package.json`. Existing custom fields are discarded.
- `vers` (string, default `0.0.1`): Explicit semantic version to write into `package.json`.
- `private` (boolean, default `true`): Marks the generated package as private. When `false`, the `private` field is omitted.
- `skipFormat` (boolean, default `false`): Skip formatting generated files.
- `startScript` (string): Command to write to `scripts.start`.

## Examples

```bash
# Create libs/tools/package.json with the workspace scope and default version
pnpm nx g node-plugin:package-json libs/tools --name widget

# Create a public package.json with an explicit version
pnpm nx g node-plugin:package-json libs/contracts --name api-contracts --private=false --vers=2.3.4

# Create an Azure-ready Angular SSR package.json from root package versions
pnpm nx g node-plugin:package-json apps/gamers-source --name gamers-source --main=server/server.mjs --nodeEngine="^20.19.0 || ^22.12.0 || ^24.0.0" --startScript="node server/server.mjs" --dependencies=@angular/common,@angular/core,@angular/platform-browser,@angular/router,@angular/service-worker,@angular/ssr,@nx/angular,express --overwrite
```
