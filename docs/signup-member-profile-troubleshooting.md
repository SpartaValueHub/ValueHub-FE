# 회원가입 후 member 프로필 저장 실패 트러블슈팅

작성일: 2026-08-07

## 1. 장애 요약

회원가입 요청에서 auth-service 계정은 생성됐지만 member-service 프로필은 저장되지 않았고,
화면에는 다음 메시지가 표시됐다.

```text
인증 계정은 생성되었지만 회원 프로필 저장이 완료되지 않았습니다.
```

member-service의 실제 오류 코드는 다음과 같았다.

```text
401 MEMBER_AUTH_MISSING
```

이 상태에서는 loginId, email, 전화번호, CI가 auth DB에 이미 저장되어 재가입이 막히고,
`/members/me`에 프로필이 없어 NextAuth 로그인도 완료되지 않는 고아 계정이 만들어졌다.

## 2. 장애 당시 요청 흐름

```text
Browser
  -> ValueHub-FO signupAction
  -> auth-service POST /api/v1/auth/sign-up
       auth DB 저장 성공
  -> Gateway POST /member-service/api/v1/members
       JWT 검증 필터 비활성
       X-Member-Uuid 주입 안 됨
  -> member-service
       MEMBER_AUTH_MISSING 401
  -> FO
       부분 가입 오류 표시
```

auth DB와 member DB가 분리되어 있으므로 두 저장은 하나의 DB 트랜잭션으로 묶이지 않는다.
따라서 auth 저장 이후 member 호출이 실패하면 보상 또는 복구 경로가 반드시 필요하다.

## 3. 직접 원인

Gateway의 JWT 기능이 런타임에서 비활성화되어 있었다.

당시 `application.yml` 기본값은 다음과 같았다.

```yaml
security:
  jwt:
    enabled: ${SECURITY_JWT_ENABLED:false}
```

Gateway `.env`에는 `SECURITY_JWT_ENABLED=true`가 있었지만 IntelliJ의 Application 실행은
`.env` 파일을 자동으로 읽지 않는다. Gradle `bootRun`에서만 `.env`를 주입하던 구성 때문에
IntelliJ로 직접 실행하면 기본값 `false`가 적용됐다.

그 결과:

1. `JwtSecurityConfig`가 등록되지 않았다.
2. JWT 검증과 `InternalAuthHeaderWebFilter`가 동작하지 않았다.
3. Gateway가 `X-Member-Uuid`를 만들지 못했다.
4. 인증되지 않은 member 생성 요청이 downstream까지 전달됐다.
5. member-service가 `MEMBER_AUTH_MISSING`을 반환했다.

## 4. 진단을 혼동시킨 요소

### 코드 수정 후에도 같은 오류가 지속됨

Spring 코드를 수정하거나 테스트가 통과해도 이미 실행 중인 프로세스에는 변경이 반영되지 않는다.
auth-service, Gateway, member-service 중 하나라도 이전 코드로 실행 중이면 신규 토큰 흐름이 완성되지 않는다.

### Gateway 재기동 시 8000 포트 충돌

```text
Web server failed to start. Port 8000 was already in use.
```

기존 Gateway가 남아 있는 상태에서 새 Gateway를 실행해 발생했다. 이 경우 새 코드가 실행된 것으로
착각할 수 있으므로 8000 포트의 기존 프로세스를 종료한 뒤 한 인스턴스만 실행해야 한다.

### 상태 코드 해석

| 관찰 결과                                                 | 의미                                                   |
| --------------------------------------------------------- | ------------------------------------------------------ |
| 보호 API가 Gateway에서 `401` + `WWW-Authenticate: Bearer` | JWT 보안 체인이 활성화됨                               |
| member 응답 body가 `MEMBER_AUTH_MISSING`                  | 요청이 member-service까지 갔지만 내부 인증 헤더가 없음 |
| public API가 `503`                                        | Gateway는 통과했으나 Eureka/downstream 연결 실패 가능  |
| Gateway 시작 실패 + 8000 in use                           | 이전 Gateway 프로세스가 남아 있음                      |

## 5. 최종 해결

### Gateway를 secure-by-default로 변경

```yaml
security:
  jwt:
    enabled: ${SECURITY_JWT_ENABLED:true}
```

`.env`를 읽지 못해도 JWT가 켜진다. 공개키 설정이 없으면 Gateway가 시작 단계에서 실패하므로
JWT가 조용히 꺼진 채 동작하는 것보다 안전하다.

필수 로컬 설정:

```env
SECURITY_JWT_ENABLED=true
JWT_PUBLIC_KEY_LOCATION=file:../auth-service/keys/jwt-public.pem
AUTH_COOKIE_ACCESS_NAME=vh_access_token
```

