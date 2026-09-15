# SpartaValueHub 조직 레포 분석

> GitHub 조직 [SpartaValueHub](https://github.com/SpartaValueHub) 공개 레포 **16개**를 `develop`(인프라는 `main`) 기준으로 훑은 플랫폼 맵입니다.  
> 분석일: 2026-09-15 · 이 문서는 **ValueHub-FE**에 두지만, 범위는 FE만이 아니라 게이트웨이·MSA·인프라 전체입니다.

관련: [project-overview.md](./project-overview.md) (FE 상세) · [frontend-priority-and-ui-backlog.md](./frontend-priority-and-ui-backlog.md)

---

## 1. 한 줄 요약

ValueHub는 **신뢰 기반 중고·명품 마켓플레이스**입니다. 사용자는 Vercel의 Next.js FO(프론트)로 들어오고, API는 AWS Apps EC2의 **Spring Cloud Gateway(:8000)** 한 곳으로만 갑니다. 그 뒤에서 Eureka가 마이크로서비스를 찾고, 서비스마다 MySQL 스키마가 갈라지며, 채팅 메시지·방은 MongoDB, 실시간은 STOMP WebSocket, 서비스 간 알림은 Kafka입니다.

**이미 돌아가는 축:** 인증·회원·약관 · 카테고리 · 판매글·검색 · 동네 · 채팅 · 거래 예약 · 미디어(S3/CloudFront) · Prod CI/CD.

**아직 껍데기:** 리뷰 · 신고 · 알림 · 프리미엄 플랜 · 백오피스(BO). Health 엔드포인트와 Eureka 등록만 있고 도메인 API는 없습니다.

---

## 2. 레포 목록 (성숙도)

성숙도: **운영 가능** = 도메인 API·문서가 있고 Prod compose에 올라감 · **인프라 완성** = 역할 자체가 디스커버리/게이트웨이/배포 · **스켈레톤** = Health만.

| 레포 | 언어 | 기본 브랜치 | Java(대략) | 성숙도 | 역할 |
| ---- | ---- | ----------- | ---------- | ------ | ---- |
| [ValueHub-FE](https://github.com/SpartaValueHub/ValueHub-FE) | TypeScript | develop | — | 운영 가능 | B2C FO (Next.js 16) |
| [Gateway-Service](https://github.com/SpartaValueHub/Gateway-Service) | Java | develop | ~22 | 인프라 완성 | API Gateway, JWT, CORS, 라우팅 |
| [Discovery-Service](https://github.com/SpartaValueHub/Discovery-Service) | Java | develop | ~2 | 인프라 완성 | Netflix Eureka |
| [Auth-Service](https://github.com/SpartaValueHub/Auth-Service) | Java | develop | ~148 | 운영 가능 | 가입·로그인·JWT·본인인증 |
| [Member-Service](https://github.com/SpartaValueHub/Member-Service) | Java | develop | ~83 | 운영 가능 | 프로필·약관·프사 |
| [Category-Service](https://github.com/SpartaValueHub/Category-Service) | Java | develop | ~37 | 운영 가능 | 카테고리 트리 |
| [Product-Post-Service](https://github.com/SpartaValueHub/Product-Post-Service) | Java | develop | ~150 | 운영 가능 | 판매글·검색·끌올 |
| [Member-Regions-Service](https://github.com/SpartaValueHub/Member-Regions-Service) | Java | develop | ~54 | 운영 가능 | 동네 마스터·GPS 인증 |
| [Chat-Service](https://github.com/SpartaValueHub/Chat-Service) | Java | develop | ~133 | 운영 가능 | 1:1 채팅 REST + STOMP |
| [Reservations-Service](https://github.com/SpartaValueHub/Reservations-Service) | Java | develop | ~50 | 운영 가능 | 거래 약속 (1차) |
| [Reviews-Service](https://github.com/SpartaValueHub/Reviews-Service) | Java | develop | ~7 | 스켈레톤 | 리뷰 (미구현) |
| [Reports-Service](https://github.com/SpartaValueHub/Reports-Service) | Java | develop | ~7 | 스켈레톤 | 신고 (미구현) |
| [Notifications-Service](https://github.com/SpartaValueHub/Notifications-Service) | Java | develop | ~7 | 스켈레톤 | 알림 (미구현) |
| [Premium-Plans-Service](https://github.com/SpartaValueHub/Premium-Plans-Service) | Java | develop | ~7 | 스켈레톤 | 프리미엄 플랜 (미구현) |
| [Bo-Service](https://github.com/SpartaValueHub/Bo-Service) | Java | develop | ~7 | 스켈레톤 | 백오피스 API (미구현) |
| [ValueHub-AWS-Infra](https://github.com/SpartaValueHub/ValueHub-AWS-Infra) | Shell | main | — | 인프라 완성 | Prod Docker Compose · CI/CD · Kafka |

조직 생성: 2026-07-22. 공개 레포 16개. 설명(description)·topics는 비어 있습니다.

---

## 3. 런타임 아키텍처

```text
브라우저
  │  HTTPS (Vercel FO)
  │  REST는 Next 서버 → Gateway
  │  채팅 STOMP는 Next `/api/chat/ws-chat` 프록시 → Gateway
  ▼
┌─────────────────────────────────────────────┐
│  Apps EC2                                   │
│  Gateway :8000                              │
│  Discovery (Eureka) :8761                   │
│  Auth / Member / Category / Product-Post    │
│  Member-Regions / Chat / Reservations       │
│  Reviews / Reports / Notifications /        │
│  Premium-Plans / BO  (스켈레톤도 기동)       │
│  Redis · Kafka (KRaft 1대)                  │
└────────────────────┬────────────────────────┘
                     │ private
┌────────────────────▼────────────────────────┐
│  DB EC2                                     │
│  MySQL 8.4  (서비스별 스키마)               │
│  MongoDB 7  (chat, replica set rs0)         │
└─────────────────────────────────────────────┘

미디어: S3 (private) ← Presigned PUT / CloudFront (조회)
```

### 클라이언트 → 서비스 경로

Gateway는 Eureka 서비스명으로 path prefix를 붙입니다.

```text
http://{gateway}/{eureka-service-name}/api/v1/...
          ↓ rewrite
http://{instance}/api/v1/...
```

| FE env | Gateway prefix | 다운스트림 |
| ------ | -------------- | ---------- |
| `API_URL` | `/auth-service` | Auth |
| `MEMBER_API_URL` | `/member-service` | Member |
| `CATEGORY_API_URL` | `/category-service` | Category |
| `PRODUCT_POST_API_URL` | `/product-post-service` | Product-Post |
| `MEMBER_REGIONS_API_URL` | `/member-regions-service` | Member-Regions |
| `CHAT_API_URL` | `/chat-service` | Chat REST |
| `RESERVATIONS_API_URL` | `/reservations-service` | Reservations |

Swagger는 Gateway에서 서비스별 `/v3/api-docs`를 모아 보여 줍니다. (`/auth-service/v3/api-docs` 등)

### 인증이 흐르는 방식

1. 로그인 성공 → Auth가 RS256 JWT 발급, HttpOnly 쿠키 (`vh_access_token` / `vh_refresh_token`).
2. FE NextAuth 세션에는 **nickname · memberUuid · role** 정도만. 토큰·loginId는 클라이언트에 안 내려 줌.
3. Gateway가 쿠키(또는 Bearer)로 JWT 검증 → 다운스트림에 `X-Member-Uuid`, `X-Role` 주입.
4. 마이크로서비스는 JWT를 다시 풀지 않고 헤더의 회원 UUID만 믿습니다.
5. Redis: refresh·access blacklist·로그인 실패/캡차/레이트 리밋·검색 카운터.

Public GET (JWT 없이): 가입/로그인/중복확인, 본인인증, 약관, 닉네임 체크, 타인 프로필, 카테고리 조회, 판매글 목록/상세, 헤더 검색.

---

## 4. 공통 백엔드 컨벤션

거의 모든 Java 서비스가 같은 뼈대를 씁니다.

| 항목 | 값 |
| ---- | -- |
| Java | 17 |
| Spring Boot | 4.1.0 |
| Spring Cloud | 2025.1.2 |
| 빌드 | Gradle Wrapper |
| 패키지 | `com.sparta.<service>` |
| 아키텍처 | Ports & Adapters (헥사고날). 폴더명은 `adaptor` |
| 계층 | `adaptor.in.web` → `application.port.in` / `service` → `domain` → `adaptor.out.*` |
| 식별자 | 내부 PK(`*_id`) + 외부 UUID. API에는 UUID만 |
| 로컬 포트 | Gateway 8000, Eureka 8761. 나머지는 `server.port: 0` (랜덤) |
| 프로필 | `application.yml` + `local` / `dev` / `prod`. 시크릿은 `.env` |
| API 문서 | springdoc OpenAPI 3.0.3 |
| 에러 | `{ timestamp, status, code, message, path }` (+ `fieldErrors`) |
| Git | Issue 먼저 → `{type}/{n}-slug`. 커밋 `feat:` / `fix:` + 한글 |
| CD | `main`/`develop` push → Docker Hub `p4rksk1611/valuehub-<svc>:prod` → Apps EC2 compose |

Prod compose의 고정 포트 (참고): Auth 8081, Chat 8082, Member 8083, Category 8084, Product-Post(`listing`) 8085, Member-Regions 8086, Reports 8087, Reviews 8088, Notifications 8089, Premium-Plans 8090, BO 8091, Reservations 8092.

컨테이너 이름 `listing` / 이미지 `valuehub-listing`은 예전 Listing 명칭입니다. Eureka 앱 이름은 `product-post-service`입니다.

---

## 5. 서비스별 상세

### 5.1 Discovery-Service

Eureka 대시보드 `http://localhost:8761`. 도메인 로직 없음. Health + 레지스트리만.

### 5.2 Gateway-Service

Spring Cloud Gateway (WebFlux).

- `/{service}/**` → `lb://{service}` , prefix strip.
- JWT on/off (`SECURITY_JWT_ENABLED`). Prod는 켜짐.
- 쿠키 → Bearer 변환, access token 블랙리스트, signup completion 토큰으로 `POST /members`만 허용.
- CORS, 신뢰하지 않는 `Forwarded` 헤더 제거, OpenAPI servers rewrite.
- 프록시 대상: auth, chat, member, category, member-regions, product-post, reviews, reports, notifications, premium-plans, bo, reservations, discovery.

### 5.3 Auth-Service

계정·세션의 원본. MySQL `auth_db` + Redis.

| Method | Path | 비고 |
| ------ | ---- | ---- |
| POST | `/api/v1/auth/sign-up` | PortOne SUCCESS `requestToken` 필수. CI는 HMAC-SHA256만 저장 |
| POST | `/api/v1/auth/sign-up/resume` | 프로필 미완료 → completion token 재발급 |
| POST | `/api/v1/auth/sign-in` | 실패 5회 reCAPTCHA, 6회 잠금, IP rate limit |
| POST | `/api/v1/auth/refresh` · `/logout` | Origin 검증 가능 |
| GET | `/api/v1/auth/check/login-id` · `/check/email` | public |
| GET | `/api/v1/auth/me` | 내 계정 |
| GET | `/api/v1/auth/members/{memberUuid}/joined-at` | 타인 가입일 (public) |
| POST | `/api/v1/auth/withdraw` | PASS 본인인증 후 탈퇴 |
| POST | `/api/v1/identity-verifications/confirm` · `/status` | PortOne |

엔티티: `AuthEntity` (loginId, email, phone, 상태, 생년월일, 성별), `IdentityVerificationEntity`, `SignupIdentityClaimEntity`.  
가입 직후 `signupCompletionToken`(약 120초)으로 Member 프로필을 만듭니다. Auth UUID와 Member UUID는 같은 회원 식별자로 쓰입니다.

문서: `docs/auth-api.md`, `auth-cookie-flow.md`, `session-invalidation.md`.

### 5.4 Member-Service

프로필·약관. MySQL `member_db`. Kafka **producer** (`member.events` — 프사 변경).

| Method | Path | 비고 |
| ------ | ---- | ---- |
| GET | `/api/v1/terms/active` | public. 유효 약관 |
| GET | `/api/v1/members/check/nickname` | public |
| POST | `/api/v1/members` | completion token 경로 |
| GET/PATCH | `/api/v1/members/me` | 내 프로필 |
| POST | `/api/v1/members/me/media/presigned-url` | 프사 업로드 |
| GET | `/api/v1/members/{memberUuid}/profile` | 공개 프로필 |

필드: nickname, profileImageUrl, memberGrade, address, isPremium. 약관 동의는 `MemberTermConsent`. 시드: `docs/terms-seed.sql`.

### 5.5 Category-Service

트리 카테고리. MySQL `category_db`. GET은 Gateway public.

| Method | Path | 용도 |
| ------ | ---- | ---- |
| GET | `/api/v1/categories/tree` | 전체 트리 (BO·FO) |
| GET | `/api/v1/categories` | 부모별 자식. `parentUuid` 없으면 최상위 |
| GET | `/api/v1/categories/leaves` | 상품 등록용 리프 |
| POST/PATCH/DELETE | `/api/v1/categories` | BO. 삭제는 소프트(`active=false`) |

판매글은 **리프 `categoryUuid`만** 저장합니다.

### 5.6 Product-Post-Service

판매글·헤더 검색의 원본. MySQL `product_post_db` + Redis(`search:` prefix) + Kafka produce/consume.

**판매글**

| Method | Path | Auth |
| ------ | ---- | ---- |
| GET | `/api/v1/product-posts` | public. 필터·페이징 |
| GET | `/api/v1/product-posts/{uuid}` | public 상세 |
| POST | `/api/v1/product-posts` | 등록 |
| PUT | `/{uuid}` | 수정 (본인·SELLING) |
| DELETE | `/{uuid}` | 소프트 삭제 |
| PATCH | `/{uuid}/visibility` | 숨김/재공개 |
| PATCH | `/{uuid}/trade-status` | 거래 상태 |
| POST | `/{uuid}/bump` | 끌올 (쿼터) |
| POST | `/media/presigned-url` | 이미지 업로드 URL |

목록 쿼리: `categoryUuids`, `memberUuid`, `tradeStatus`, `keyword`(FULLTEXT ngram), `minPrice`/`maxPrice`, `conditionGrades`, `documentTypes`, `centerLatitude`/`centerLongitude`/`radiusKm`, `page`/`size`.

도메인: 상품명, 상태등급, 가격, 설명, 좌표·장소·동/구, `tradeStatus`(`SELLING`/`RESERVED`/`SOLD_OUT`), `productPostStatus`(`PUBLIC`/`HIDDEN`/`DELETED`), 이미지·증빙 문서.

**검색** (`/api/v1/search`, GET public)

| Path | 역할 |
| ---- | ---- |
| `/popular` | 추천 검색어 (Redis 가중 카운터) |
| `/related` | 연관 검색어 |
| `/suggestions` | 자동완성 |

Elasticsearch 없음. 추천/연관은 원본 테이블을 안 치고, 일반 검색만 FULLTEXT.

Kafka: `product.events` 발행 (수정·거래상태·삭제 스냅샷). `reservation.events` 소비 → `CREATED`면 `RESERVED`, `CANCELED`면 `SELLING`.

문서: `docs/product-post-api.md`, `search-api.md`, `search-architecture.md`, `reservation-events.md`.

### 5.7 Member-Regions-Service

마이페이지 동네. MySQL `member_regions_db`. 행정동 시드: vuski/admdongkor.

| Method | Path | 비고 |
| ------ | ---- | ---- |
| GET | `/api/v1/regions` | 마스터 검색 (`keyword`) |
| GET/POST | `/api/v1/member-regions` | 내 동네. 회원당 최대 2개 |
| PATCH | `/{id}` | 동네 변경 (인증 무효화) |
| PATCH | `/{id}/primary` | 대표 동네 |
| POST | `/{id}/verify` | GPS 인증 |
| DELETE | `/{id}` | 삭제 |

FE는 카카오맵과 같은 행정동 코드(`regionCode` BIGINT)를 씁니다.

### 5.8 Chat-Service

1:1 상품 채팅. **MongoDB**(방·메시지) + **MySQL `chat_db`**(회원·상품 Read Model) + STOMP + Kafka 소비.

레거시 문서 `docs/ARCHITECTURE_ANALYSIS.md`(2026-07-28)는 **SSE + capped collection** 시절입니다. 현재 코드는 **Servlet + WebSocket/STOMP**, 메시지 타입 TEXT/IMAGE/LOCATION/RESERVATION입니다. SSE 문서는 참고하지 마세요.

**REST** (`/api/v1/chat`, JWT 필요)

| Method | Path |
| ------ | ---- |
| POST | `/rooms` 방 생성(또는 재사용). 상품 스냅샷은 요청 본문 |
| GET | `/rooms` 내 방 목록 + lastMessage + unread |
| GET | `/rooms/{roomId}` 상세 |
| GET | `/rooms/{roomId}/messages` 이력 (`before`, `limit`) |
| GET | `/product-posts/{uuid}/rooms` 그 상품의 내 방 |
| GET | `/unread-count` |
| POST | `/rooms/{roomId}/images/presigned-url` |

**STOMP**

- 엔드포인트: `/ws-chat`
- 보내기: `/app/chat.{roomId}`
- 구독: `/topic/chat.{roomId}`, 목록용 큐, `/user/queue/errors`
- `RESERVATION` 타입은 클라이언트가 직접 못 보냄. Reservations Kafka 컨슈머가 말풍선 insert.

방 생성 시 Kafka 없음. Chat이 Member 프로필을 HTTP(OpenFeign)로 가져와 Read Model에 넣습니다. 이후 상품 스냅샷은 `product.events`, 프사는 `member.events`.

FE: REST는 Server Action. 소켓은 브라우저가 Gateway에 쿠키를 못 붙여서 Next가 `/api/chat/ws-chat`에서 쿠키 → Bearer로 업그레이드합니다. 상세: [chat-websocket-auth.md](./chat-websocket-auth.md).

### 5.9 Reservations-Service

거래 약속의 원본. MySQL `reservations_db`. Kafka **producer**만 (`reservation.events`). Chat·Product를 HTTP로 안 칩니다.

| Method | Path | 권한 |
| ------ | ---- | ---- |
| POST | `/api/v1/reservations` | 판매자만 등록 |
| GET | `/me` | 내 목록 |
| GET | `/by-chat-room/{chatRoomId}` | 그 방의 CONFIRMED |
| GET | `/{reservationId}` | 단건 |
| PATCH | `/{reservationId}` | 판매자 수정 |
| DELETE | `/{reservationId}` | 소프트 취소 → `CANCELED` |

규칙: 채팅방당·상품당 `CONFIRMED` 1건. `chatRoomId`는 Mongo ObjectId. 좌표·장소 필수. 이벤트 키는 `productPostUuid`.

### 5.10 스켈레톤 5종

Reviews / Reports / Notifications / Premium-Plans / BO:

- `GET /health/test` → `{ service, status: UP }`
- Eureka 등록, MySQL 스키마(`reviews_db` 등)는 Infra가 만들어 둠
- 컨트롤러·엔티티·API 문서 없음
- Prod에도 컨테이너는 뜹니다 (빈 서비스)

BO 프론트 레포는 조직에 없습니다. 카테고리 POST/PATCH/DELETE는 FO가 아니라 향후 BO가 쓸 자리입니다.

Member의 `isPremium`·`memberGrade`는 필드만 있고 Premium-Plans와 연동되지 않았습니다.

---

## 6. ValueHub-FE (FO) — 현재 코드 기준

스택: Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · shadcn/ui · NextAuth v4 · pnpm.

데이터는 3-Layer만 탑니다. `UI → actions → services → lib/api (apiFetch) → Gateway`. 경로는 `lib/api/endpoints.ts`만.

### 페이지

| 경로 | 레이아웃 | BE |
| ---- | -------- | -- |
| `/` | Header | 메인. 검색·카테고리·상품 진입 |
| `/signin` · `/signup` | none | Auth + Member + Terms + PortOne |
| `/product-posts` | Header | 목록·필터·위치 |
| `/product-posts/new` · `/[uuid]/edit` | Header | 등록/수정 + 카테고리 + Presigned |
| `/product-posts/[uuid]` | Header | 상세 |
| `/mypage` | Header, `requireAuth` | 프로필·내 글·동네 |
| `/chat` · `/chat/[uuid]` | none | 방 목록·STOMP |
| `/design-system` | Header | 컴포넌트 카탈로그 |

### FE ↔ BE 연동

| 백엔드 | FE | 상태 |
| ------ | -- | ---- |
| Auth / Identity | actions + NextAuth | 연동 |
| Member / Terms | signup, mypage, BFF `/api/terms/active` | 연동 |
| Category | 홈·등록 카테고리 | 연동 |
| Product-Post + Search | 목록/상세/등록/끌올/검색 | 연동 |
| Member-Regions | 마이페이지 동네, 목록 위치 | 연동 |
| Chat | REST + STOMP 프록시 | 연동 |
| Reservations | 채팅 약속 | 연동 |
| Reviews / Reports / Notifications / Premium / BO | — | 없음 |

아직 UI만·부분: 소셜 로그인 버튼(disabled), 광고 배너 자리, Footer 약함. `proxy.ts` matcher가 비어 있어 라우트 가드는 페이지의 `requireAuth`에 가깝습니다.

`.cursor/rules/architecture-flow.mdc`와 오래된 `project-overview.md`(2026-08-19)는 채팅·상품을 “미구현”으로 적습니다. **이 문서와 코드를 우선**하세요.

---

## 7. Kafka

Outbox/Saga 없음. **자기 DB 커밋 후** `KafkaTemplate.send`. JSON, 타입 헤더 없음. 토픽은 필드마다 쪼개지 않음.

| 토픽 | 키 | Producer | Consumer |
| ---- | -- | -------- | -------- |
| `reservation.events` | `productPostUuid` | Reservations | Chat, Product-Post |
| `product.events` | `productPostUuid` | Product-Post | Chat |
| `member.events` | `memberUuid` | Member | Chat |

```text
판매자 → Reservations API
           DB commit → reservation.events
             Chat: RESERVATION 말풍선 + 헤더(예약중/판매중)
             Product-Post: CREATED→RESERVED, CANCELED→SELLING

상품 수정/상태/삭제 → product.events → Chat Read Model UPDATE
프사 변경 → member.events → Chat profile_image_url
지역공유 LOCATION → Kafka 없음 (STOMP만)
게시글 최초 CREATE 이벤트 없음 (방 만들 때 스냅샷 INSERT)
```

기준 문서: Infra `docs/kafka.md`. group-id: Chat `chat-service`, Product-Post `listing-service`.

---

## 8. 데이터 · 미디어

### MySQL 스키마 (한 인스턴스)

`auth_db` `member_db` `category_db` `product_post_db` `member_regions_db` `reservations_db` `chat_db` `reports_db` `reviews_db` `notifications_db` `premium_plans_db` `bo_db`

로컬 JPA `ddl-auto: update`. FULLTEXT·부분 유니크 등 일부는 `scripts/*.sql`.

### MongoDB

Chat 방·메시지. Prod는 단일 노드 replica set `rs0`(Change Stream 대비).

### Redis

Auth 보안 스토어 + Gateway 블랙리스트 + Product-Post 검색 카운터. 같은 Redis, 키 prefix로 분리.

### 미디어

S3 private + CloudFront OAC. 흐름: Presigned PUT → `pending/...` → 도메인 API가 `posts/` 등으로 승격. 5MB, jpeg/png/webp/gif. 프로필·판매글·채팅 이미지가 이 패턴입니다. Infra `docs/media-architecture.md`.

---

## 9. 배포 · 로컬

### Prod

1. 서비스 레포 `main`/`develop` → Actions가 이미지 빌드 → Docker Hub `:prod`
2. Apps EC2 SSH → 해당 서비스만 `compose pull/up`
3. Infra 레포가 compose/env/scripts를 바꾸면 Apps 전체 up

FE는 Vercel. Gateway URL만 서버 env. Prod에서 Spring URL을 `NEXT_PUBLIC_*`로 열지 않음 (채팅 STOMP 예외는 Next 프록시).

노트북용 `ValueHub-Infra`는 이 조직 공개 레포에 없습니다. Prod 전용은 `ValueHub-AWS-Infra`.

### 로컬 기동 순서

1. Discovery (`:8761`)
2. Redis (+ 필요 시 Kafka, MySQL, Mongo)
3. Gateway (`:8000`)
4. 사용할 MSA (`port: 0`, Eureka 등록)
5. FE `pnpm dev` (`0.0.0.0:3000`, `AUTH_TRUST_HOST=true`)

JWT 키: Auth `./gradlew generateJwtKeys`. Gateway는 public PEM.

---

## 10. 도메인 맵 (누가 원본인가)

| 개념 | 원본 | 복제/읽기 |
| ---- | ---- | --------- |
| 계정·비밀번호·CI·세션 | Auth | — |
| 닉네임·프사·약관 | Member | Chat `chat_user_profiles` (Kafka/방생성) |
| 카테고리 트리 | Category | Product-Post는 리프 UUID만 |
| 판매글·가격·거래상태 | Product-Post | Chat `chat_product_posts` |
| 동네 | Member-Regions | 목록 반경 필터는 Product-Post 좌표 |
| 채팅방·메시지 | Chat (Mongo) | — |
| 거래 약속 | Reservations | Chat 말풍선, Product-Post `RESERVED`/`SELLING` |
| 리뷰·신고·알림·구독·BO | 없음 | — |

교차 호출: Chat → Member (방 생성 시 프로필). 예약은 **이벤트만**. Gateway가 유일한 외부 입구.

---

## 11. 갭 · 주의 · 다음 일

### 구현 공백

1. **리뷰 / 신고 / 알림 / 프리미엄 / BO** — 스키마·컨테이너만. 신뢰등급·거래 후기·신고 플로우는 여기가 막혀 있음.
2. **소셜 로그인** — FO 버튼 disabled. Auth에 Google/Kakao 플로우 없음.
3. **BO UI** — 카테고리 관리 API는 있으나 관리 화면 레포 없음.
4. **문서 드리프트** — Chat `ARCHITECTURE_ANALYSIS.md`(SSE), FE `project-overview.md`·일부 Cursor 규칙(채팅/상품 미구현)이 코드보다 오래됨.
5. **Reviews-Service GitHub size** — 원격 용량이 비정상적으로 큼(히스토리에 빌드 산출물 가능성). 현재 트리의 소스는 스켈레톤 수준.

### 운영 메모

- Kafka 1대 KRaft, replication 1. 브로커 장애 시 이벤트 유실·재처리 정책이 약함 (Outbox 없음).
- 예약/상품 상태 동기화는 비동기. API 성공 ≠ 채팅 헤더·상품 상태가 즉시 같음.
- 닉네임 변경은 기존 채팅방에 안 반영 (방 생성 스냅샷 유지, `member.events`는 프사만).

### FE가 바로 붙일 수 있는 BE (이미 스펙 있음)

스켈레톤을 키우기 전에, 이미 있는 API로 FO를  densify 하는 쪽이 짧습니다.

- 카테고리 트리 네비 + 상품 필터 고도화
- 검색 추천/연관/자동완성 UI
- 마이페이지 판매관리(숨김·끌올·거래상태)
- 채팅 이미지·위치·예약 패널 완성도
- 공개 프로필 모달 (`GET /members/{uuid}/profile`)

새 마이크로서비스가 필요해지는 시점: **거래 완료 후 리뷰**, **신고**, **푸시/인앱 알림**, **유료 노출**, **관리자 검수**.

---

## 12. 레포별 문서 입구

| 레포 | 읽기 좋은 문서 |
| ---- | -------------- |
| Auth | `docs/auth-api.md` |
| Member | `docs/member-api.md` |
| Category | `docs/category-api.md` |
| Product-Post | `docs/product-post-api.md`, `search-architecture.md` |
| Member-Regions | `docs/member-region-api.md` |
| Chat | `docs/chat-api.md` (ARCHITECTURE_ANALYSIS는 구버전) |
| Reservations | `docs/reservation-api.md` |
| Gateway | `docs/auth-cookie-flow.md`, `alb-https.md` |
| Infra | `docs/aws-setup.md`, `cicd-flow.md`, `kafka.md`, `media-architecture.md` |
| FE | `docs/project-overview.md`, `DEVELOPMENT.md`, `chat-websocket-auth.md` |

---

## 13. 분석 범위

- 대상: `https://github.com/SpartaValueHub` 공개 레포 16개 (2026-09-15).
- 방법: GitHub API 목록 + 각 레포 `develop`/`main` shallow clone → README, API 문서, Controller, `application.yml`, Infra compose, FE `endpoints.ts`·App Router.
- 비공개 레포·Notion·Figma·운영 시크릿은 보지 않음.
- 런타임 E2E(실서버 호출)는 이 분석에 포함하지 않음.
