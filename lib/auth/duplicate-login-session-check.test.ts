import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/handle-duplicate-login-action-result", () => ({
  notifyDuplicateLoginFromSessionEvent: vi.fn(),
}));

import { releaseDuplicateLoginModal } from "@/lib/auth/duplicate-login-client";
import {
  mountDuplicateLoginSessionMonitor,
  performDuplicateLoginCheck,
  shouldSkipDuplicateCheck,
} from "@/lib/auth/duplicate-login-session-check";
import { notifyDuplicateLoginFromSessionEvent } from "@/lib/auth/handle-duplicate-login-action-result";

const mockNotify = vi.mocked(notifyDuplicateLoginFromSessionEvent);

describe("shouldSkipDuplicateCheck", () => {
  it("/signup은 세션 이벤트 검사를 건너뛴다", () => {
    expect(shouldSkipDuplicateCheck("/signup")).toBe(true);
    expect(shouldSkipDuplicateCheck("/signin")).toBe(false);
    expect(shouldSkipDuplicateCheck("/chat")).toBe(false);
  });
});

describe("mountDuplicateLoginSessionMonitor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("마운트 시 session-event 검사 1회만 실행", async () => {
    const runCheck = vi.fn();
    let scheduled = false;

    mountDuplicateLoginSessionMonitor({
      runCheck,
      scheduleInitialCheck: (run) => {
        scheduled = true;
        run();
      },
      addWindowFocusListener: () => () => {},
    });

    expect(scheduled).toBe(true);
    expect(runCheck).toHaveBeenCalledOnce();

    await vi.advanceTimersByTimeAsync(65_000);

    expect(runCheck).toHaveBeenCalledOnce();
  });

  it("focus 시 추가 session-event 검사 실행", () => {
    const runCheck = vi.fn();
    let focusHandler: (() => void) | undefined;

    mountDuplicateLoginSessionMonitor({
      runCheck,
      scheduleInitialCheck: (run) => run(),
      addWindowFocusListener: (handler) => {
        focusHandler = handler;
        return () => {};
      },
    });

    expect(runCheck).toHaveBeenCalledOnce();

    focusHandler?.();
    expect(runCheck).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(65_000);
    expect(runCheck).toHaveBeenCalledTimes(2);
  });

  it("언마운트 후 focus해도 추가 검사 없음", () => {
    const runCheck = vi.fn();
    let focusHandler: (() => void) | undefined;

    const unmount = mountDuplicateLoginSessionMonitor({
      runCheck,
      scheduleInitialCheck: (run) => run(),
      addWindowFocusListener: (handler) => {
        focusHandler = handler;
        return () => {
          focusHandler = undefined;
        };
      },
    });

    expect(runCheck).toHaveBeenCalledOnce();
    unmount();
    focusHandler?.();
    expect(runCheck).toHaveBeenCalledOnce();
  });
});

describe("performDuplicateLoginCheck", () => {
  afterEach(() => {
    releaseDuplicateLoginModal();
    vi.clearAllMocks();
  });

  it("동시 focus 요청 시 checkingRef로 fetch 1회만", async () => {
    let resolveFetch: ((value: Response) => void) | undefined;
    const fetchSessionEvent = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        })
    );

    const checkingRef = { current: false };

    const first = performDuplicateLoginCheck(
      {
        pathname: "/chat",
        isModalActive: () => false,
        openModalIfActive: vi.fn(),
        fetchSessionEvent,
      },
      checkingRef
    );
    const second = performDuplicateLoginCheck(
      {
        pathname: "/chat",
        isModalActive: () => false,
        openModalIfActive: vi.fn(),
        fetchSessionEvent,
      },
      checkingRef
    );

    expect(fetchSessionEvent).toHaveBeenCalledOnce();

    resolveFetch?.({
      ok: true,
      json: async () => ({ duplicateLogin: false }),
    } as Response);

    await Promise.all([first, second]);
    expect(fetchSessionEvent).toHaveBeenCalledOnce();
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it("duplicateLogin=true이면 notifyDuplicateLoginFromSessionEvent 호출", async () => {
    const fetchSessionEvent = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        duplicateLogin: true,
        code: "AUTH_SESSION_TERMINATED",
      }),
    } as Response);

    await performDuplicateLoginCheck(
      {
        pathname: "/signin",
        isModalActive: () => false,
        openModalIfActive: vi.fn(),
        fetchSessionEvent,
      },
      { current: false }
    );

    expect(fetchSessionEvent).toHaveBeenCalledOnce();
    expect(mockNotify).toHaveBeenCalledWith({
      duplicateLogin: true,
      code: "AUTH_SESSION_TERMINATED",
    });
  });

  it("모달이 이미 활성화되어 있으면 fetch 없이 openModalIfActive 호출", async () => {
    const fetchSessionEvent = vi.fn();
    const openModalIfActive = vi.fn();

    await performDuplicateLoginCheck(
      {
        pathname: "/signin",
        isModalActive: () => true,
        openModalIfActive,
        fetchSessionEvent,
      },
      { current: false }
    );

    expect(openModalIfActive).toHaveBeenCalledOnce();
    expect(fetchSessionEvent).not.toHaveBeenCalled();
  });

  it("/signup에서는 session-event fetch를 하지 않는다", async () => {
    const fetchSessionEvent = vi.fn();

    await performDuplicateLoginCheck(
      {
        pathname: "/signup",
        isModalActive: () => false,
        openModalIfActive: vi.fn(),
        fetchSessionEvent,
      },
      { current: false }
    );

    expect(fetchSessionEvent).not.toHaveBeenCalled();
  });
});
