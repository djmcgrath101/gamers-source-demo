# `setup-pwa` Generator

Adds Angular PWA support to an existing Angular application and applies the
workspace's manifest and favicon layout conventions.

This generator wraps Angular's `@angular/pwa:ng-add` schematic. After the
upstream schematic runs, it replaces the generated manifest with the
workspace-specific template, moves generated icon assets from `icons/` to
`images/favicons/`, and ensures the application's build target points at the
project's `ngsw-config.json` file.

## Usage

```bash
pnpm nx g @gamers-source/angular-plugin:setup-pwa <project> [options]
```

## Options

| Option | Required | Default | Description |
| --- | --- | --- | --- |
| `project` | Yes | None | Name of the Angular application project to set up as a PWA. |
| `skipFormat` | No | `false` | Skip formatting generated and updated files. |

## Examples

Set up PWA support for an application named `catalog-app`:

```bash
pnpm nx g @gamers-source/angular-plugin:setup-pwa catalog-app
```

Run the generator without formatting:

```bash
pnpm nx g @gamers-source/angular-plugin:setup-pwa catalog-app --skipFormat
```

## Generated Output

The generator uses the same asset root that Angular's PWA schematic uses:

- If `<sourceRoot>/assets` exists, the manifest is written to
  `<sourceRoot>/assets/manifest.webmanifest`.
- Otherwise, the manifest is written to `<projectRoot>/public/manifest.webmanifest`.

Generated favicon files are expected under `images/favicons/`, and the manifest
references each icon from that location.
