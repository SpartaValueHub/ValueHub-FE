# ValueHub FE — Vercel 배포 공유

> FE 담당 → 팀 / Gateway 담당 공유용  
> 작성일: 2026-08-12  
> ※ 게시판 복붙용: 외부 이미지 없이 텍스트 다이어그램만 사용

---

## 0. Production 화면이 보이는 이유

```text
[예전] CLI로 develop 스냅샷 배포
              │
              ▼
[지금] Git 연결 + Production Branch = main
              │
              │  ← 연결만으로는 사이트가 즉시 안 바뀜
              ▼
[현재 운영 URL]
valuehub-fo.vercel.app
→ 예전 CLI develop 스냅샷이 남아 있을 수 있음
              │
              │  main 에 push / merge 발생
              ▼
[이후] Production 이 main 코드로 갱신
```

| 질문 | 답 |
|------|----|
| Production Branch = `main`? | **예** |
| `main`에 코드 없음? | **아니요** (develop보다 예전 버전) |
| 지금 화면이 왜 보이나? | **예전 CLI develop 스냅샷**이 Production에 남아 있을 수 있음 |
| 언제 main으로 바뀌나? | **`main` push/merge 시** |

---

## 1. 배포 흐름

```text
[Organization: SpartaValueHub/ValueHub-FE]
  feature ──PR──► develop ──PR──► main
                     │              │
                     └──────┬───────┘
                            │ org push 시 자동 sync
                            ▼
              [Fork: Han-Gyo/ValueHub-FE]
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
     develop / PR                      main
              │                           │
              ▼                           ▼
     Vercel Preview                 Vercel Production
     (테스트 URL)              https://valuehub-fo.vercel.app
              │                           │
              └────────────┬──────────────┘
                           ▼
                    EC2 Gateway API
```

| 구분 | 브랜치 | URL | 용도 |
|------|--------|-----|------|
| **운영** | `main` | https://valuehub-fo.vercel.app | 실제 서비스 |
| **테스트** | `develop` / PR | Deployments에 생기는 Preview URL | 개발 검증 |

### 관련 링크

| 항목 | 링크 |
|------|------|
| Vercel 프로젝트 | https://vercel.com/ggyyoo/valuehub-fo |
| Production | https://valuehub-fo.vercel.app |
| org FE 레포 | https://github.com/SpartaValueHub/ValueHub-FE |
| 배포용 fork | https://github.com/Han-Gyo/ValueHub-FE |

---

## 2. FE → Gateway 담당(팀장) 공유 URL

| 환경 | URL |
|------|-----|
| Production | `https://valuehub-fo.vercel.app` |

Preview URL은 배포마다 새로 생깁니다.  
필요한 Preview Origin은 **Deployments에서 확인한 구체 URL**을 그때 전달합니다.  
CORS 허용 범위는 **Gateway 팀장 정책**으로 관리합니다.

### Gateway → FE (나중에)

```text
API_URL={GATEWAY}/auth-service
MEMBER_API_URL={GATEWAY}/member-service
CATEGORY_API_URL={GATEWAY}/category-service
AUTH_TRUSTED_ORIGIN=https://valuehub-fo.vercel.app
```

---

## 3. Vercel 테스트 방법

```text
1) org develop(또는 feature) PR merge
2) fork 자동 sync 확인 (GitHub Actions)
3) Vercel → valuehub-fo → Deployments
4) Preview 배포 Visit / URL 접속
5) (연동 필요 시) Preview URL을 Gateway 담당에 전달 후 API 테스트
6) 최종: develop → main merge → Production 확인
```

```text
[개발] develop / PR  →  Preview URL
[운영] main          →  https://valuehub-fo.vercel.app
```

### Preview URL 찾는 법

1. https://vercel.com/ggyyoo/valuehub-fo  
2. **Deployments**  
3. Environment = **Preview** 인 항목 클릭  
4. **Visit** 또는 배포 도메인 복사  

### Production 확인

1. `main` merge 후 Deployments에서 Production Ready 확인  
2. https://valuehub-fo.vercel.app  

### 빠른 체크

- [ ] 배포 Status = Ready  
- [ ] Preview / Production 헷갈리지 않았는지  
- [ ] env가 해당 Environment에 있는지  
- [ ] 시크릿 창 / Hard Refresh로 캐시 배제  

---

## 4. 오류 시 프론트 로그 보는 법

```text
배포 실패? ──► Deployments → 해당 배포 → Building 로그
서버 API 오류? ──► 프로젝트 Logs (Runtime) / Preview·Production 필터
버튼만 깨짐? ──► 브라우저 F12 → Console / Network
CLI? ──► npx vercel logs --follow --scope ggyyoo
```

| 증상 | 보는 곳 |
|------|---------|
| Build Failed | Deployments → **Building** 로그 |
| 접속 중 서버 에러 | 프로젝트 → **Logs** (Runtime) |
| 클라이언트 UI 에러 | 브라우저 **Console / Network** |

### 빌드 로그

1. Deployments → Failed 배포  
2. Building 로그에서 `pnpm build` / TS 에러 확인  

### 런타임 로그

1. 좌측 **Logs**  
2. Environment: Preview / Production  
3. `4xx`/`5xx`, path로 필터  

> `'use client'` 로그 → 브라우저 Console  
> Server Actions / Route Handlers → Vercel Logs  

---

## 5. 역할 분담

| 담당 | 할 일 | 상태 |
|------|--------|------|
| FE | Vercel, Production=`main`, fork sync | 완료 |
| FE | Production URL / 테스트·로그 가이드 공유 | 이 문서 |
| Gateway | CORS 정책·설정 | 팀장 |
| Gateway | Gateway 공개 URL 전달 | 대기 |
| FE | API env + 연동 테스트 | URL 수신 후 |

---

## 6. 왜 개인 fork인가?

- Vercel Hobby = org private Git 연결 불가  
- 배포 Git = `Han-Gyo/ValueHub-FE`  
- org merge → fork 자동 sync  
- 일상 개발 = org 레포 기준  

---

## 7. 체크리스트

- [x] Production URL  
- [x] Production Branch = `main`  
- [x] org → fork 자동 sync  
- [ ] Gateway CORS (팀장)  
- [ ] Gateway URL → FE env  
- [ ] Preview ↔ Gateway 스모크 테스트  

---

## 팀장 전달용 (복붙)

```text
FE Vercel 배포 URL 공유드립니다.

[운영 Production]
https://valuehub-fo.vercel.app

[테스트 Preview]
develop/PR 배포마다 Vercel Deployments에 Preview URL이 생성됩니다.
- 확인: Vercel → valuehub-fo → Deployments
- 필요한 Preview Origin은 배포 URL 확인 후 전달드리겠습니다.

Gateway 공개 URL 주시면 FE env에 연결하겠습니다.
CORS 허용 범위는 Gateway 쪽 정책으로 부탁드립니다.
```
