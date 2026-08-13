# ValueHub FE — Vercel 배포 안내

FE(Next.js)를 Vercel에 배포한 구성과, 팀/Gateway 담당과 맞출 URL·테스트·로그 확인 방법을 정리한다.  
실비밀값(`.env` 실값, PAT 등)은 git에 올리지 않는다.

현재 브랜치 전략: **`develop` 사용 안 함.**  
`main`에서 작업 브랜치를 따고, **`main`으로 바로 PR / merge** 한다.

---

## 한 줄 요약

| 구분 | 내용 |
| --- | --- |
| 운영 URL | https://valuehub-fe.vercel.app |
| Production Branch | `main` |
| 작업 방식 | `main`에서 feature 브랜치 → `main`으로 PR |
| merge 전 테스트 | **localhost:3000** + EC2 Gateway |
| Git 연결 대상 | Hobby 제약으로 org private 직접 연결 불가 → 개인 fork `Han-Gyo/ValueHub-FE` |
| org → fork | org `main` push / merge 시 **main만** 자동 sync |
| 재배포 | fork `main`이 바뀌면 Vercel **Production** 자동 배포 |
| develop Preview | 없음. develop merge는 Production URL을 안 바꿈 |
| Gateway CORS | `https://valuehub-fe.vercel.app`, `http://localhost:3000` |

---

## 전체 그림

> 아래 다이어그램은 **GitHub**에서 그림으로 렌더됩니다.  
> Cursor 미리보기·일부 게시판은 Mermaid를 코드로만 보여줄 수 있습니다.  
> 게시판용: GitHub 문서 페이지에서 렌더된 그림을 캡처해 올리거나, GitHub 링크를 공유하세요.  
> 문서 파일: `docs/vercel-deploy-team-notice.md`

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "primaryColor": "#FFF3B0",
    "primaryTextColor": "#111",
    "primaryBorderColor": "#333",
    "lineColor": "#333",
    "secondaryColor": "#FFF8DC",
    "tertiaryColor": "#FFFDE7",
    "clusterBkg": "#FFF3B0",
    "clusterBorder": "#333"
  }
}}%%
flowchart TB
  subgraph Org["GitHub org - SpartaValueHub/ValueHub-FE"]
    FEAT["feature"]
    LOCAL["localhost:3000<br/>merge 전 테스트"]
    MAIN["main"]
    FEAT --> LOCAL
    LOCAL -->|확인 후 PR merge| MAIN
  end

  subgraph Fork["Deploy fork - Han-Gyo/ValueHub-FE"]
    SYNC["org main push 시만<br/>자동 sync"]
  end

  subgraph Vercel["Vercel - valuehub-fe"]
    PROD["Production<br/>valuehub-fe.vercel.app"]
  end

  subgraph EC2["Apps EC2"]
    GW["Gateway"]
  end

  LOCAL -.->|API 호출| GW
  MAIN -->|자동 sync| SYNC
  SYNC -->|main| PROD
  PROD -.->|API 호출| GW

  classDef node fill:#FFFDE7,stroke:#333,color:#111;
  class FEAT,LOCAL,MAIN,SYNC,PROD,GW node;
```

포인트:
- 일상 개발은 **org 레포** 기준 (`main` → feature → `main` PR)
- **merge 전 화면/API 테스트는 localhost:3000** (EC2 Gateway에 붙임)
- Vercel Git은 **개인 fork `main`만** 연결. `develop` sync / Preview 없음
- org `main` merge → fork sync → `valuehub-fe.vercel.app` 갱신
- Production / localhost 모두 같은 EC2 Gateway 호출 (점선)
- develop에만 merge해서 Production URL로 테스트하는 방법은 **없음**

---

## Production URL이 예전에 보였던 이유

Git Production Branch를 `main`으로 걸어둬도, **예전에 CLI로 올린 스냅샷**이 Production에 남아 있으면 그 화면이 계속 보일 수 있다.  
`main`에 push/merge가 일어나야 Production이 최신 main 코드로 갱신된다.

```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#FFF3B0","primaryBorderColor":"#333","lineColor":"#333","clusterBkg":"#FFF3B0"}}}%%
flowchart LR
  A["예전 CLI 스냅샷 배포"] --> B["운영 URL에 잔존 가능"]
  C["Git Production = main 설정"] -.->|연결만으로는 즉시 교체 안 됨| B
  D["main push / merge"] --> E["Production이 main으로 갱신"]
  classDef node fill:#FFFDE7,stroke:#333,color:#111;
  class A,B,C,D,E node;
