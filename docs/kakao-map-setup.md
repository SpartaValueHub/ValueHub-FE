# 카카오맵 FO 연동 가이드

상품 등록·수정, 채팅 위치, 예약 장소, (후속) 동네 인증 UI가 **같은 SDK·픽커**를 씁니다.

## 1. 앱·키 발급

1. [카카오 디벨로퍼스](https://developers.kakao.com/) 로그인 → 내 애플리케이션 → 앱 추가
2. **앱 키 / 플랫폼 키**에서 **JavaScript 키** 복사
   - **어드민 키는 FO에 넣지 마세요** (서버 전용·권한 큼)
3. **도메인 등록 (메뉴 개편됨 — 예전 `[플랫폼] > [Web]` 없음)**
   - 경로: **[앱] → [플랫폼 키] → [JavaScript 키] → [JavaScript SDK 도메인]**
   - 등록 예:
     - `http://localhost:3000`
     - LAN 테스트 시 `http://192.168.x.x:3000`
     - Vercel 배포 URL (예: `https://xxx.vercel.app`) — **프로토콜 포함**
4. **제품 설정 → 카카오맵 → 활성화 ON**
   - 개발자 계정 **첫 활성화 앱**에 무료 쿼터 적용

## 2. FO 환경변수

### 로컬 (`.env.local`)

```env
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=발급받은_JavaScript_키
```

- `NEXT_PUBLIC_` → 브라우저에 노출됨 (카카오 **JavaScript SDK 도메인** 제한으로 보호)
- 변경 후 **dev 서버 재시작**

### Vercel (develop / Preview / Production)

EC2는 **백엔드(API)** 이고, 카카오맵 SDK는 **브라우저(FO)** 에서 로드됩니다.  
develop FO가 Vercel에 있으면 **Vercel에도 JS 키를 넣어야** 배포 환경에서 지도가 뜹니다. (EC2 env와 별개)

1. Vercel 프로젝트 → Settings → Environment Variables
2. Name: `NEXT_PUBLIC_KAKAO_MAP_APP_KEY` / Value: JavaScript 키
   - Environment: 쓰는 환경에 체크 (Preview, Production 등)
3. 카카오 **JavaScript SDK 도메인**에 Vercel URL도 추가
4. env 추가 후 **재배포** (`NEXT_PUBLIC_` 은 빌드 시 주입)

`.env.example`에 키 이름만 문서화되어 있습니다. 실제 키는 커밋하지 마세요.

## 3. 코드에서 쓰는 법

```ts
import { loadKakaoMaps, hasKakaoMapAppKey } from "@/lib/kakao-maps";
import type { UiLocationSelection } from "@/lib/kakao-maps";
import { LocationRegisterDialog } from "@/components/molecules/overlay/LocationRegisterDialog";

// 모달 — 확정 시 { placeName, latitude, longitude }
<LocationRegisterDialog
  open={open}
  onOpenChange={setOpen}
  onConfirm={(loc: UiLocationSelection) => { /* 각자 API에 매핑 */ }}
/>
```

키가 없으면 지도 영역에 설정 안내가 뜨고, 확정은 막습니다 (크래시 없음).

## 4. 도메인별 저장

| 화면             | 저장처                                              |
| ---------------- | --------------------------------------------------- |
| 상품 등록·수정   | Product-Post `latitude` / `longitude` / `placeName` |
| 예약             | `reservations` lat/lng (채팅 담당)                  |
| 채팅 위치 메시지 | 메시지 metadata (팀 스키마)                         |
| 동네 인증        | `member_regions` + GPS 거리 비교 (후속)             |
