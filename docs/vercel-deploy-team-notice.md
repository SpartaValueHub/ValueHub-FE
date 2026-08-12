# ValueHub FE — Vercel 배포 안내

FE(Next.js)를 Vercel에 배포한 구성과, 팀/Gateway 담당과 맞출 URL·테스트·로그 확인 방법을 정리한다.  
실비밀값(`.env` 실값, PAT 등)은 git에 올리지 않는다.

---

## 한 줄 요약

| 구분 | 내용 |
| --- | --- |
| 운영 URL | https://valuehub-fe.vercel.app |
| Production Branch | `main` |
| 개발 테스트 | `develop` / PR → Vercel **Preview** URL |
| Git 연결 대상 | Hobby 제약으로 org private 직접 연결 불가 → 개인 fork `Han-Gyo/ValueHub-FE` |
| org → fork | `develop` / `main` push 시 자동 sync |
| Gateway CORS | Gateway 담당(팀장) 정책으로 관리. Preview는 **구체 URL**을 필요할 때 전달 |

---

## 전체 그림

```mermaid
flowchart TB
  subgraph Org["GitHub org - SpartaValueHub/ValueHub-FE"]
    FEAT["feature"] -->|PR merge| DEV["develop"]
    DEV -->|최종 PR merge| MAIN["main"]
  end

  subgraph Fork["Deploy fork - Han-Gyo/ValueHub-FE"]
    SYNC["org push 시 자동 sync"]
  end

  subgraph Vercel["Vercel - valuehub-fe"]
    PREV["Preview URL<br/>개발/테스트"]
    PROD["Production<br/>valuehub-fe.vercel.app"]
  end

  subgraph EC2["Apps EC2"]
    GW["Gateway"]
  end

  DEV --> SYNC
  MAIN --> SYNC
  SYNC -->|develop / PR| PREV
  SYNC -->|main| PROD
  PREV -.->|API| GW
  PROD -.->|API| GW
```

포인트:
- 일상 개발은 **org 레포** 기준
- Vercel Git은 **개인 fork**에 연결
- org merge → fork sync → Vercel Preview / Production 반영

---

## Production URL이 예전에 보였던 이유

Git Production Branch를 `main`으로 걸어둬도, **예전에 CLI로 올린 develop 스냅샷**이 Production에 남아 있으면 그 화면이 계속 보일 수 있다.  
`main`에 push/merge가 일어나야 Production이 main 코드로 갱신된다.

```mermaid
flowchart LR
  A["CLI develop 스냅샷 배포"] --> B["운영 URL에 잔존 가능"]
  C["Git Production = main 설정"] -.->|연결만으로는 즉시 교체 안 됨| B
  D["main push / merge"] --> E["Production이 main으로 갱신"]
```

| 질문 | 답 |
| --- | --- |
| Production Branch = `main`? | O |
| `main`에 코드가 없나? | X (develop보다 예전일 수 있음) |
| 언제 main 코드로 바뀌나? | `main` push / merge 시 |

---

## 코드 배포 흐름 (FE)

```mermaid
flowchart LR
  subgraph Dev["개발"]
    A1["feature PR"] --> A2["org develop merge"]
    A2 --> A3["fork sync"]
    A3 --> A4["Vercel Preview"]
  end

  subgraph Prod["운영"]
    B1["develop → main merge"] --> B2["fork sync"]
    B2 --> B3["Vercel Production"]
  end
```

| 무엇을 했나 | 결과 |
| --- | --- |
| org `develop` / PR merge | Preview URL 생성 (Deployments에서 확인) |
| org `main` merge | https://valuehub-fe.vercel.app 갱신 |

---

## URL / 링크

| 항목 | 값 |
| --- | --- |
| Production | https://valuehub-fe.vercel.app |
| Vercel 프로젝트 | https://vercel.com/ggyyoo/valuehub-fe |
| org FE 레포 | https://github.com/SpartaValueHub/ValueHub-FE |
| 배포용 fork | https://github.com/Han-Gyo/ValueHub-FE |
| fork sync Actions | https://github.com/Han-Gyo/ValueHub-FE/actions |

