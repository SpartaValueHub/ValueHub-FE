# ValueHub-FO 프로젝트 개요

> ValueHub 프론트엔드(Next.js) 현재 구현 상태를 구조화한 문서입니다.  
> 최종 갱신 기준: 코드베이스 스냅샷 (2026-08-19)

---

## 1. 프로젝트 요약

| 항목              | 내용                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| **프로젝트명**    | valuehub-fo                                                                 |
| **역할**          | ValueHub 마켓플레이스 프론트엔드 (B2C)                                      |
| **스택**          | Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui |
| **인증**          | NextAuth v4 (Credentials) + HttpOnly JWT 쿠키 (Gateway 연동)                |
| **패키지 매니저** | pnpm                                                                        |
| **백엔드 연동**   | API Gateway (`API_URL` → auth-service / member-service)                     |

---

## 2. 디렉터리 구조

```
ValueHub-FE/
├── app/                    # Next.js App Router (라우트·레이아웃·API Route)
│   ├── (header)/           # Header 포함 레이아웃
│   │   └── page.tsx        # 메인 홈 (/)
│   ├── (none-header)/      # Header 없는 레이아웃
│   │   ├── signin/         # 로그인 (/signin)
│   │   └── signup/         # 회원가입 (/signup)
│   ├── api/                # BFF / NextAuth / 캐시 무효화
│   ├── layout.tsx          # 루트 레이아웃 (세션·Footer)
│   └── globals.css         # Tailwind v4 + ValueHub 디자인 토큰
│
├── components/             # 아토믹 디자인 UI
│   ├── atoms/              # 최소 UI 단위 (button, spinner, typography)
│   ├── molecules/          # atom 조합 (폼 필드, 로고, 모달 등)
│   ├── organisms/          # 기능 블록 (폼, 검색바, 카테고리 nav)
│   └── templates/          # 페이지 골격 (Main, Signin, Signup, Header)
│
├── actions/                # Server Actions (검증·인증·ActionResult)
├── services/               # 오케스트레이션 (Api* → Ui* 매핑)
├── lib/
│   ├── api/                # HTTP 레이어 (apiFetch, endpoints) — 서버 전용
│   └── auth/               # NextAuth 설정, 쿠키, 에러 매핑
│
├── hooks/                  # 클라이언트 전용 hooks
├── context/                # SessionContext (클라이언트 세션)
├── provider/               # AuthSessionProvider, SessionContextProvider
├── types/                  # 도메인별 api.ts / ui.ts / zod 스키마
├── constants/              # 정적 상수 (메인 페이지 카테고리 등)
├── docs/                   # 개발·트러블�ooting 문서
├── proxy.ts                # 라우트 보호 스켈레톤 (matcher 비어 있음)
└── .cursor/rules/          # AI·개발 컨벤션 규칙
```

### 데이터 플로우 (3-Layer)

```
UI (RSC / 클라이언트)
  → actions/*Action        ("use server", zod, ActionResult)
  → services/*Service      (오케스트레이션, Api → Ui 매핑)
  → lib/api/*              (apiFetch — 유일한 HTTP 레이어)
  → API_URL (Gateway)
```

- **RSC Page**: 읽기는 `*Service` 직접 호출 가능
- **클라이언트 컴포넌트**: `services/`·`lib/api/` import 금지 → Server Action 또는 BFF Route 사용
- **컴포넌트 계층**: atoms → molecules → organisms → templates (하위 → 상위 import만)

---

## 3. 라우팅 & 레이아웃

### 페이지 라우트

| 경로                            | 레이아웃            | 설명             | BE 연동                  |
| ------------------------------- | ------------------- | ---------------- | ------------------------ |
| `/`                             | `(header)` + Header | 메인 홈          | ❌ (UI 목업)             |
| `/signin`                       | `(none-header)`     | 로그인           | ✅ auth-service          |
| `/signup`                       | `(none-header)`     | 회원가입 (4단계) | ✅ auth + member + terms |
| `/signup?mode=resume&logInId=…` | `(none-header)`     | 가입 이어하기    | ✅ resume API            |

### API Route (BFF)

| 경로                      | 메서드 | 역할                                    |
| ------------------------- | ------ | --------------------------------------- |
| `/api/auth/[...nextauth]` | *      | NextAuth 핸들러                         |
| `/api/auth/status`        | GET    | 클라이언트용 세션 요약 (`nickname`만)   |
| `/api/auth/logout`        | POST   | 로그아웃 (Gateway + 세션 정리)          |
| `/api/terms/active`       | GET    | 활성 약관 목록 (클라이언트 fetch용 BFF) |
| `/api/revalidate/terms`   | POST   | 약관 Data Cache 무효화 (Bearer secret)  |

### 레이아웃 구조

