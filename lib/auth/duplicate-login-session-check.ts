export const AUTH_SKIP_PREFIXES = ["/signup"];

export function shouldSkipDuplicateCheck(pathname: string): boolean {
  return AUTH_SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

import { AUTH_SESSION_TERMINATED } from "@/lib/auth/duplicate-login";
import { notifyDuplicateLoginFromSessionEvent } from "@/lib/auth/handle-duplicate-login-action-result";

export type DuplicateLoginCheckDeps = {
  pathname: string;
  isModalActive: () => boolean;
  openModalIfActive: () => void;
  fetchSessionEvent?: typeof fetch;
};

export async function performDuplicateLoginCheck(
  deps: DuplicateLoginCheckDeps,
  checkingRef: { current: boolean }
): Promise<void> {
  if (shouldSkipDuplicateCheck(deps.pathname)) return;

  if (deps.isModalActive()) {
    deps.openModalIfActive();
    return;
  }

  if (checkingRef.current) return;
  checkingRef.current = true;

  try {
    const fetchFn = deps.fetchSessionEvent ?? fetch;
    const response = await fetchFn("/api/auth/session-event", {
      cache: "no-store",
      credentials: "include",
    });
    if (!response.ok) return;

    const data = (await response.json()) as {
      duplicateLogin?: boolean;
      code?: string;
      hasSessionMaterial?: boolean;
    };

    if (data.duplicateLogin !== true && data.code !== AUTH_SESSION_TERMINATED) {
      return;
    }

    notifyDuplicateLoginFromSessionEvent(data);
  } catch (error) {
    console.error("Duplicate login check failed:", error);
  } finally {
    checkingRef.current = false;
  }
}

export type SessionMonitorDeps = {
  runCheck: () => void | Promise<void>;
  addWindowFocusListener?: (handler: () => void) => () => void;
  scheduleInitialCheck?: (run: () => void) => void;
};

export function mountDuplicateLoginSessionMonitor(
  deps: SessionMonitorDeps
): () => void {
  const scheduleInitialCheck =
    deps.scheduleInitialCheck ??
    ((run) => {
      queueMicrotask(run);
    });
  const addWindowFocusListener =
    deps.addWindowFocusListener ??
    ((handler) => {
      window.addEventListener("focus", handler);
      return () => window.removeEventListener("focus", handler);
    });

  scheduleInitialCheck(() => {
    void deps.runCheck();
  });

  const onFocus = () => {
    void deps.runCheck();
  };
  const removeFocusListener = addWindowFocusListener(onFocus);

  return () => {
    removeFocusListener();
  };
}
