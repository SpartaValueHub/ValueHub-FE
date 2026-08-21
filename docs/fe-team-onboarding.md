# ValueHub-FO · FE 팀 온보딩

> Notion에 그대로 붙여넣거나 `/import`로 가져올 수 있는 팀 위키용 문서입니다.  
> 갱신: 2026-08-19 · 저장소: `ValueHub-FE`

---

## 📌 한 줄 소개

**ValueHub 마켓플레이스 B2C 프론트엔드** — Next.js 16 App Router + Gateway MSA(auth / member) 연동.

---

## 🔗 빠른 링크

| 구분              | 링크                                                           |
| ----------------- | -------------------------------------------------------------- |
| GitHub            | (팀 저장소 URL)                                                |
| PR 대상 브랜치    | `develop`                                                      |
| 운영 배포 브랜치  | `main` (Vercel Production)                                     |
| 로컬 FE           | http://localhost:3000                                          |
| Gateway (팀 공용) | (EC2 Gateway URL — 팀 노션 참고)                               |
| Vercel · 배포     | [vercel-deploy-team-notice.md](./vercel-deploy-team-notice.md) |

> **브랜치 요약:** `develop`에서 작업·localhost 테스트 → 통과 후 `develop` → `main` merge → Vercel Production 갱신. `develop` merge만으로는 운영 URL이 바뀌지 않음.

---

## ✅ Day 1 온보딩 체크리스트

- [ ] GitHub 저장소 Clone + `pnpm install` (npm/yarn 사용 금지)
- [ ] `.env.example` → `.env.local` 복사 후 팀 공유 env 값 입력
- [ ] `pnpm dev` → http://localhost:3000 메인 확인
- [ ] `/signin`, `/signup` 화면 확인
- [ ] [CONTRIBUTING.md](../CONTRIBUTING.md) — Issue → 브랜치 → PR 흐름 숙지
- [ ] [AGENTS.md](../AGENTS.md) 또는 `.cursor/rules/` — **3-Layer·클라이언트 fetch 금지** 읽기
- [ ] pre-commit 동작 확인 (staged 파일 lint — 테스트 커밋 1회)
- [ ] pre-push 동작 확인 (`pnpm lint` → `pnpm build` — 테스트 push 1회)
- [ ] Cursor UI 작업 시 [cursor-team-guide.md](./cursor-team-guide.md) 훑기
- [ ] 팀 Slack/Discord FE 채널 합류

---

## 🛠 기술 스택

| 영역      | 선택                                                                         |
| --------- | ---------------------------------------------------------------------------- |
| Framework | Next.js 16 App Router, React 19                                              |
| Language  | TypeScript (`strict`)                                                        |
| Style     | Tailwind CSS v4, shadcn/ui (Base UI)                                         |
| Form      | react-hook-form + Zod 4                                                      |
| Auth      | **NextAuth v4** (Credentials) + HttpOnly JWT 쿠키                            |
| Package   | **pnpm** only                                                                |
| Quality   | ESLint, Prettier, Husky (pre-commit + pre-push), Vitest, GitHub Actions (CI) |

> ⚠️ **NextAuth v5?** 지금 마이그레이션 **하지 않음**. v4 + Gateway 커스텀 쿠키 연동이 이미 완성되어 있음.

---

## 🏗 아키텍처 — 꼭 알아둘 것

### 3-Layer (단방향)

```
UI (Page / Client Component)
  → actions/*Action          Server Action, zod 검증
  → services/*Service        Api* → Ui* 매핑
  → lib/api/*                apiFetch (HTTP는 여기만!)
  → API_URL (Gateway)
```

### 절대 규칙

| ✅ 해도 됨                                      | ❌ 하면 안 됨                                 |
| ----------------------------------------------- | --------------------------------------------- |
| RSC Page에서 `*Service`로 **읽기**              | 클라이언트에서 `lib/api/`, `services/` import |
| 클라이언트에서 **Server Action** 호출           | 클라이언트에서 `fetch(API_URL)` 직접 호출     |
| 클라이언트에서 **BFF** (`/api/terms/active` 등) | Gateway URL을 `NEXT_PUBLIC_*`로 노출 (prod)   |
| 쓰기(mutation)는 **Action** 경유                | Action에서 `apiFetch` 직접 호출               |

