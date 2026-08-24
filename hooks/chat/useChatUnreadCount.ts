"use client";

import { useEffect, useState } from "react";

import { getChatUnreadCountAction } from "@/actions/chat";

/** 헤더 뱃지 — 화면 처음 그릴 때만 GET /unread-count */
export function useChatUnreadCount(enabled: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    getChatUnreadCountAction().then((result) => {
      if (cancelled) return;
      setCount(result.ok ? result.data : 0);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return enabled ? count : 0;
}