```
app/layout.tsx (루트)
├── AuthSessionProvider
├── SessionContextProvider (initialSession from getAuthUser)
├── {children}
└── Footer (현재 null — 미구현)

app/(header)/layout.tsx
├── Header (로그인/회원가입 or 닉네임/로그아웃)
└── {children}

app/(none-header)/layout.tsx
└── {children}  (인증 페이지 — Header 없음)
```

### 라우트 보호

- `proxy.ts`: NextAuth JWT 기반 보호 스켈레톤 존재
- **현재 `matcher`가 비어 있어** 실질적인 보호 라우트 없음 (향후 `/chat/*` 등 확장 예정)

---

## 4. 구현된 기능

### 4.1 인증 (Auth)

| 기능                        | 상태    | 구현 위치                                                   |
| --------------------------- | ------- | ----------------------------------------------------------- |
| Credentials 로그인          | ✅      | `SigninForm` → NextAuth `signIn` → `lib/api/auth.authorize` |
| 로그아웃                    | ✅      | `SessionContext.logout` → `/api/auth/logout`                |
| 세션 (서버)                 | ✅      | `lib/session.ts`, `getAuthUser()`                           |
| 세션 (클라이언트)           | ✅      | `SessionContext` — `{ nickname }`만 노출                    |
| 로그인 5회 실패 reCAPTCHA   | ✅      | `useSigninCaptcha`, `RecaptchaWidget`                       |
| 가입 미완료 → 이어하기 유도 | ✅      | `useSigninFlow` → `/signup?mode=resume`                     |
| 소셜 로그인 (Google/Kakao)  | 🔲 UI만 | `SocialLoginGroup` — 버튼 disabled                          |
| LAN IP 로그인               | ✅      | `AUTH_TRUST_HOST=true`, dev `--hostname 0.0.0.0`            |

### 4.2 회원가입 (Signup)

4단계 마법사 형태:

| 단계                 | 내용                                  | 연동                                                        |
| -------------------- | ------------------------------------- | ----------------------------------------------------------- |
| **1. 본인인증**      | PortOne SDK 팝업 → 서버 confirm       | `@portone/browser-sdk`, `confirmIdentityVerificationAction` |
| **2. 약관 동의**     | 필수(서비스·개인정보) + 선택(마케팅)  | `GET /api/terms/active` (BFF)                               |
| **3. 회원정보 입력** | 아이디·이메일·비밀번호·닉네임·주소 등 | auth-service + member-service                               |
| **4. 가입 완료**     | 완료 화면 + 자동 로그인 시도          | `signupAction` → auto login                                 |

**부가 기능**

| 기능                          | 상태                                           |
| ----------------------------- | ---------------------------------------------- |
| 아이디 중복 확인              | ✅ `checkLoginIdAvailabilityAction`            |
| 이메일 중복 확인              | ✅ `checkEmailAvailabilityAction`              |
| 닉네임 중복 확인              | ✅ `checkNicknameAvailabilityAction`           |
| Daum 우편번호 주소 검색       | ✅ `AddressSearchField`                        |
| 가입 partial success / resume | ✅ `signup?mode=resume`, `resumeSignupService` |
| 가입 시 reCAPTCHA (resume)    | ✅ `useSignupCaptcha`                          |
| 회원 프로필 생성              | ✅ `createMemberService` → member-service      |

### 4.3 메인 홈

| 기능                  | 상태    | 비고                                              |
| --------------------- | ------- | ------------------------------------------------- |
| 브랜드 로고 + 슬로건  | ✅ UI   | `BrandMark`, "신뢰가 거래의 기준입니다."          |
| 검색바                | ✅ UI만 | 카테고리 드롭다운 + 검색 input, submit 무반응     |
| 카테고리 네비게이션   | ✅ UI만 | All / Luxury / Collectibles / Premium / Electrics |
| 광고 배너 placeholder | ✅ UI   | 회색 박스 "광고배너"                              |

### 4.4 약관 (Terms)

| 기능                    | 상태                                             |
| ----------------------- | ------------------------------------------------ |
| 활성 약관 조회          | ✅ member-service `GET /api/v1/terms/active`     |
| 클라이언트 캐시 (30분)  | ✅ `useActiveTerms` in-memory cache              |
| 약관 상세 모달          | ✅ `TermDetailModal`                             |
| Data Cache + revalidate | ✅ `revalidateTag`, `POST /api/revalidate/terms` |

### 4.5 미구현 / 문서만 존재

아래는 `.cursor/rules/architecture-flow.mdc` 등에 언급되나 **현재 코드베이스에 없음**:

- 채팅 (`/chat`, SSE, ChatRoomList 등)
- 게시글/피드 (`/feeds`, PostList 등)
- Footer 콘텐츠
- 상품 검색·목록·상세
- middleware.ts (대신 `proxy.ts` 스켈레톤)

---

## 5. UI 구현 현황

