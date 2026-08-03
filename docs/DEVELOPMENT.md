# Development guide

## Prerequisites

- Node.js (LTS)
- [pnpm](https://pnpm.io/) — **required** (do not use npm/yarn for installs)

## Setup

```bash
pnpm install
```

`pnpm install` runs the `prepare` script and registers [Husky](https://typicode.github.io/husky/) git hooks.

## Scripts

| Script              | Purpose                             |
| ------------------- | ----------------------------------- |
| `pnpm dev`          | Next.js dev server (`0.0.0.0:3000`) |
| `pnpm build`        | Production build                    |
| `pnpm lint`         | ESLint (flat config + Next.js)      |
| `pnpm format`       | Prettier write entire repo          |
| `pnpm format:check` | Prettier check (CI-friendly)        |

## Git hooks (Husky)

- **pre-commit:** [lint-staged](https://github.com/lint-staged/lint-staged) runs on staged files only:
  - `*.{js,jsx,ts,tsx,mjs}` → `eslint --fix`, then `prettier --write`
  - `*.{json,md,css,yml,yaml}` → `prettier --write`
- There is **no pre-push build** hook (Next build is too slow for every push). Run `pnpm build` before opening a PR when you change routing or build-sensitive code.

## Workflow

Issue → branch `{type}/{issue#}-slug` → PR to `develop`. See [CONTRIBUTING.md](../CONTRIBUTING.md).

## Cursor / AI rules

Project rules live in `.cursor/rules/` (App Router structure, Gateway data layer, git/pnpm/Husky). They complement [AGENTS.md](../AGENTS.md), not replace it.