### 가입 완료 전용 토큰 도입

auth sign-up 성공 시 일반 로그인 토큰 대신 짧은 수명의 전용 JWT를 발급한다.

| 항목        | 값                                  |
| ----------- | ----------------------------------- |
| `tokenType` | `SIGNUP_COMPLETION`                 |
| `purpose`   | `MEMBER_PROFILE_CREATE`             |
| `sub`       | auth UUID                           |
| 기본 TTL    | 120초                               |
| Redis key   | `auth:signup-completion:{authUuid}` |

이 토큰은 `POST /member-service/api/v1/members`에서만 사용할 수 있다. Gateway는 Redis active JTI를
확인하고 JWT subject를 `X-Member-Uuid`로 주입한다. member 저장이 2xx로 끝난 뒤 Lua compare-and-delete로
JTI를 소비한다.

### member 생성 멱등화

| 상황                                 | 결과                            |
| ------------------------------------ | ------------------------------- |
| 최초 생성                            | `201 Created`                   |
| 같은 memberUuid와 같은 프로필 재전송 | `200 OK` + 기존 결과            |
| 같은 memberUuid지만 중요 정보가 다름 | `409 MEMBER_PROFILE_CONFLICT`   |
| 다른 회원의 nickname 충돌            | `409 MEMBER_DUPLICATE_NICKNAME` |

네트워크 timeout으로 응답을 받지 못해도 같은 요청을 안전하게 재전송할 수 있다.

### 가입 중복 로그인 제거

최종 정상 흐름은 다음과 같다.

```text
auth sign-up
  -> signup completion token 발급
  -> completion token으로 member 생성
  -> NextAuth credentials signIn 1회
  -> /members/me 조회
  -> NextAuth session 생성
  -> 메인 페이지 이동
```

member 생성용 서버 임시 sign-in을 제거하여 가입 한 건당 auth sign-in은 한 번만 수행한다.

### 부분 가입 복구 API

```text
POST /api/v1/auth/sign-up/resume
```

loginId/password를 기존 로그인 보안 정책으로 검증한 뒤 access/refresh token 없이 새로운
signup completion token만 발급한다. member 저장 성공 후에만 공식 NextAuth 로그인을 수행한다.

## 6. API timeout 정책

| API              | timeout |
| ---------------- | ------: |
| 기본             |     5초 |
| auth sign-up     |    10초 |
| member create    |     5초 |
| member `/me`     |     5초 |
| nickname check   |     3초 |
| identity confirm |    12초 |

timeout은 `ApiTimeoutError`로 분리하며, member create는 자동 무한 재시도하지 않는다.

## 7. 재발 방지 체크리스트

- [ ] Gateway `security.jwt.enabled` 기본값이 `true`인가?
- [ ] IntelliJ 직접 실행에서도 공개키 위치가 제공되는가?
- [ ] 8000 포트에 Gateway가 한 개만 실행 중인가?
- [ ] auth-service와 Gateway가 같은 RSA 키 쌍을 사용하는가?
- [ ] `vh_access_token` 쿠키 이름이 FO, auth-service, Gateway에서 동일한가?
- [ ] 보호 API가 토큰 없이 `401 WWW-Authenticate: Bearer`를 반환하는가?
- [ ] 신규 가입 응답에 signup completion token이 발급되는가?
- [ ] member 최초 요청은 201, 동일 재전송은 200인가?
- [ ] member 저장 성공 후 NextAuth sign-in이 한 번만 호출되는가?

## 8. 고아 계정 복구 (resume)

auth 계정만 생성되고 member 프로필이 없는 경우:

1. **같은 세션:** member 저장 실패 후 `partialSuccess` → 화면이 「가입 이어서 완료」로 전환된다  
   (본인인증·이메일·약관 재요구 없음, `POST /api/v1/auth/sign-up/resume`).
2. **새로고침·과거 고아 계정:** `/signup?mode=resume` 또는 로그인/가입 화면의 「가입 이어서 완료」 링크.  
   입력은 아이디·비밀번호·닉네임·주소. completion token으로 member 생성 후 NextAuth 로그인.
3. **CAPTCHA:** resume는 로그인과 동일한 시도 정책을 쓴다.  
   `AUTH_CAPTCHA_REQUIRED` 시 reCAPTCHA 표시, token을 resume 요청에 포함.  
   잠금·CAPTCHA 오류·제공자 장애(`AUTH_CAPTCHA_PROVIDER_UNAVAILABLE`)도 로그인과 동일 안내.
4. **네트워크:** member-service는 Gateway 경유만 허용하고 `X-Member-Uuid` 위조를 막는다.

로그인 ID 중복만으로 resume를 타지 않는다. 신규 가입은 기존처럼 본인인증(`requestToken`)이 필요하다.
