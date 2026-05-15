# `default-project` Generator

Sets the `defaultProject` value in the workspace `nx.json`.

## What It Does

- Validates the provided `project` exists in the workspace.
- Updates `nx.json` to set `defaultProject` to the provided project name.
- Formats files unless `--skipFormat` is provided.

## Usage

```bash
pnpm nx g nx-plugin:default-project --project=<project-name>
```

## Options

- `project` (string, required): Project name to set as `defaultProject`.
- `skipFormat` (boolean, default `false`): Skip formatting.

## Examples

```bash
# Set apps/web as the default project
pnpm nx g nx-plugin:default-project --project=web
```