### 5.1 페이지별 UI

#### `/` — 메인 (MainTemplate)

```
BrandMark (로고 + 슬로건)
  ↓
MainSearchBar (카테고리 + 검색 — BE 미연동)
  ↓
MainCategoryNav (2행 카테고리 그리드 — BE 미연동)
  ↓
광고 배너 placeholder
```

- **테마**: dark mode 고정 (`html.dark`), `bg-vh-surface-charcoal`
- **Header**: 우측 상단 회원가입 / 로그인 (비로그인) 또는 닉네임 / 로그아웃 (로그인)

#### `/signin` — 로그인 (SigninTemplate)

```
SigninAuthHeader
  ↓
SigninForm
  ├── SigninInputField × 2 (아이디, 비밀번호)
  ├── RecaptchaWidget (조건부)
  ├── AuthHelperLinks (회원가입 링크 등)
  ├── AuthDivider ("또는")
  ├── SocialLoginGroup (Google/Kakao — disabled)
  └── ConfirmModal (가입 미완료 안내 → resume 이동)
```

#### `/signup` — 회원가입 (SignupTemplate)

```
SignupAuthHeader (resumeMode 분기)
  ↓
SignupForm (4단계)
  ├── SignupStepIndicator
  ├── Step 1: SignupIllustration + 본인인증 (PortOne)
  ├── Step 2: TermsAgreementSection (체크박스 + TermDetailModal)
  ├── Step 3: SignupFieldWithAction, AddressSearchField, GenderToggle 등
  └── Step 4: SignupIllustration (complete) + 메인 이동
```

### 5.2 컴포넌트 인벤토리 (아토믹 디자인)

#### atoms (3)

| 파일             | 역할                              |
| ---------------- | --------------------------------- |
| `button.tsx`     | shadcn Button (variant: brand 등) |
| `spinner.tsx`    | 로딩 스피너                       |
| `typography.tsx` | 타이포그래피 유틸                 |

#### molecules (18)

| 파일                                        | 역할                                       |
| ------------------------------------------- | ------------------------------------------ |
| `AddressSearchField`                        | Daum 우편번호 embed + 법정동 주소 조합     |
| `AuthDivider`                               | "또는" 구분선                              |
| `AuthHelperLinks`                           | 로그인/회원가입 보조 링크                  |
| `BrandLogo` / `BrandLogoIcon` / `BrandMark` | 브랜드 로고·마크                           |
| `CategoryNavItem`                           | 메인 카테고리 카드                         |
| `ConfirmModal`                              | 확인/안내 모달                             |
| `GenderToggle`                              | 성별 선택 (본인인증 결과 반영)             |
| `RecaptchaWidget`                           | Google reCAPTCHA v2                        |
| `SigninAuthHeader` / `SignupAuthHeader`     | 인증 페이지 헤더                           |
| `SigninInputField`                          | 라벨 + input + 에러 (로그인/회원가입 공용) |
| `SignupFieldWithAction`                     | input + 중복확인 버튼                      |
| `SignupIllustration`                        | 단계별 일러스트 (identity / complete)      |
| `SignupStepIndicator`                       | 4단계 진행 표시                            |
| `TermDetailModal`                           | 약관 전문 모달                             |

#### organisms (6)

| 파일                    | 역할                          | 클라이언트 |
| ----------------------- | ----------------------------- | ---------- |
| `MainSearchBar`         | 메인 검색 UI                  | ✅         |
| `MainCategoryNav`       | 카테고리 그리드 + active 상태 | ✅         |
| `SigninForm`            | 로그인 폼 전체                | ✅         |
| `SignupForm`            | 회원가입 4단계 폼             | ✅         |
| `SocialLoginGroup`      | 소셜 로그인 버튼 (disabled)   | —          |
| `TermsAgreementSection` | 약관 동의 체크박스 그룹       | ✅         |

#### templates (5)

| 파일             | 역할              | 사용 페이지                |
| ---------------- | ----------------- | -------------------------- |
| `MainTemplate`   | 메인 레이아웃     | `/`                        |
| `SigninTemplate` | 로그인 레이아웃   | `/signin`                  |
| `SignupTemplate` | 회원가입 레이아웃 | `/signup`                  |
| `Header`         | GNB (인증 버튼)   | `(header)` layout          |
| `Footer`         | 푸터              | **미구현** (`return null`) |

### 5.3 디자인 시스템

- **폰트**: Noto Serif KR (heading), Ephesis (script), Geist Mono, Pretendard (sans)
- **컬러 토큰**: `vh-gold-*`, `vh-gray-*`, `vh-green-*`, `vh-purple-*`, `vh-surface-charcoal`
- **UI 라이브러리**: shadcn/ui + Tailwind v4 + lucide-react 아이콘
- **폼**: react-hook-form + zod + @hookform/resolvers

---

