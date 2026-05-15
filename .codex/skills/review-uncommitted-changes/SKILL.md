---
name: review-uncommitted-changes
description: Perform a code review of local Git changes that have not been committed yet. Use when the user asks Codex to review uncommitted changes, unstaged changes, staged changes, local diffs, worktree changes, or "what I changed before I commit".
---

# Review Uncommitted Changes

## Goal

Review the current branch's uncommitted changes with a code-review stance. Prioritize bugs, regressions, missing tests, security risks, and maintainability issues that matter before commit.

## Workflow

1. Inspect the working tree:

   ```bash
   git status --short --untracked-files=all
   git diff --stat
   git diff --cached --stat
   git ls-files --others --exclude-standard
   ```

2. Read the actual changes:

   ```bash
   git diff --check
   git diff --cached --check
   git diff
   git diff --cached
   ```

   Treat staged, unstaged, and untracked changes as review input. If more than one exists, mention which categories were reviewed. Read untracked files directly because they are not included in `git diff`.

3. Build enough context to judge behavior:

   - Read nearby implementation files, tests, schemas, docs, and generated-output contracts touched by the diff.
   - Use `rg` to trace changed exported symbols, option names, config keys, routes, environment variables, and public APIs.
   - In Nx workspaces, use repo instructions and Nx project metadata to identify the narrowest relevant tests.

4. Look for review findings first:

   - Correctness bugs, edge cases, and behavior regressions.
   - Incomplete option, schema, docs, generator, or config surfaces.
   - Missing or weak tests for changed behavior.
   - Type-safety, error handling, security, accessibility, performance, and compatibility risks.
   - Generated code or generated config that no longer matches runtime behavior.

5. Verify when practical:

   - Run the narrowest relevant tests or checks for the touched area.
   - Prefer workspace task runners, such as `pnpm nx test <project>`, when the repo uses them.
   - If verification is skipped or blocked, state exactly why.

## Response Format

Lead with findings, ordered by severity. Use file and line references for each finding. Keep each finding specific and actionable.

Use this structure:

```markdown
**Findings**

- High: [file.ts](absolute/path/file.ts:12) - Explain the bug, why it matters, and when it appears.
- Medium: [file.spec.ts](absolute/path/file.spec.ts:34) - Explain the test or coverage gap.

**Open Questions**

- Note assumptions or unclear product intent, if any.

**Verification**

- `pnpm nx test project-name` passed.
- `git diff --check` passed.
```

If there are no findings, say so clearly and still mention verification and any residual risk.

## Constraints

- Do not modify files during the review unless the user explicitly asks for fixes.
- Do not review committed history unless the user asks for branch-to-branch review.
- Do not bury findings below a long summary.
- Do not report style nits unless they can cause real confusion, maintenance cost, or automated-check failures.
