# Site Agent 프로젝트 개요

> 현장 근무자용 AI 에이전트 백엔드(Spring Boot) 현재 구현 상태를 구조화한 문서입니다.  
> 원 저장소: [p4rksk/Site_agent](https://github.com/p4rksk/Site_agent) (README 없음) · 코드 스냅샷 (2026-05-01)

---

## 1. 프로젝트 요약

| 항목              | 내용                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| **프로젝트명**    | site-agent-backend                                                          |
| **역할**          | 현장 관리 API (관리자 인증, 현장 CRUD, PDF 보관, 카카오 로그인)             |
| **스택**          | Spring Boot 3.5 · Java 21 · Spring Data JPA · PostgreSQL · JJWT 0.12        |
| **인증**          | JWT Bearer (`SUPER_ADMIN` / `SITE_ADMIN` / `USER`)                          |
| **패키지 매니저** | Gradle                                                                      |
| **백엔드 연동**   | PostgreSQL · Supabase Storage · FastAPI (`FASTAPI_URL` → Site_agent_ai)     |

---

## 2. 디렉터리 구조

```
Site_agent/
├── src/main/java/com/siteagent/backend/
│   ├── admin/                 # 본사 관리자 가입·로그인·중복 체크
│   ├── site_admin/            # 현장관리자 엔티티 (가입 시 Admin과 함께 생성)
│   ├── site/                  # 현장 CRUD, PDF 메타, FastAPI 연동
│   ├── user/                  # 카카오 로그인, 공개 현장 목록
│   ├── chatlog/               # ChatLog 엔티티 (컨트롤러 소스 없음)
│   ├── common/                # CORS, JWT Filter, Supabase Storage
│   └── exception/             # CustomException, GlobalExceptionHandler
├── src/main/resources/
│   ├── application.yml        # DB / JWT / Kakao / Supabase / FastAPI
│   └── data.sql               # 더미 (init mode: never)
├── app/                       # FastAPI RAG 사본 (운영은 Site_agent_ai)
├── Dockerfile
└── build.gradle
```

### 데이터 플로우 (3-Layer)

```
Controller (admin / site / user)
  → *Service                 (권한 검사, 오케스트레이션)
  → Repository / RestTemplate
  → PostgreSQL / Supabase / FASTAPI_URL (Site_agent_ai)
```

- **Controller**: HTTP 진입. JWT attribute(`adminId`, `role`)로 권한 분기
- **Service**: JPA 매핑, PDF 업로드, FastAPI `POST /upload-pdf` 호출
- **저장소**: PostgreSQL + Supabase `pdf` 버킷. RAG 인덱싱은 Site_agent_ai

---

## 3. 라우팅 & 레이아웃

### 페이지 라우트

이 저장소는 API 서버입니다. UI는 CORS에만 등록된 `https://site-agent-front.vercel.app` (소스 없음).

| 경로                            | 레이아웃            | 설명             | BE 연동                  |
| ------------------------------- | ------------------- | ---------------- | ------------------------ |
| —                               | 없음 (API 전용)     | 프론트는 별도 저장소 | ❌                    |

### API Route (BFF)

| 경로                      | 메서드 | 역할                                    |
| ------------------------- | ------ | --------------------------------------- |
| `/admin/signup`           | POST   | 본사 관리자 + 현장관리자 가입           |
| `/admin/check-id`         | GET    | 관리자 아이디 중복                      |
| `/admin/check-site-id`    | GET    | 현장관리자 아이디 중복 (Admin API 재사용) |
| `/admin/login`            | POST   | Admin 또는 SiteAdmin 로그인 → JWT       |
| `/admin/sites`            | GET    | 본인 소속 현장 목록                     |
| `/admin/sites`            | POST   | 현장 등록 (`SUPER_ADMIN`)               |
| `/admin/sites/{siteId}`   | GET    | 현장 상세 + 활성 PDF                    |
| `/admin/sites/{siteId}`   | PUT    | 수정. 파일 있으면 Storage + FastAPI     |
| `/admin/sites/{siteId}`   | DELETE | 소프트 삭제 (`deletedAt`)               |
| `/user/kakao-login`       | POST   | 카카오 인가 코드 → JWT (`USER`)         |
| `/user/sites`             | GET    | 공개 현장 목록                          |

### 레이아웃 구조

```
Admin
├── SiteAdmin
└── Site
    ├── SitePdf (활성 1건 교체, isActive)
    └── ChatLog (엔티티만)

User (카카오)
└── JWT role = USER
```

### 라우트 보호

- `JwtAuthenticationFilter`: `/admin/sites/*`, `/admin/chatlogs`, `/admin/profile`, `/sites/*`, `/chat/*`
- 예외: `OPTIONS`, `/user/kakao-login`. 가입·로그인은 필터 미적용(공개)
- `/admin/chatlogs`, `/admin/profile`, `/chat/*` 는 필터만 있고 컨트롤러 소스 없음
