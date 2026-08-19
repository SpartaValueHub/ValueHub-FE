# ValueHub-FO 트러블슈팅

Auth·회원가입·로그인 UI 연동 시 자주 발생하는 이슈입니다.  
Gateway·auth-service 쪽 403/500은 [auth-service/docs/troubleshooting.md](../../auth-service/docs/troubleshooting.md) 참고.

---

## 회원가입 / 본인인증 API 오류

### `API 오류 (403 Forbidden)`

- **원인:** Gateway JWT on + public path 미매칭 (POST sign-up·identity confirm)
- **조치:** Gateway **재기동**, `AuthPublicPathMatcher` 반영 확인
- **주의:** `SECURITY_JWT_ENABLED=false`로 우회하지 않는다. JWT off는 local/test 전용이며, prod에서는 기동이 실패한다.

터미널 예:

```text
signupAction → API 오류 (403 Forbidden)
confirmIdentityVerificationAction → 403
```

GET 중복확인(`check/login-id`)은 200인데 POST만 403이면 Gateway Security 이슈로 보면 됩니다.

### `Internal Server Error`

- auth-service·MySQL·PortOne 설정 확인 (Gateway는 통과한 상태)
- auth-service 로그 확인

---

## `useActionState` console 경고

```text
An async function with useActionState was called outside of a transition.
```

- **원인:** `formAction(formData)` 수동 호출
- **조치:** `<form action={formAction}>` 사용, 클라이언트 검증 실패 시에만 `event.preventDefault()`

파일: `components/organisms/SignupForm.tsx`

---

## Zod 4 — `.email()` deprecated

```ts
// ❌ Zod 4 deprecated
z.string().email("메시지");

// ✅
z.email({ error: "올바른 이메일 형식이 아닙니다." });
```

파일: `types/auth/signup.ts`

---

## pnpm install EPERM (Windows)

- **원인:** npm/pnpm `node_modules` 혼용·파일 잠금
- **조치:**
  1. dev server·node 프로세스 종료
  2. `node_modules`, `package-lock.json` 삭제
  3. **`pnpm install`만** 사용 (npm install 금지)

---

## PortOne 본인인증

| 항목                  | 위치                                     |
| --------------------- | ---------------------------------------- |
| Store ID, Channel Key | FE `.env.local` `NEXT_PUBLIC_PORTONE_*`  |
| API Secret            | auth-service `.env` `PORTONE_API_SECRET` |

흐름: PortOne SDK → `confirmIdentityVerificationAction` → `requestToken` → sign-up hidden field.

confirm 403 → Gateway 절차. confirm 400 → PortOne 상태·CI·고객정보(gender 포함) 확인.

---

## 성별(Gender) UI

- **초기:** 여자/남자 선택 highlight 없음 (`gender` state `undefined`)
- **본인인증 후:** PortOne `gender` (`MALE`/`FEMALE`)에 맞춰 gold highlight, 수동 변경 불가 (`readOnly`)
- **저장:** auth-service `auth.gender` 컬럼 (sign-up 시 PortOne 조회값)

---

## 로고 / UI 에셋

- PNG: `public/brand/logo-circle.png`, `public/brand/logo-v.png`
- 컴포넌트: `BrandLogoIcon`, `BrandLogo`, `SigninAuthHeader`, `SignupAuthHeader`
- 메인·로그인·회원가입 헤더 **중앙 정렬**

---

## 환경 변수 (.env.local)

```env
API_URL=http://localhost:8000/auth-service
AUTH_SECRET=...
AUTH_TRUST_HOST=true
NEXT_PUBLIC_PORTONE_STORE_ID=...
NEXT_PUBLIC_PORTONE_CHANNEL_KEY=...
```

`API_URL`은 **Server Action 전용** (클라이언트에서 `getApiUrl()` 호출 시 throw).

---

## 로컬 실행

```bash
pnpm install
pnpm dev
```

Gateway(8000)·auth-service·Redis·Eureka가 먼저 떠 있어야 합니다.