### 컴포넌트 — 아토믹 디자인

```
templates → organisms → molecules → atoms
```

- Page는 **Template**만 import (Organism 직접 import 지양)
- `"use client"`는 **organism** 상호작용 경계에만
- 데이터 조회는 **RSC Page** → props로 Template에 전달

---

## 📁 폴더 구조 (요약)

```
app/              라우트, 레이아웃, API Route (BFF)
actions/          Server Actions
services/         오케스트레이션
lib/api/          apiFetch — 유일한 HTTP 레이어
lib/auth/         NextAuth, 쿠키, 에러 매핑
components/       atoms → molecules → organisms → templates
hooks/            클라이언트 hooks (auth/, terms/)
types/<domain>/   api.ts (BE DTO), ui.ts (UI 모델), zod
provider/         SessionContextProvider 등
```

상세: [project-overview.md](./project-overview.md)

---

## 📄 페이지 & API — 구현 현황

### 구현됨

| 경로                  | 설명                                           |
| --------------------- | ---------------------------------------------- |
| `/`                   | 메인 (검색·카테고리 UI — **BE 미연동**)        |
| `/signin`             | 로그인 (Credentials + reCAPTCHA)               |
| `/signup`             | 회원가입 4단계 (본인인증 → 약관 → 정보 → 완료) |
| `/signup?mode=resume` | 가입 이어하기                                  |
| `/api/auth/*`         | NextAuth, status, logout                       |
| `/api/terms/active`   | 활성 약관 BFF                                  |

### 미구현 (계획 — rules·문서에 유지)

| 항목                         | 비고                          |
| ---------------------------- | ----------------------------- |
| `/feeds`                     | 게시글                        |
| `/chat`                      | 채팅 + SSE                    |
| `/api/chat/rooms`            | 채팅 BFF                      |
| `lib/chat/`                  | SSE 유틸                      |
| `middleware.ts` / `proxy.ts` | 라우트 보호 (스켈레톤만 존재) |
| Footer                       | `return null`                 |
| 소셜 로그인                  | UI만 (disabled)               |

작업 우선순위: [frontend-priority-and-ui-backlog.md](./frontend-priority-and-ui-backlog.md)

---

## 💻 로컬 개발 셋업

### 1. 설치

```bash
pnpm install
cp .env.example .env.local
```

### 2. 필수 env (`.env.local`)

