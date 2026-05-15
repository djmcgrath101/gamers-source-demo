# Workspace Agent Instructions

## Workspace Acceleration

Use these repo-specific defaults to reduce exploration time and keep changes aligned with the existing workspace structure.

### Repo Shape

- `apps/` contains deployable applications.
- `libs/` contains reusable product code and shared libraries.
- `tools/` contains internal Nx plugins, generators, utilities, and supporting libraries used to manage the workspace itself.
- Treat `tools/` as the primary location for workspace automation changes; do not assume plugin logic lives under `libs/`.

### Where To Look First

- For Nx generator or executor behavior, start in `tools/*/plugin/src/lib/**`.
- For generator option types, start with `schema.ts` in the generator directory.
- For generator runtime logic, start with `generator.ts`.
- For generator docs/examples, check the generator-local `README.md`.
- For generator tests, check `generator.spec.ts` in the same directory before searching more broadly.
- For shared workspace path/project helpers, check `tools/nx/utils/src/lib/**`.
- For cross-project naming, directory, and tagging behavior, inspect `tools/nx/utils` before introducing new helper logic.

### Generator Change Map

When changing an Nx generator in this repo, assume the minimum related surfaces are:

1. `generator.ts` for runtime behavior
2. `schema.ts` for TypeScript option contracts
3. `schema.json` if the generator exposes CLI options
4. `generator.spec.ts` for unit coverage
5. generator-local `README.md` for usage/examples
6. any shared helper in `tools/nx/utils` if the generator depends on centralized naming/path logic

Do not update only the runtime path if the option shape or generated output contract changes.

### Common Local Conventions

- Generator wrappers may pass through to upstream Angular/Nx schematics and strip custom options before delegation; preserve that pattern when adding repo-specific flags.
- Prefer centralizing project path and naming rules in shared `tools/nx/utils` helpers instead of duplicating logic inside generators.
- Default to minimal diffs in plugin code; extend existing helper functions before adding parallel variants unless behavior genuinely diverges.
- Placeholder docs may exist in generator-local `README.md`; if behavior changes, replace placeholders with concrete repo examples instead of adding more generic text.
- For generator file output, ALWAYS prefer template files (for example `files/*__tmpl__` with `generateFiles`) instead of writing generated content directly with Nx `tree.write` unless no template-based approach is viable.

### Fast Verification Defaults

- For changes under `tools/angular/plugin`, start with `pnpm nx test angular-plugin`.
- For changes under `tools/nx/utils`, start with `pnpm nx test nx-utils`.
- If a generator under `tools/angular/plugin` depends on shared utils, run both `pnpm nx test angular-plugin` and `pnpm nx test nx-utils`.
- Use the narrowest concrete `pnpm nx test <project>` target that covers the changed code before broader workspace validation.
- Use `rg -n` to trace option names across `generator.ts`, `schema.ts`, `schema.json`, specs, and docs before finalizing.

### Known Search Heuristics

- If you need project naming or directory behavior, search for `determineProject`, `normalizeProject`, `stripProjectType`, or `appendProjectType`.
- If you need generator customization points, search for `normalizeOpts`, `generateTemplateFiles`, and `wrapAngularDevkitSchematic`.
- If you need generated file conventions, inspect the generator's local `files/` directory before changing runtime logic.

### Decision Defaults

- Prefer preserving current generator CLI behavior over "cleaning up" option shapes unless the task explicitly changes the contract.
- Prefer updating shared utilities when multiple generators would benefit from the same rule.
- Prefer explicit tests for each naming/path edge case rather than broad snapshot coverage.
- Prefer repo-consistent naming/path rules over upstream defaults when the workspace already has a wrapper or helper enforcing them.

## Code Commenting Requirements

- Include comments in generated code by default and in modified code when intent, constraints, or behavior would not be obvious from the implementation alone.
- Add a brief doc comment for new or materially updated exported functions, classes, interfaces, types, and constants when the public contract would benefit from clarification.
- Add inline comments for non-obvious logic, conditional branches, data transformations, and edge-case handling when the reason for the code is not self-evident.
- Keep comments concise and high-signal; explain intent and constraints, not trivial syntax or restatements of the code.
- For extremely small changes, add an intent-level comment only when the reason for the change would otherwise be unclear in review.

## Engineering Guardrails

### Command Working Directory Rule

- Prefer running commands from the workspace root with root-relative paths instead of changing directories.
- If a command must run from a subdirectory, wrap it so the command returns to the workspace root before it exits. In PowerShell, use `Push-Location <subdir>; try { <command> } finally { Pop-Location }`.
- After any command that changes directories, immediately verify the location with `Get-Location` and ensure it is the workspace root before continuing.
- Before ending a task, the agent must be back at the workspace root.

- Keep scope tight: do not refactor unrelated code or files unless explicitly requested.
- Keep diffs minimal and focused on the requested outcome.
- Preserve existing public behavior unless the request explicitly asks for a behavior change.
- Do not change exported APIs/signatures without updating dependents and tests in the same change.
- Prefer explicit return types on exported TypeScript functions.
- Do not introduce `any` unless required; if used, document why with an inline comment.
- Do not swallow errors; either rethrow or return structured failures with actionable context.
- Run relevant Nx tests after code changes (`pnpm nx test <project>` at minimum).
- Add or update tests for new logic branches, edge cases, or bug fixes.
- Use `pnpm nx ...` commands rather than invoking underlying tooling directly.