Preview URL은 배포마다 달라진다.  
**Vercel → valuehub-fe → Deployments** 에서 Environment=`Preview` 항목의 URL을 사용한다.

---

## Gateway와 맞추는 방법

```mermaid
sequenceDiagram
  participant FE as FE 담당
  participant V as Vercel
  participant GW as Gateway 담당
  participant EC2 as Apps EC2 Gateway

  FE->>GW: Production URL 공유
  Note over FE,GW: Preview가 필요하면 Deployments의 구체 URL을 전달
  GW->>EC2: CORS / Origin 정책 반영
  GW->>FE: Gateway 공개 Base URL 전달
  FE->>V: API_URL 등 env 설정
  Note over FE,EC2: Preview / Production 연동 테스트
```

### FE → Gateway 담당에 주는 것

| 환경 | URL |
| --- | --- |
| Production | `https://valuehub-fe.vercel.app` |
| Preview | Deployments에서 확인한 **구체 URL** (필요할 때) |

### Gateway → FE에 주시면 되는 것

```text
API_URL={GATEWAY}/auth-service
MEMBER_API_URL={GATEWAY}/member-service
CATEGORY_API_URL={GATEWAY}/category-service
AUTH_TRUSTED_ORIGIN=https://valuehub-fe.vercel.app
```

---

## Vercel 테스트 절차

### Preview (develop / feature)

1. org `SpartaValueHub/ValueHub-FE`에 PR merge  
2. fork sync 확인: Actions  
3. https://vercel.com/ggyyoo/valuehub-fe → **Deployments**  
4. Preview 배포 **Visit**  
5. Gateway 연동 필요 시 해당 Preview URL을 Gateway 담당에 전달 후 API 테스트  

### Production (main)

1. `develop` → `main` merge  
2. Deployments에서 Production Ready 확인  
3. https://valuehub-fe.vercel.app 접속  

### 체크

- [ ] 배포 Status = Ready  
- [ ] Preview / Production 혼동 없음  
- [ ] 해당 Environment env 존재  
- [ ] 시크릿 창 / Hard Refresh로 캐시 배제  

---

## 오류 시 프론트 로그

```mermaid
flowchart TD
  A[증상] --> B{배포 실패?}
  B -->|Yes| C[Deployments → Building 로그]
  B -->|No| D{서버/API 오류?}
  D -->|Yes| E[프로젝트 Logs Runtime]
  D -->|No| F[브라우저 F12 Console / Network]
```

| 증상 | 보는 곳 |
| --- | --- |
| Build Failed | Deployments → 해당 배포 → **Building** |
| 접속 중 서버 에러 | 프로젝트 → **Logs** (Preview/Production 필터) |
| 클라이언트 UI만 깨짐 | 브라우저 **Console / Network** |
| CLI | `npx vercel logs --follow --scope ggyyoo` |

- `'use client'` 로그 → 브라우저 Console  
- Server Actions / Route Handlers → Vercel Logs  

---

## 역할 분담

| 누가 | 하는 일 |
| --- | --- |
| FE | Vercel 배포, fork sync, URL/테스트/로그 가이드 공유, Gateway URL 수신 후 env 설정 |
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

---

## 체크리스트

- [x] Vercel 프로젝트 / Production URL (`valuehub-fe`)  
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
https://valuehub-fe.vercel.app

[테스트 Preview]
develop/PR 배포마다 Vercel Deployments에 Preview URL이 생성됩니다.
- 확인: Vercel → valuehub-fe → Deployments
- 필요한 Preview Origin은 배포 URL 확인 후 전달드리겠습니다.

Gateway 공개 URL 주시면 FE env에 연결하겠습니다.
CORS 허용 범위는 Gateway 쪽 정책으로 부탁드립니다.
```
