"use client";

import { useEffect, useState } from "react";

export function useChatUnreadCount(enabled: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/chat/unread-count", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = (await res.json()) as { totalUnreadCount?: number };
        if (!cancelled) {
          setCount(json.totalUnreadCount ?? 0);
        }
      } catch {
        /* 헤더 뱃지 실패는 화면을 막지 않음 */
      }
    }

    void load();
    const onFocus = () => {
      void load();
    };
    window.addEventListener("focus", onFocus);
    const timer = window.setInterval(() => {
      void load();
    }, 60_000);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      window.clearInterval(timer);
    };
  }, [enabled]);

  return enabled ? count : 0;
}