```

| 질문 | 답 |
| --- | --- |
| Production Branch = `main`? | O |
| 언제 Production이 바뀌나? | org `main` merge → fork sync 이후 |

---

## 코드 배포 흐름 (FE)

```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#FFF3B0","primaryBorderColor":"#333","lineColor":"#333","clusterBkg":"#FFF3B0"}}}%%
flowchart LR
  A1["main에서 feature 브랜치"] --> A2["localhost:3000<br/>+ EC2 테스트"]
  A2 --> A3["org main으로 PR"]
  A3 --> A4["org CI<br/>lint / test / build"]
  A4 --> A5["main merge"]
  A5 --> A6["fork main sync"]
  A6 --> A7["Vercel Production"]

  classDef node fill:#FFFDE7,stroke:#333,color:#111;
  class A1,A2,A3,A4,A5,A6,A7 node;
```

| 무엇을 했나 | 결과 |
| --- | --- |
| feature / develop에서 작업 | **localhost:3000** 으로 EC2 연동 테스트 |
| org `main`으로 PR | org Actions에서 lint / test / build |
| org `main` merge | fork `main` sync → https://valuehub-fe.vercel.app 갱신 |

참고:
- Vercel은 **fork `main`** 에만 연결됨
- org `develop` merge는 fork/Vercel을 안 건드림
- develop용 Preview URL을 Production URL이랑 같게 만드는 방법은 **없음**
- 팀 공용 배포 URL은 Production 하나뿐

---

## merge 전 테스트 (localhost)

`main` merge 전에 화면/API를 보려면 **로컬 FE + EC2** 가 맞다.

```text
pnpm dev
→ http://localhost:3000
→ EC2 Gateway API 호출
```

| 단계 | 하는 일 |
| --- | --- |
| 1 | `.env`에 EC2 Gateway URL (`API_URL` 등) |
| 2 | Gateway CORS에 `http://localhost:3000` 허용 |
| 3 | `pnpm dev` 후 브라우저에서 확인 |
| 4 | 통과하면 org `main`으로 PR |

로컬로 안 잡히는 것: Vercel env 누락, Production 빌드 이슈  
→ 보완은 org Actions CI + `main` merge 후 Production URL

---

## URL / 링크

| 항목 | 값 |
| --- | --- |
| Production | https://valuehub-fe.vercel.app |
| Vercel 프로젝트 | https://vercel.com/ggyyoo/valuehub-fe |
| org FE 레포 | https://github.com/SpartaValueHub/ValueHub-FE |
| 배포용 fork | https://github.com/Han-Gyo/ValueHub-FE |
| org CI Actions | https://github.com/SpartaValueHub/ValueHub-FE/actions |
| fork sync Actions | https://github.com/Han-Gyo/ValueHub-FE/actions |

---

## Gateway와 맞추는 방법

```mermaid
sequenceDiagram
  participant FE as FE 담당
  participant V as Vercel
  participant GW as Gateway 담당
  participant EC2 as Apps EC2 Gateway

  FE->>GW: Production URL + localhost Origin 공유
  GW->>EC2: CORS / Origin 정책 반영
  GW->>FE: Gateway 공개 Base URL 전달
  FE->>V: API_URL 등 env 설정
  Note over FE,EC2: localhost로 먼저 테스트 후 Production 확인
```

### FE → Gateway 담당에 주는 것

