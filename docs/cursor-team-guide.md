# Cursor로 FE 작업하기 — 백엔드 개발자용 팀 가이드

> Next.js를 어느 정도 써 본 팀원이 **퍼블리싱(UI)** 을 Cursor에 시킬 때 참고하는 문서입니다.  
> API 연동 규칙·패턴은 [AGENTS.md](../AGENTS.md) · `.cursor/rules/` 를 참고하세요.

관련: [DEVELOPMENT.md](./DEVELOPMENT.md) · [project-overview.md](./project-overview.md) · [frontend-priority-and-ui-backlog.md](./frontend-priority-and-ui-backlog.md)

---

## 1. 꼭 먼저 알려줄 것

| #   | 규칙              | 한 줄                                                                        |
| --- | ----------------- | ---------------------------------------------------------------------------- |
| 1   | **컴포넌트 계층** | `atoms` → `molecules` → `organisms` → `templates` — Page는 Template만 import |
| 2   | **UI만 먼저**     | 데이터는 mock props / 상수. 연동은 별도 작업                                 |
| 3   | **패키지·커밋**   | `pnpm` only · 커밋 `feat:` + 한국어 · PR → `develop`                         |

---

## 2. Cursor에 시키는 방법 (실전)

### 2.1 `@`가 뭔데?

Cursor 채팅 입력창에서 **`@` → 파일 이름 검색 → 클릭**하면 그 파일 내용을 AI에게 같이 넘깁니다.

- **역할:** «이 파일이랑 똑같은 방식으로 해줘»라고 **예시 코드를 보여주는 것**
- **꼭 안 해도 됨:** 이미 그 파일을 열어둔 채로 «여기 42번 줄 고쳐줘»처럼 **한 파일만** 손볼 때
- **하는 게 나음:** **새 컴포넌트·새 페이지**를 만들 때 — AI가 프로젝트 전체를 뒤지게 하면 느리고 토큰도 많이 씀

> **효율적인가?** → 예, **참고 파일 1~2개만** @ 하는 건 효율적.  
> 반대로 @를 10개 넘기거나 «프로젝트 구조 파악해서~»라고 하면 **비효율**.

---

### 2.2 퍼블리싱(UI) — 복붙 예시

**예: 카드 컴포넌트 하나**

```text
ProductCard molecule 만들어줘. API 연동은 하지 마.

- 스타일: components/molecules/SigninInputField.tsx, components/atoms/button.tsx 참고
- props: { title, price, imageUrl } — page에서 mock으로 넘길 예정
- components/molecules/ProductCard.tsx 만 추가
- pnpm lint 통과까지
```

**예: 페이지 레이아웃**

```text
상품 목록 페이지 UI만. 데이터는 mock 배열 3개.

- 레이아웃: app/(header)/page.tsx, components/templates/MainTemplate.tsx 참고
- ProductCard molecule 사용 (없으면 같이 만들기)
- app/(header)/products/page.tsx + template 추가
- Page는 Template만 import
```

Figma/캡처가 있으면 **스크린샷 1장**이 긴 설명보다 낫습니다.

| 작업                 | @로 같이 넘길 참고 파일                                           |
| -------------------- | ----------------------------------------------------------------- |
| 버튼·입력 등 기본 UI | `components/atoms/button.tsx`                                     |
| 폼 필드              | `components/molecules/SigninInputField.tsx`                       |
| 페이지 골격          | `app/(header)/page.tsx` · `components/templates/MainTemplate.tsx` |

---

### 2.3 한 번에 시키지 말 것

| ❌ 비추                           | ✅ 추천                                                                                |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| «상품 목록 페이지 전부 만들어줘»  | ① ProductCard ② list template ③ page 순, PR 나누기                                     |
| «회원가입처럼 채팅도 만들어줘»    | [frontend-priority-and-ui-backlog.md](./frontend-priority-and-ui-backlog.md) Epic 단위 |
| «프로젝트 구조 분석하고 리팩터링» | «SigninInputField 스타일로 Card molecule»처럼 **구체적으로**                           |

---

## 3. 토큰 아끼면서 잘 쓰는법

### 3.1 프롬프트

| 방법                    | 설명                                                   |
| ----------------------- | ------------------------------------------------------ |
| **@ 파일 1~2개**        | 레포 전체 스캔 유도 금지. «참고 파일» 명시             |
| **스크린샷**            | Figma 링크·캡처 1장 > UI 설명 50줄                     |
| **Plan 먼저 (큰 화면)** | «코드 수정 전에 만들 파일 목록만 짧게» → OK 받고 Agent |
| **이어쓰기 최소화**     | 맥락 길어지면 **새 채팅** + @필수 파일만               |

### 3.2 Cursor 설정·습관

| 방법                | 설명                                                        |
| ------------------- | ----------------------------------------------------------- |
| **Agent vs Ask**    | «이 컴포넌트 어디에 두면 되지?» → **Ask**. 구현 → **Agent** |
| **작은 PR 단위**    | Cursor diff 작을수록 리뷰·재시도 적음                       |
| **터미널은 사람이** | `pnpm dev` 실패 로그만 붙여 «이 에러만 고쳐줘»              |

### 3.3 토큰 많이 쓰는 실수

- «코드베이스 전체 보고 ~»
- 실패한 긴 채팅 끝까지 이어가기
- 한 번에 «UI + 연동 + 리팩터»

---

## 4. 퍼블리싱 담당 — 이것만 하면 됨

1. Figma/캡처 + §2.2 예시 문장
2. `components/` + `app/` page·template만
3. mock 데이터는 `constants/` 또는 page inline
4. `pnpm lint` 통과
5. PR: 스크린샷 Before/After 첨부

---

## 5. 자주 터지는 것 (팀 공유)

| 증상                         | Cursor에 시킬 말                                               |
| ---------------------------- | -------------------------------------------------------------- |
| Husky 커밋 실패              | `pnpm lint` 로그 붙여 «eslint만 고쳐줘»                        |
| Husky push 실패 (lint/build) | `pnpm lint` 또는 `pnpm build` 로그 붙여 «에러만 고쳐줘»        |
| npm install                  | «pnpm만 사용» ([DEVELOPMENT.md](./DEVELOPMENT.md))             |
| 컴포넌트 위치 모름           | «atoms/molecules/organisms 중 어디에 두면 되는지 짧게만» (Ask) |

---

## 6. 교육·온보딩 순서 (30분 × 2)

**1차 (30분) — 규칙**

- [DEVELOPMENT.md](./DEVELOPMENT.md) 셋업 · `pnpm dev`
- §1 규칙 · [project-overview.md](./project-overview.md) 훑기

**2차 (30분) — Cursor 실습**

- «SigninInputField 스타일로 Card molecule 하나» (UI만)
- «MainTemplate 참고해서 Footer template» (UI만)
- §3 토큰 팁 짚기

---

## 7. 북마크

| 문서                                                                         | 용도                             |
| ---------------------------------------------------------------------------- | -------------------------------- |
| [frontend-priority-and-ui-backlog.md](./frontend-priority-and-ui-backlog.md) | 지금 뭐부터 할지                 |
| [project-overview.md](./project-overview.md)                                 | 컴포넌트·페이지 현황             |
| `.cursor/rules/`                                                             | Cursor 자동 규칙 (아키텍처 포함) |

---

## 8. 변경 이력

| 날짜       | 내용                                              |
| ---------- | ------------------------------------------------- |
| 2026-08-19 | API 연동 설명 제거, 퍼블리싱·Cursor 사용법만 유지 |
| 2026-08-19 | §2 실전 예시로 재작성                             |
| 2026-08-19 | 초안                                              |
