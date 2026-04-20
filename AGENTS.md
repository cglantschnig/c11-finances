## General

Use Bun for package management and package runner commands in this repository. Prefer `bun`, `bun run`, `bun add`, `bun remove`, and `bunx`; do not use `pnpm`, `npm`, or `npx`.

Use kebab-case for project-authored filenames. Keep framework-required or generated filenames unchanged when a tool depends on a specific name, such as `AGENTS.md`, `CLAUDE.md`, `README.md`, `src/routes/__root.tsx`, or generated files.

## React Feature Structure

For React code, prefer a feature-based folder structure over organizing by file type at the app root.

- Organize by feature or domain first, such as `transactions`, `budgets`, or `auth`.
- Keep each feature self-contained where practical, colocating its components, hooks, validation, server calls, tests, and feature-specific utilities.
- Keep only genuinely cross-cutting code in shared locations such as `src/shared` or `src/lib`.
- Prefer a small public API for each feature, typically through an `index.ts` barrel, instead of deep imports into internal files.
- Avoid broad root-level buckets like `components/`, `hooks/`, or `utils/` unless the contents are truly shared across features.
- Colocate tests, schemas, and styles with the feature they belong to.
- Routes should primarily compose features, not become the main home for business logic.
- Keep dependency direction clear: app and routes may depend on features, and features may depend on shared code, but features should not casually depend on one another's internals.
- Do not extract code to shared preemptively; move it only after reuse is real and the abstraction is clearly generic.
- Do not force identical subfolders in every feature. Keep each feature folder only as large as its actual needs.

## Build Verification

When you need to verify changes, run `bun run lint` first and then `bun run build` from the repository root. Treat zero exit codes as the primary success signal.

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

After completing changes in `convex/`, ask the user before running `bunx convex dev` from the repo root.

If Convex reports `Could not find public function ...`, ask the user first, then run `bunx convex dev` from the repo root to regenerate and sync the function registry before debugging further.

Convex agent skills for common tasks can be installed by running `bunx convex ai-files install`.
<!-- convex-ai-end -->

<!-- intent-skills:start -->
# Skill mappings - when working in these areas, load the linked skill file into context.
skills:
  - task: "implementation in routes, layouts, links, and navigation"
    load: "node_modules/@tanstack/router-core/skills/router-core/SKILL.md"
  - task: "implementation for protected pages, sign-in flows, and redirect behavior"
    load: "node_modules/@tanstack/router-core/skills/router-core/auth-and-guards/SKILL.md"
  - task: "implementation for TanStack Start server functions and server-only logic"
    load: "node_modules/@tanstack/start-client-core/skills/start-core/server-functions/SKILL.md"
  - task: "asking questions about the project structure and TanStack Start setup"
    load: "node_modules/@tanstack/react-start/skills/react-start/SKILL.md"
  - task: "implementation and questions about environment variables for Clerk, Convex, and local setup"
    load: "node_modules/dotenv/skills/dotenv/SKILL.md"
<!-- intent-skills:end -->