| 변수                              | 용도                             |
| --------------------------------- | -------------------------------- |
| `API_URL`                         | Gateway auth-service (서버 전용) |
| `MEMBER_API_URL`                  | Gateway member-service           |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | NextAuth (32자+)                 |
| `AUTH_TRUST_HOST`                 | `true` — LAN IP 로그인           |
| `AUTH_TRUSTED_ORIGIN`             | `http://localhost:3000`          |
| `NEXT_PUBLIC_PORTONE_*`           | 본인인증 (회원가입 테스트 시)    |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`  | 로그인 reCAPTCHA                 |

> Gateway·PortOne Secret은 **팀 노션 / BE 담당**에게 받기. `.env.local`은 커밋 금지.

### 3. 실행

```bash
pnpm dev      # http://0.0.0.0:3000
pnpm lint
pnpm test
pnpm build
```

상세 스크립트·env: [DEVELOPMENT.md](./DEVELOPMENT.md)

---

## 🔀 Git · PR · Husky

1. **GitHub Issue** 생성
2. 브랜치: `{type}/{issue#}-slug` (예: `feat/42-signup-field`)
3. 커밋: `feat:`, `fix:`, `docs:` … + **한국어** ([CONTRIBUTING.md](../CONTRIBUTING.md))
4. PR → **`develop`**
5. **pre-commit:** staged 파일 ESLint(`--fix`) + Prettier — 실패 시 커밋 차단
6. **pre-push:** `pnpm lint` → `pnpm build` — 실패 시 push 차단 (급할 때만 `git push --no-verify`, 남용 금지)

---

## 🔁 주요 기능 플로우

### 로그인

```
SigninForm → NextAuth signIn("credentials")
  → lib/auth authorize → Gateway POST sign-in
  → HttpOnly JWT 쿠키 + SessionContext (nickname만 클라이언트 노출)
```

### 회원가입

```
Step1 PortOne 본인인증 → confirmIdentityVerificationAction → requestToken
Step2 약관 동의 (GET /api/terms/active)
Step3 아이디·이메일·닉네임 중복확인 + Daum 주소
Step4 signupAction → auth-service + member-service
```

### 본인인증 CI 오류 (자주 묻는 질문)

- 카카오 인증 후 **「CI를 확인할 수 없다」** → PortOne/이니시스 **카카오 CI 별도 계약** 필요
- 당장 테스트: PortOne 팝업에서 **PASS** 등 다른 수단 사용
- 상세: [troubleshooting.md](./troubleshooting.md) PortOne 섹션

---

## 🐛 자주 터지는 이슈 (Quick Fix)

| 증상                          | 먼저 볼 것                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------ |
| sign-up / confirm **403**     | Gateway public path, JWT 재기동                                                |
| confirm **400 / CI**          | PortOne 채널·카카오 CI 계약                                                    |
| `pnpm install` EPERM          | npm 혼용 금지, node 프로세스 종료 후 재설치                                    |
| LAN IP 로그인 실패            | `AUTH_TRUST_HOST=true`, `pnpm dev` (`0.0.0.0:3000`)                            |
| 클라이언트에서 API 호출 에러  | `lib/api`는 **서버 전용** — Action/BFF 사용                                    |
| Husky push 실패               | `pnpm lint` / `pnpm build` 로그 확인                                           |
| `.husky/pre-push` IDE 빨간 줄 | Dockerfile로 오인 — 실제 실행은 shell. [DEVELOPMENT.md](./DEVELOPMENT.md) 참고 |

---

## 📚 읽을 문서 (우선순위)

| 순서 | 문서                                                                         | 내용                          |
| ---- | ---------------------------------------------------------------------------- | ----------------------------- |
| 1    | [DEVELOPMENT.md](./DEVELOPMENT.md)                                           | 로컬 셋업·스크립트·Husky      |
| 2    | [AGENTS.md](../AGENTS.md)                                                    | 데이터 레이어 Hard rules      |
| 3    | [project-overview.md](./project-overview.md)                                 | 구현 기능·UI·API 맵           |
| 4    | [frontend-priority-and-ui-backlog.md](./frontend-priority-and-ui-backlog.md) | 작업 우선순위·백로그          |
| 5    | [cursor-team-guide.md](./cursor-team-guide.md)                               | Cursor UI 작업 (BE 개발자용)  |
| 6    | [auth-cookie-flow.md](./auth-cookie-flow.md)                                 | HttpOnly 쿠키 흐름            |
| 7    | [troubleshooting.md](./troubleshooting.md)                                   | Auth·본인인증 이슈            |
| 8    | [vercel-deploy-team-notice.md](./vercel-deploy-team-notice.md)               | 배포·브랜치·로그              |
| 9    | `.cursor/rules/architecture-flow.mdc`                                        | 아키텍처·아토믹 (AI/IDE 규칙) |

---

## 🆕 새 기능 추가 시 체크리스트

- [ ] `types/<domain>/api.ts` + `ui.ts` (+ zod)
- [ ] `lib/api/endpoints.ts` path 추가
- [ ] `lib/api/<domain>.ts` — apiFetch
- [ ] `services/<domain>.service.ts`
- [ ] `actions/<domain>.ts`
- [ ] RSC Page → Template → Organism (SSR 우선)
- [ ] 클라이언트는 Action 또는 BFF만
- [ ] Issue + 브랜치 + PR to `develop`

---

## 👥 팀 역할 · 문의

| 역할               | 담당 | 문의 |
| ------------------ | ---- | ---- |
| FE                 |      |      |
| Gateway / BE       |      |      |
| PortOne / 본인인증 |      |      |
| Vercel / 배포      |      |      |

---

## 📝 변경 이력

| 날짜       | 내용                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------- |
| 2026-08-19 | pre-push(lint+build), cursor-team-guide, backlog 반영. 삭제된 stack-and-structure-review 링크 제거 |
| 2026-08-19 | FE 온보딩 문서 초안                                                                                |