## Dependency Reuse Policy

- Prefer a well-supported third-party npm package over custom implementation when it reduces risk, maintenance cost, or complexity.
- Prefer adding dependencies in projects that already enforce the Nx `dependency-checks` ESLint rule; if a project does not, follow existing workspace package ownership patterns and keep the addition narrowly justified.
- Before adding a new dependency, verify:
  - Active maintenance (recent releases, responsive issue triage).
  - Meaningful adoption (downloads, ecosystem usage).
  - Security posture (no known high/critical vulnerabilities; acceptable transitive risk).
  - License compatibility with this repository.
  - TypeScript support (built-in types or maintained `@types` package).
  - Bundle/runtime impact is acceptable for the target project.
- Prefer existing workspace dependencies first to avoid duplicate packages.
- Avoid adding a dependency for trivial logic that is clearer and safer to implement locally.
- Prefer widely adopted, stable packages over niche or unmaintained alternatives.
- Pin versions according to repo policy and document why the dependency was chosen.
- When introducing a new dependency, add or update tests to cover integration behavior and failure modes.

## TypeScript File Ordering

- When creating or substantially reorganizing a `.ts` file, organize it into two declaration groups in this order:
  1. Type declarations (`type`, `interface`)
  2. Runtime implementation (`const`, `function`, `class`, runtime exports)
- Prefer not to interleave type declarations with runtime implementation unless keeping related symbols adjacent is clearer.
- Within each declaration group, prefer alphabetical ordering by identifier name (case-insensitive) when it does not reduce readability.
- Do not manually sort imports; import ordering is managed by Prettier.
- When any `.ts` file is modified, normalize the touched area or whole file when practical, but avoid unrelated reorder-only diffs unless you are already restructuring the file.
- If strict alphabetical ordering harms readability for tightly coupled symbols, keep them adjacent and add a short comment explaining the exception.

## Change Consistency Rules (Required)

When removing or hard-coding any option/flag/setting, you must update all related surfaces in the same change:

1. Runtime implementation
2. Type definitions (`schema.ts` / interfaces)
3. JSON schema (`schema.json`)
4. Generators that write config
5. Tests (unit/integration)
6. Docs (README/examples)

Do not leave redundant config in generated targets if runtime ignores or overrides it.

Before finalizing, run:

- `rg -n "<optionName>" <relevant paths>`
- relevant Nx tests (`pnpm nx test <project>`)

In the final response, explicitly list which surfaces were changed.

## Unit Test Conventions

- Use `Jest` for unit tests, with files named `*.spec.ts`.
- Co-locate unit tests beside the implementation file.
- Name the top-level `describe` block after the single exported unit under test.
- If a spec intentionally covers multiple exports from the same source file, name the top-level `describe` block after the source file or module name instead.
- Structure specs with a top-level `describe` for the unit under test and nested `describe` blocks for methods or behavior areas.
- Write `it(...)` names as behavior statements, usually present tense, describing the outcome rather than implementation details. Examples: "returns null if package.json does not exist", "throws when the package.json file does not exist", "detects Android".
- Prefer direct assertions over snapshots.
- Reset or restore mocks explicitly in hooks when using spies or module mocks.
- For Nx generators and workspace utilities, use `createTreeWithEmptyWorkspace()` and assert against the in-memory `Tree`, generated files, and project configuration rather than mocking everything.
- Cover both happy paths and failure or edge cases.
- Prefer small local test helpers when setup is repetitive.
- Assume a unit has no tests if there is no adjacent `*.spec.ts` file.

### Shared Test Utilities And Mocks

- Do not create an ad hoc mock if an equivalent shared mock already exists.
- Files that export reusable mock helper functions should use the `.mock.ts` filename suffix.
- Functions that create, provide, or return mocks should be named to make that behavior explicit, using prefixes such as `create`, `provide`, `get`, or `mock`.
- Prefer functions over classes when creating reusable mocks, unless a class is required to model the API cleanly.
- Before creating mocks, stubs, or test data in a spec, check for an existing reusable export in the workspace's `type:testing` libraries and use it when available.
- Prefer importing shared mocks, test-data builders, and test helpers from testing libraries over redefining them locally in each test suite.
- Create new local mocks only when no suitable shared testing utility exists or when the test needs a case-specific override.
- If a mock or test helper is likely to be reused outside a single spec file, promote it into the appropriate `type:testing` library instead of duplicating it across suites.
- When extending a shared mock for a specific test, compose on top of the shared utility rather than rewriting the full mock from scratch.

### Angular Unit Tests

- Use `@ngneat/spectator/jest` by default for Angular unit tests. Only use raw Angular testing APIs when Spectator cannot support the case.
- Prefer Spectator factories such as `createComponentFactory`, `createRoutingFactory`, and `createServiceFactory` over configuring `TestBed` manually.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
