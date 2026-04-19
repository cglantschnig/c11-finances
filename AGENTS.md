## General

Use Bun for package management and package runner commands in this repository. Prefer `bun`, `bun run`, `bun add`, `bun remove`, and `bunx`; do not use `pnpm`, `npm`, or `npx`.

Use kebab-case for project-authored filenames. Keep framework-required or generated filenames unchanged when a tool depends on a specific name, such as `AGENTS.md`, `CLAUDE.md`, `README.md`, `src/routes/__root.tsx`, or generated files.

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
