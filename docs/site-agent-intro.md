# Site Agent Backend 프로젝트 개요

> 현장 근무자용 AI 에이전트 **백엔드**(Spring Boot). 관리자·현장·카카오 로그인·PDF 업로드를 담당하고, RAG 질문은 [Site_agent_ai](https://github.com/p4rksk/Site_agent_ai) FastAPI로 위임합니다.  
> 원 저장소: [p4rksk/Site_agent](https://github.com/p4rksk/Site_agent) · 기본 브랜치 `master`  
> **GitHub README는 없음** — 코드·설정·더미 데이터 기준으로 정리했습니다.  
> 최종 갱신 기준: GitHub `master` 스냅샷 (2026-05-01)

---

## 1. 프로젝트 요약

| 항목 | 내용 |
| --- | --- |
| **프로젝트명** | Site_agent (`site-agent-backend`) |
| **역할** | 건설 현장 관리 API — 관리자 인증, 현장 CRUD, PDF 보관, 카카오 로그인 |
| **스택** | Spring Boot 3.5 · Java 21 · Spring Data JPA · PostgreSQL · JJWT 0.12 · BCrypt |
| **인증** | JWT Bearer (`SUPER_ADMIN` / `SITE_ADMIN` / `USER`) |
| **저장소** | PostgreSQL (`ddl-auto: validate`) + Supabase Storage (`pdf` 버킷) |
| **AI 연동** | 현장 PDF 수정 시 FastAPI `POST /upload-pdf` 호출 (`FASTAPI_URL`) |
| **프론트 CORS** | `http://localhost:3000`, `https://site-agent-front.vercel.app` |
| **배포** | Docker (`eclipse-temurin:21-jdk-alpine` → `./gradlew bootJar`, 포트 8080) |

---

## 2. 디렉터리 구조

```
Site_agent/
├── src/main/java/com/siteagent/backend/
│   ├── BackendApplication.java      # Spring Boot 진입점 + JPA Auditing
│   ├── admin/                       # 본사 관리자 회원가입·로그인·중복 체크
│   ├── site_admin/                  # 현장관리자 엔티티 (가입 시 Admin과 함께 생성)
│   ├── site/                        # 현장 CRUD, PDF 메타, FastAPI 연동
│   ├── user/                        # 카카오 로그인, 공개 현장 목록
│   ├── chatlog/                     # ChatLog 엔티티만 존재 (컨트롤러 소스 없음)
│   ├── common/
│   │   ├── config/                  # CORS, JWT Filter, RestTemplate, PasswordEncoder
│   │   ├── security/                # JwtTokenProvider, JwtAuthenticationFilter
│   │   └── SupabaseStorageService   # PDF → Supabase Storage 업로드
│   └── exception/                   # CustomException, GlobalExceptionHandler
├── src/main/resources/
│   ├── application.yml              # DB / JWT / Kakao / Supabase / FastAPI env 바인딩
│   └── data.sql                     # 더미 Admin·Site·User·PDF·ChatLog (init mode: never)
├── app/                             # FastAPI RAG 사본 (Site_agent_ai와 거의 동일)
│   ├── main.py
│   └── rag.py                       # LLMImageBlobParser 경로 (AI 레포와 구현 차이)
├── data/                            # 샘플 안전 PDF, 로컬 FAISS 인덱스
├── Dockerfile
├── build.gradle
└── requirements.txt                 # Python RAG 의존성 (app/ 실행용)
```

### 데이터 플로우

```
프론트 (Next.js · site-agent-front)
  → Site_agent REST (JWT)
      → PostgreSQL          (admin / site_admin / site / user / site_pdf / chat_log)
      → Supabase Storage    (현장 PDF 파일)
      → Site_agent_ai       POST /upload-pdf  (현장 PDF 수정 시 벡터 인덱스 갱신)
  → Site_agent_ai           POST /ask         (현장 문서 질문 · RAG)
```

- **관리자(SUPER_ADMIN):** 현장 등록·목록·상세·수정·삭제. PDF 교체 시 Storage + FastAPI 인덱싱.
- **현장관리자(SITE_ADMIN):** 현장 수정·삭제 (등록은 SUPER_ADMIN만).
- **근로자(USER):** 카카오 로그인 후 공개 현장 목록 조회. 질문은 FastAPI `/ask`로 직접.

---

## 3. 라우팅 & API

### 공개 (JWT 필터 미적용)

| 경로 | 메서드 | 설명 |
| --- | --- | --- |
| `/admin/signup` | POST | 본사 관리자 + 현장관리자 동시 가입 |
| `/admin/check-id` | GET | 관리자 `loginId` 중복 여부 (`true` = 중복) |
| `/admin/check-site-id` | GET | 현장관리자 아이디 중복 체크 (현재 Admin 중복 API를 재사용) |
| `/admin/login` | POST | Admin 또는 SiteAdmin 로그인 → JWT + role |
| `/user/kakao-login` | POST | 카카오 인가 코드 → 회원 조회/생성 → JWT (`USER`) |
| `/user/sites` | GET | 삭제되지 않은 전체 현장 목록 (공개) |

### JWT 보호 (`FilterConfig`)

필터 URL: `/admin/sites/*`, `/admin/chatlogs`, `/admin/profile`, `/sites/*`, `/chat/*`

| 경로 | 메서드 | 권한 | 설명 |
| --- | --- | --- | --- |
| `/admin/sites` | POST | `SUPER_ADMIN` | 현장 등록 (multipart + 메타) |
| `/admin/sites` | GET | 로그인 관리자 | 본인 `adminId` 소속 현장 목록 |
| `/admin/sites/{siteId}` | GET | 로그인 관리자 | 현장 상세 + 활성 PDF 목록 |
| `/admin/sites/{siteId}` | PUT | `SUPER_ADMIN` / `SITE_ADMIN` | 현장 수정. 파일 있으면 PDF 교체 + RAG 전송 |
| `/admin/sites/{siteId}` | DELETE | `SUPER_ADMIN` / `SITE_ADMIN` | 소프트 삭제 (`deletedAt`) |

필터에만 있고 **소스 컨트롤러가 없는** 경로: `/admin/chatlogs`, `/admin/profile`, `/sites/*`, `/chat/*`  
(`bin/` 컴파일 산출물에 ChatLog 컨트롤러 흔적은 있으나 `src`에는 엔티티만 있음)

### 레이아웃 구조 (도메인)

```
Admin (본사)
 └── SiteAdmin (현장관리자)     # 가입 시 함께 생성
 └── Site (현장, lat/lng, 담당자)
      └── SitePdf (활성 1건 교체 방식, isActive)
      └── ChatLog (질문/답변 로그 엔티티)

User (카카오)
 └── JWT role = USER
```

### 라우트 보호

- `JwtAuthenticationFilter`: `Authorization: Bearer <token>` 필수 (예외: `OPTIONS`, `/user/kakao-login`)
- 토큰 클레임: `sub`=id, `loginId`, `role` → request attribute `adminId`, `role`
- 만료: `jwt.expiration` 기본 **30일** (`2592000000` ms)
- CORS: 자격 증명 허용 (`allowCredentials: true`)

---

## 4. 구현된 기능

| 기능 | 상태 | 구현 위치 |
| --- | --- | --- |
| 관리자 + 현장관리자 가입 | 완료 | `AdminService.signUp` |
| 관리자/현장관리자 로그인 | 완료 | `AdminService.login` → JWT |
| 아이디 중복 체크 | 완료 | `/admin/check-id` |
| 현장 CRUD + 소프트 삭제 | 완료 | `SiteController` / `SiteService` |
| PDF → Supabase 업로드 | 완료 | `SupabaseStorageService.uploadPdf` |
| PDF URL → FastAPI 인덱싱 | 완료 | `SiteService.sendPdfUrlToFastApi` |
| 카카오 로그인 | 완료 | `UserService.kakaoLogin` |
| 공개 현장 목록 | 완료 | `GET /user/sites` |
| 채팅 로그 API | 스켈레톤 | `ChatLog` 엔티티·더미만. 컨트롤러 소스 없음 |
| 관리자 프로필 API | 미구현 | 필터에 `/admin/profile`만 등록 |
| FastAPI 앱 내장 (`app/`) | 사본 | AI 레포 사본. Docker 이미지는 Spring만 빌드 |

---

## 5. 환경 변수 (주요)

| 변수 | 용도 |
| --- | --- |
| `DB_URL` | PostgreSQL JDBC URL |
| `DB_USERNAME` | DB 사용자 |
| `DB_PASSWORD` | DB 비밀번호 |
| `JWT_SECRET` | HS256 서명 키 |
| `PORT` | 서버 포트 (기본 8080) |
| `SUPABASE_URL` | Storage 호스트 |
| `SUPABASE_KEY` | Storage Bearer 키 |
| `FASTAPI_URL` | Site_agent_ai 베이스 URL |
| `KAKAO_CLIENT_ID` | 카카오 REST 키 |
| `KAKAO_CLIENT_SECRET` | 카카오 시크릿 |
| `KAKAO_REDIRECT_URI` | 카카오 리다이렉트 URI |

`application.yml`의 `supabase.bucket`은 `pdf`. 업로드 공개 URL 형식:

`{SUPABASE_URL}/storage/v1/object/public/pdf/{siteId}_{timestamp}.pdf`

---

## 6. 로컬 실행

```bash
# Java 21, PostgreSQL, 환경변수 설정 후
./gradlew bootRun
# 또는
./gradlew bootJar && java -jar build/libs/*.jar
```

Docker:

```bash
docker build -t site-agent-backend .
docker run -p 8080:8080 --env-file .env site-agent-backend
```

`spring.sql.init.mode`는 `never` — `data.sql` 더미는 자동 적재되지 않습니다.

---

## 7. 관련 저장소

| 저장소 | 역할 |
| --- | --- |
| [p4rksk/Site_agent](https://github.com/p4rksk/Site_agent) | 이 문서의 대상 (Spring 백엔드) |
| [p4rksk/Site_agent_ai](https://github.com/p4rksk/Site_agent_ai) | RAG FastAPI — [site-agent-ai-intro.md](./site-agent-ai-intro.md) |
| `site-agent-front` (Vercel) | 관리/근로자 UI. CORS에만 등장, 이 org 저장소에는 없음 |
