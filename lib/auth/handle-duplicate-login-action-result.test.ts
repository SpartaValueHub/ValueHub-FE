import { afterEach, describe, expect, it, vi } from "vitest";

import { AUTH_SESSION_TERMINATED } from "@/lib/auth/duplicate-login";

vi.mock("@/lib/auth/duplicate-login-event", () => ({
  dispatchDuplicateLoginEvent: vi.fn(),
}));

import { dispatchDuplicateLoginEvent } from "@/lib/auth/duplicate-login-event";
import {
  handleDuplicateLoginActionResult,
  notifyDuplicateLoginFromSessionEvent,
} from "@/lib/auth/handle-duplicate-login-action-result";

const mockDispatch = vi.mocked(dispatchDuplicateLoginEvent);

describe("handleDuplicateLoginActionResult", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("AUTH_SESSION_TERMINATED → dispatch, true 반환", () => {
    const handled = handleDuplicateLoginActionResult({
      ok: false,
      code: AUTH_SESSION_TERMINATED,
    });

    expect(handled).toBe(true);
    expect(mockDispatch).toHaveBeenCalledOnce();
  });

  it("INVALID_TOKEN → dispatch 없음, false", () => {
    const handled = handleDuplicateLoginActionResult({
      ok: false,
      code: "INVALID_TOKEN",
    });

    expect(handled).toBe(false);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("generic 401 message only → dispatch 없음", () => {
    const handled = handleDuplicateLoginActionResult({
      ok: false,
      message: "unauthorized",
    });

    expect(handled).toBe(false);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("ok:true → dispatch 없음", () => {
    handleDuplicateLoginActionResult({ ok: true });
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});

describe("notifyDuplicateLoginFromSessionEvent", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("duplicateLogin=true → dispatch", () => {
    const notified = notifyDuplicateLoginFromSessionEvent({
      duplicateLogin: true,
    });

    expect(notified).toBe(true);
    expect(mockDispatch).toHaveBeenCalledOnce();
  });

  it("code AUTH_SESSION_TERMINATED → dispatch", () => {
    const notified = notifyDuplicateLoginFromSessionEvent({
      code: AUTH_SESSION_TERMINATED,
    });

    expect(notified).toBe(true);
    expect(mockDispatch).toHaveBeenCalledOnce();
  });

  it("duplicateLogin=false → dispatch 없음", () => {
    const notified = notifyDuplicateLoginFromSessionEvent({
      duplicateLogin: false,
    });

    expect(notified).toBe(false);
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
