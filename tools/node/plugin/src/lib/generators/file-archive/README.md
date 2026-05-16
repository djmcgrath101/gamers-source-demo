# `file-archive` Generator

Creates a `.zip` or `.tar` archive from every file under a source directory.

## What It Does

- Recursively reads all files from the provided `source` directory.
- Preserves the source directory structure inside the archive.
- Writes the archive into `destination`, or into the source directory when `destination` is omitted.
- Uses `<source-directory-name>.<format>` as the default archive filename.
- Supports `zip` and `tar` archive formats.
- Logs a warning and skips archive creation when the source directory contains no files.
- Logs a warning and skips archive creation when the archive file already exists unless `overwrite` is enabled.

## Usage

```bash
pnpm nx g node-plugin:file-archive <source> [destination] [options]
```

## Options

- `source` (string, required): Directory to archive, relative to the workspace root.
- `destination` (string, optional): Directory where the archive file is written, relative to the workspace root. Defaults to `source`.
- `filename` (string, optional): Output archive filename. Defaults to `<basename(source)>.<format>`.
- `format` (`zip` | `tar`, default `zip`): Archive format.
- `overwrite` (boolean, default `false`): Whether to replace an existing archive file at the output path.

## Notes

- The generator includes files from nested subdirectories under `source`.
- The archive file is created after file discovery. If the source directory already contains an older archive file and `overwrite` is enabled, that file is treated like any other source file on the next run.
- Existing archive files are preserved by default. Use `--overwrite` when the archive should be regenerated at the same output path.

## Examples

```bash
# Create tmp/archive-source/archive-source.zip
pnpm nx g node-plugin:file-archive tmp/archive-source

# Write a tar archive to a different directory
pnpm nx g node-plugin:file-archive tmp/archive-source dist/archives --filename report.tar --format tar

# Keep the default destination but override the output name
pnpm nx g node-plugin:file-archive dist/assets --filename assets-bundle.zip

# Replace an existing archive file
pnpm nx g node-plugin:file-archive tmp/archive-source dist/archives --filename report.zip --overwrite
```