| 환경 | Origin |
| --- | --- |
| Production | `https://valuehub-fe.vercel.app` |
| 로컬 테스트 | `http://localhost:3000` |

### Gateway → FE에 주시면 되는 것

```text
API_URL={GATEWAY}/auth-service
MEMBER_API_URL={GATEWAY}/member-service
CATEGORY_API_URL={GATEWAY}/category-service
AUTH_TRUSTED_ORIGIN=https://valuehub-fe.vercel.app
# 로컬 테스트는 .env 에 같은 Gateway URL + CORS localhost:3000
```

---

## 테스트 절차

### merge 전 (localhost)

1. feature 브랜치에서 `pnpm dev`  
2. http://localhost:3000 접속  
3. EC2 Gateway 연동 확인 (로그인/API)  
4. 문제 없으면 org `main`으로 PR  

### Production (main merge 후)

1. org `SpartaValueHub/ValueHub-FE`에서 `main` PR merge  
2. org Actions에서 `CI` / `Notify deploy fork to sync` 확인  
3. fork Actions에서 `Sync from upstream` 확인  
4. https://vercel.com/ggyyoo/valuehub-fe → **Deployments**  
5. Production Ready 확인 후 https://valuehub-fe.vercel.app 접속  

### 체크

- [ ] 배포 Status = Ready  
- [ ] Environment = Production  
- [ ] 해당 Environment env 존재  
- [ ] 시크릿 창 / Hard Refresh로 캐시 배제  

---

## CI/CD 동작 중 로그 보는 법 (진행 상황)

org `main`에 PR / merge 되면 **org CI → fork sync → Vercel 배포** 순으로 돌아간다.  
오류가 아니어도 **돌아가는 중**인 로그를 아래 페이지에서 볼 수 있다.

```mermaid
%%{init: {"theme":"base","themeVariables":{"primaryColor":"#FFF3B0","primaryBorderColor":"#333","lineColor":"#333","clusterBkg":"#FFF3B0"}}}%%
flowchart LR
  A["org main<br/>PR · merge"] --> B["org Actions<br/>CI / notify"]
  B --> C["fork sync"]
  C --> D["Vercel Deployments<br/>Building → Ready"]
  classDef node fill:#FFFDE7,stroke:#333,color:#111;
  class A,B,C,D node;
```

### 1) GitHub Actions

| 어디서 | URL | 누가 보나 |
| --- | --- | --- |
| org CI (lint / test / build) | https://github.com/SpartaValueHub/ValueHub-FE/actions | **팀원 전체** |
| org notify (fork sync 요청) | 같은 Actions 탭의 `Notify deploy fork to sync` | 배포 담당 |
| fork Actions (sync) | https://github.com/Han-Gyo/ValueHub-FE/actions | 배포 담당 |

보는 방법:

1. 위 Actions 페이지 접속  
2. 가장 위(최신) **workflow run** 클릭  
   - org: `CI`, `Notify deploy fork to sync`  
   - fork: `Sync from upstream`  
3. 왼쪽 job 클릭 → 오른쪽에서 **실시간 step 로그** 확인  
4. 상태: `Queued` → `In progress` (노란 점) → `Success` / `Failure`

`main` merge 직후면 org Actions가 먼저 돌고, 이어서 fork Actions가 돌아야 정상이다.

### 2) Vercel 배포 진행 (Building 중)

오류가 아니어도 **빌드·배포가 도는 중**이면 여기서 본다.  
Vercel 대시보드는 Hobby 플랜이라 **배포 담당자만** 볼 수 있다.

| 어디서 | URL |
| --- | --- |
| Deployments 목록 | https://vercel.com/ggyyoo/valuehub-fe/deployments |
| 프로젝트 홈 | https://vercel.com/ggyyoo/valuehub-fe |

보는 방법:

1. **Deployments** 탭 열기  
2. 맨 위 배포 카드 확인  
   - Environment: `Production` (`main`)  
   - Status: `Building` → `Ready` (또는 `Error`)  
