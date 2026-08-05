# Auth Cookie Flow

## Architecture

```
Browser (localhost:3000)
  │ signIn("credentials")
  ▼
Next.js Auth.js (session: memberUuid, nickname, role)
  │ authorize → POST /auth/sign-in (server-side)
  ▼
Gateway (localhost:8000) → auth-service
  │ Set-Cookie: vh_access_token, vh_refresh_token
  ▼
Next.js cookie-store (HttpOnly, BFF relay)
  │ apiFetch → Cookie header forward
  ▼
Gateway JWT chain (Cookie or Bearer) → Redis blacklist → X-Member-Uuid, X-Role
  ▼
Downstream services
```

## Cookie Names

| Env                        | Default            |
| -------------------------- | ------------------ |
| `AUTH_COOKIE_ACCESS_NAME`  | `vh_access_token`  |
| `AUTH_COOKIE_REFRESH_NAME` | `vh_refresh_token` |

## Security

- **CSRF**: 상태 변경 API는 SameSite=Lax(기본) + Auth.js CSRF token. cross-site POST는 prod에서 SameSite=Strict/None+Secure 검토.
- **Prod**: `AUTH_COOKIE_SECURE=true`, `AUTH_COOKIE_SAME_SITE=None` + HTTPS, `AUTH_COOKIE_DOMAIN` 설정.
- **Tokens**: localStorage·Auth.js JWT payload에 access/refresh 저장 금지.

## Manual E2E

1. `POST /api/v1/auth/sign-in` → `Set-Cookie` 2개 + body `{ memberUuid, nickname, role }`
2. 보호 API 호출 시 Cookie만으로 Gateway 200
3. Access 만료 후 `POST /api/v1/auth/refresh` (refresh cookie) → 새 Cookie 2개
4. `POST /api/v1/auth/logout` → 204 + Cookie 삭제, 이후 access jti blacklist

## Local Dev

- FO `API_URL=http://localhost:8000/auth-service`
- Gateway `SECURITY_JWT_ENABLED=true`, Redis 실행
- Cookie는 Next BFF가 Gateway 응답 Set-Cookie를 Next 도메인에 저장 후 server-side relay
