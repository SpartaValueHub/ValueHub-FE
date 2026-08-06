/** 클라이언트 전역 singleton — 동시 이벤트·session-event 검사 시 모달 중복 표시 방지 */

let modalActive = false;

export function tryAcquireDuplicateLoginModal(): boolean {
  if (modalActive) return false;
  modalActive = true;
  return true;
}

export function releaseDuplicateLoginModal(): void {
  modalActive = false;
}

export function isDuplicateLoginModalActive(): boolean {
  return modalActive;
}
