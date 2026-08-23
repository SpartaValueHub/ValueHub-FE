"use client";

import { SESSION_EXPIRED_CODE } from "@/constants/auth-session";

export const SESSION_EXPIRED_EVENT = "vh:session-expired";

/** Auth 세션 만료 시 헤더 SessionContext를 비로그인으로 맞춤 (토스트·리다이렉트 없음) */
export function notifySessionExpired() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

export function notifyIfSessionExpiredAction(result: {
  ok: boolean;
  code?: string;
}) {
  if (!result.ok && result.code === SESSION_EXPIRED_CODE) {
    notifySessionExpired();
  }
}
