import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  dispatchDuplicateLoginEvent,
  DUPLICATE_LOGIN_EVENT,
  subscribeDuplicateLoginEvent,
} from "@/lib/auth/duplicate-login-event";
import {
  releaseDuplicateLoginModal,
  tryAcquireDuplicateLoginModal,
} from "@/lib/auth/duplicate-login-client";

describe("duplicate login event", () => {
  beforeEach(() => {
    vi.stubGlobal("window", new EventTarget());
  });

  afterEach(() => {
    releaseDuplicateLoginModal();
    vi.unstubAllGlobals();
  });

  it("dispatch → subscribe listener 호출", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeDuplicateLoginEvent(listener);

    dispatchDuplicateLoginEvent();

    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
  });

  it("여러 번 dispatch해도 listener는 각각 호출", () => {
    const listener = vi.fn();
    subscribeDuplicateLoginEvent(listener);

    dispatchDuplicateLoginEvent();
    dispatchDuplicateLoginEvent();

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("singleton lock와 함께 여러 이벤트 → 모달 1회만 acquire", () => {
    let acquired = 0;
    const openModal = vi.fn(() => {
      if (tryAcquireDuplicateLoginModal()) {
        acquired += 1;
      }
    });

    subscribeDuplicateLoginEvent(openModal);

    dispatchDuplicateLoginEvent();
    dispatchDuplicateLoginEvent();
    dispatchDuplicateLoginEvent();

    expect(openModal).toHaveBeenCalledTimes(3);
    expect(acquired).toBe(1);
  });

  it("unsubscribe 후 dispatch해도 listener 미호출", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeDuplicateLoginEvent(listener);

    unsubscribe();
    dispatchDuplicateLoginEvent();

    expect(listener).not.toHaveBeenCalled();
  });

  it("DUPLICATE_LOGIN_EVENT 상수", () => {
    expect(DUPLICATE_LOGIN_EVENT).toBe("vh:duplicate-login");
  });
});
