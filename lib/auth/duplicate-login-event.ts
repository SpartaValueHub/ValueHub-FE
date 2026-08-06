/** 클라이언트 전용 duplicate login CustomEvent — window에서만 동작 */

export const DUPLICATE_LOGIN_EVENT = "vh:duplicate-login";

export function dispatchDuplicateLoginEvent(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DUPLICATE_LOGIN_EVENT));
}

export function subscribeDuplicateLoginEvent(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = () => listener();
  window.addEventListener(DUPLICATE_LOGIN_EVENT, handler);
  return () => window.removeEventListener(DUPLICATE_LOGIN_EVENT, handler);
}