3. 해당 배포 **클릭**  
4. 상단/타임라인에서 **Building** 구간 로그 펼치기  
   - `pnpm install` / `pnpm build` 출력이 실시간으로 이어짐  
5. 끝나면 Status가 **Ready** → **Visit**으로 접속

요약:

| 보고 싶은 것 | 어디서 |
| --- | --- |
| PR 코드 검증 | org Actions **CI** |
| fork가 맞춰졌는지 | fork Actions **Sync from upstream** |
| 지금 배포가 도는지 | Vercel **Deployments** 최신 행 Status |
| 빌드 로그 전문 | 배포 상세 → **Building** |
| 배포 끝난 뒤 요청 로그 | Vercel **Logs** (Runtime) |

> **CI** = 머지 전/직후 코드 검증  
> **Deployments** = 지금 빌드/배포 중  
> **Logs** = 사이트가 떠 있는 뒤 요청 런타임 로그  

---

## 오류 시 프론트 로그

```mermaid
flowchart TD
  A[증상] --> B{org CI 실패?}
  B -->|Yes| C[org Actions → lint / test / build]
  B -->|No| D{배포 실패?}
  D -->|Yes| E[Vercel Deployments → Building]
  D -->|No| F{서버/API 오류?}
  F -->|Yes| G[Vercel Logs Runtime]
  F -->|No| H[브라우저 F12 Console / Network]
```

| 증상 | 보는 곳 |
| --- | --- |
| PR Checks 빨강 | org Actions → `CI` |
| Build Failed | Deployments → 해당 배포 → **Building** |
| 접속 중 서버 에러 | 프로젝트 → **Logs** (Production 필터) |
| 클라이언트 UI만 깨짐 | 브라우저 **Console / Network** |
| CLI | `npx vercel logs --follow --scope ggyyoo` |

- `'use client'` 로그 → 브라우저 Console  
- Server Actions / Route Handlers → Vercel Logs  

---

## 역할 분담

| 누가 | 하는 일 |
| --- | --- |
| 팀원 | `main`에서 feature 따서 localhost:3000 테스트 후 `main` PR, org Actions CI 로그 확인 |
| FE 배포 담당 | Vercel 배포, fork sync, URL/테스트/로그 가이드 공유, Gateway URL 수신 후 env 설정 |
| Gateway / 인프라 | CORS·Origin 정책, Gateway 공개 URL 전달 |

---

## 경로 / 이름 정리

| 항목 | 값 |
| --- | --- |
| Vercel Project Name | `valuehub-fe` |
| Production Domain | `valuehub-fe.vercel.app` |
| org 레포 | `SpartaValueHub/ValueHub-FE` |
| fork 레포 | `Han-Gyo/ValueHub-FE` |
| Production Branch | `main` |
| 브랜치 전략 | `main` → feature → localhost 테스트 → `main` PR |
| fork sync | **main만** (`develop` 최신화 안 함) |

---

## 체크리스트

- [x] Vercel 프로젝트 / Production URL (`valuehub-fe`)  
- [x] Production Branch = `main`  
- [x] org `main` → fork `main` 자동 sync  
- [ ] Gateway CORS: Production + `http://localhost:3000`  
- [ ] Gateway URL → FE env / 로컬 `.env`  
- [ ] localhost ↔ Gateway 스모크 테스트  
- [ ] Production ↔ Gateway 스모크 테스트  

---

## 팀장 전달용 (복붙)

```text
FE Vercel 배포 URL 공유드립니다.

[운영 Production]
https://valuehub-fe.vercel.app

현재 FE는 main에서 작업 브랜치를 따고 main으로 PR/merge 합니다.
merge 전 테스트는 localhost:3000 + EC2 입니다.
org main merge 후 fork sync → Vercel Production이 갱신됩니다.
develop merge는 Production URL을 바꾸지 않습니다.

Gateway 공개 URL 주시면 FE env에 연결하겠습니다.
CORS 허용 Origin:
- https://valuehub-fe.vercel.app
- http://localhost:3000
```