## 6. 백엔드 API 연동 맵

Gateway 경로 (`lib/api/endpoints.ts`):

| 도메인       | 엔드포인트                                    | 용도                  |
| ------------ | --------------------------------------------- | --------------------- |
| **auth**     | `POST /api/v1/auth/sign-up`                   | 회원가입              |
|              | `POST /api/v1/auth/sign-up/resume`            | 가입 이어하기         |
|              | `POST /api/v1/auth/sign-in`                   | 로그인                |
|              | `POST /api/v1/auth/refresh`                   | 토큰 갱신             |
|              | `POST /api/v1/auth/logout`                    | 로그아웃              |
|              | `GET .../check/login-id`                      | 아이디 중복           |
|              | `GET .../check/email`                         | 이메일 중복           |
| **identity** | `POST /api/v1/identity-verifications/confirm` | PortOne 본인인증 확인 |
| **members**  | `POST /api/v1/members`                        | 회원 프로필 생성      |
|              | `GET /api/v1/members/me`                      | 내 프로필 (로그인 시) |
|              | `GET .../check/nickname`                      | 닉네임 중복           |
| **terms**    | `GET /api/v1/terms/active`                    | 활성 약관             |

---

## 7. 환경 변수 (주요)

| 변수                                  | 용도                   | 노출       |
| ------------------------------------- | ---------------------- | ---------- |
| `API_URL`                             | Gateway auth-service   | 서버 전용  |
| `MEMBER_API_URL`                      | Gateway member-service | 서버 전용  |
| `AUTH_SECRET` / `NEXTAUTH_SECRET`     | NextAuth JWT           | 서버 전용  |
| `AUTH_TRUST_HOST`                     | LAN/다중 호스트 로그인 | 서버       |
| `AUTH_COOKIE_ACCESS_NAME` / `REFRESH` | HttpOnly JWT 쿠키명    | 서버       |
| `NEXT_PUBLIC_PORTONE_*`               | PortOne 본인인증 SDK   | 클라이언트 |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`      | reCAPTCHA v2           | 클라이언트 |
| `TERMS_REVALIDATE_SECRET`             | 약관 캐시 무효화       | 서버 전용  |

---

## 8. 테스트 & 품질

| 항목       | 도구                                         |
| ---------- | -------------------------------------------- |
| Lint       | ESLint (flat config + Next.js)               |
| Format     | Prettier                                     |
| Unit test  | Vitest (`lib/api/client.timeout.test.ts` 등) |
| Pre-commit | Husky + lint-staged                          |
| Pre-push   | Husky + `pnpm lint` → `pnpm build`           |

---

## 9. 한눈에 보는 구현 상태

```
✅ 완료     🔲 UI만/스켈레톤     ❌ 미구현

인증
  ✅ 로그인 (Credentials + reCAPTCHA)
  ✅ 로그아웃
  ✅ 세션 (서버/클라이언트 분리)
  🔲 소셜 로그인 UI

회원가입
  ✅ 4단계 마법사 (본인인증 → 약관 → 정보 → 완료)
  ✅ 중복 확인 (아이디/이메일/닉네임)
  ✅ Daum 주소 검색
  ✅ 가입 이어하기 (resume)

메인
  ✅ 브랜드·검색·카테고리 UI
  🔲 검색/카테고리 BE 연동
  🔲 광고 배너

기타
  ✅ 약관 조회 + 캐시
  ❌ Footer
  ❌ 채팅
  ❌ 상품/피드
  ❌ 보호 라우트 (proxy matcher 비어 있음)
```

---

## 10. 관련 문서

| 문서                                                                         | 내용                                       |
| ---------------------------------------------------------------------------- | ------------------------------------------ |
| [fe-team-onboarding.md](./fe-team-onboarding.md)                             | FE 팀 온보딩 (Notion용)                    |
| [DEVELOPMENT.md](./DEVELOPMENT.md)                                           | 로컬 개발·스크립트·Husky                   |
| [auth-cookie-flow.md](./auth-cookie-flow.md)                                 | HttpOnly 쿠키 인증 흐름                    |
| [form-refactoring.md](./form-refactoring.md)                                 | 폼 리팩터링 노트                           |
| [frontend-priority-and-ui-backlog.md](./frontend-priority-and-ui-backlog.md) | FE 작업 우선순위 · 백로그                  |
| [cursor-team-guide.md](./cursor-team-guide.md)                               | Cursor UI 작업 (BE 개발자용)               |
| [CONTRIBUTING.md](../CONTRIBUTING.md)                                        | Git·PR 컨벤션                              |
| [AGENTS.md](../AGENTS.md)                                                    | AI/개발 데이터 레이어 규칙                 |
| `.cursor/rules/architecture-flow.mdc`                                        | 아키텍처·아토믹 디자인 (채팅 등 계획 포함) |
