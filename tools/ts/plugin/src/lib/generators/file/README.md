# ts-file Generator

Generates a TypeScript file for an existing Nx library project.

The generator creates files under the target project's `src/lib` directory using the
`<name>.<type>.ts` filename convention. By default, it also creates a matching spec
file and exports the generated file from the library entry point.

## Usage

```sh
pnpm nx g @gamers-source/ts-plugin:file my-file --project=my-lib --type=service
```

This creates:

```text
libs/my-lib/src/lib/my-file.service.ts
libs/my-lib/src/lib/my-file.service.spec.ts
```

It also adds an export to the project's public entry point:

```ts
export * from './lib/my-file.service';
```

## Options

| Option | Required | Default | Description |
| --- | --- | --- | --- |
| `name` | Yes | | File name in kebab-case. This becomes the base filename. |
| `project` | Yes | | Project where the file should be generated. |
| `type` | Yes | | File type in kebab-case. This becomes the filename suffix. |
| `directory` | No | | Directory under the project's `src/lib` folder. |
| `export` | No | `true` | Export the generated file from the library entry point. |
| `addSpec` | No | `true` | Create a matching `.spec.ts` file. |
| `skipFormat` | No | `false` | Skip formatting generated files. |

## Examples

Generate a model file without a spec:

```sh
pnpm nx g @gamers-source/ts-plugin:file user --project=accounts --type=model --addSpec=false
```

Generate a file in a nested directory:

```sh
pnpm nx g @gamers-source/ts-plugin:file format-date --project=shared-utils --type=util --directory=date
```

This creates:

```text
libs/shared-utils/src/lib/date/format-date.util.ts
libs/shared-utils/src/lib/date/format-date.util.spec.ts
```

Generate an internal file that is not exported from the public API:

```sh
pnpm nx g @gamers-source/ts-plugin:file normalize-user --project=accounts --type=mapper --export=false
```
