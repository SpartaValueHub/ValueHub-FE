# Development guide

## Prerequisites

- Node.js (LTS)
- [pnpm](https://pnpm.io/) — **required** (do not use npm/yarn for installs)

## Setup

```bash
pnpm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
```

### Environment (노트북 Gateway)

| 변수                       | 용도                                                                  |
| -------------------------- | --------------------------------------------------------------------- |
| `API_URL`                  | 서버 → Gateway auth (`http://localhost:8000/auth-service`)            |
| `CHAT_API_URL`             | 서버 → Gateway chat REST. 브라우저 STOMP URL은 `GET /api/chat/stomp`  |
| `NEXT_PUBLIC_CHAT_API_URL` | (레거시) 사용하지 않음. STOMP는 서버 `CHAT_API_URL` → ws + `/ws-chat` |
| `AUTH_TRUST_HOST`          | `true` — localhost / `192.168.10.45` 양쪽 로그인                      |
| `AUTH_SECRET`              | NextAuth 시크릿 (32자 이상)                                           |

Gateway CORS는 `localhost:3000`, `127.0.0.1:3000`, `192.168.10.45:3000` 허용.

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
- **pre-push:** `pnpm lint` → `pnpm build` (전체 ESLint + 타입·production build). 실패 시 push 중단. 급할 때만 `git push --no-verify` (팀 남용 금지).

## Workflow

Issue → branch `{type}/{issue#}-slug` → PR to `develop`. See [CONTRIBUTING.md](../CONTRIBUTING.md).

## Cursor / AI rules

Project rules live in `.cursor/rules/` (App Router structure, Gateway data layer, git/pnpm/Husky). They complement [AGENTS.md](../AGENTS.md), not replace it.

See also [fe-team-onboarding.md](./fe-team-onboarding.md) (팀 온보딩 · Notion용), [project-overview.md](./project-overview.md) (현재 구현 상태), [frontend-priority-and-ui-backlog.md](./frontend-priority-and-ui-backlog.md) (작업 우선순위), and [cursor-team-guide.md](./cursor-team-guide.md) (Cursor로 UI 작업 — BE 개발자용).
