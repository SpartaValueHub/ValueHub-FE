import { afterEach, describe, expect, it } from "vitest";

import {
  releaseDuplicateLoginModal,
  tryAcquireDuplicateLoginModal,
} from "@/lib/auth/duplicate-login-client";

describe("duplicate login modal singleton", () => {
  afterEach(() => {
    releaseDuplicateLoginModal();
  });

  it("tryAcquire는 첫 호출만 true", () => {
    expect(tryAcquireDuplicateLoginModal()).toBe(true);
    expect(tryAcquireDuplicateLoginModal()).toBe(false);
  });
});
