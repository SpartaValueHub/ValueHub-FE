import { describe, expect, it } from "vitest";

import {
  formatAccountLockedMessage,
  formatRateLimitedMessage,
  signInErrorMessage,
} from "@/lib/auth/signin-errors";

const ACCOUNT_LOCKED_FALLBACK =
  "로그인이 일시적으로 제한되었습니다. 잠시 후 다시 시도해 주세요.";

const RATE_LIMITED_FALLBACK =
  "로그인 요청이 많습니다. 잠시 후 다시 시도해 주세요.";

describe("formatAccountLockedMessage", () => {
  it("120초 → 2분", () => {
    expect(formatAccountLockedMessage(120)).toBe(
      "로그인이 일시적으로 제한되었습니다. 2분 후 다시 시도해 주세요."
    );
  });

  it("61초 → 2분", () => {
    expect(formatAccountLockedMessage(61)).toBe(
      "로그인이 일시적으로 제한되었습니다. 2분 후 다시 시도해 주세요."
    );
  });

  it("60초 → 1분", () => {
    expect(formatAccountLockedMessage(60)).toBe(
      "로그인이 일시적으로 제한되었습니다. 1분 후 다시 시도해 주세요."
    );
  });

  it("45초 → 45초", () => {
    expect(formatAccountLockedMessage(45)).toBe(
      "로그인이 일시적으로 제한되었습니다. 45초 후 다시 시도해 주세요."
    );
  });

  it("1초 → 1초", () => {
    expect(formatAccountLockedMessage(1)).toBe(
      "로그인이 일시적으로 제한되었습니다. 1초 후 다시 시도해 주세요."
    );
  });

  it("undefined → 일반 메시지", () => {
    expect(formatAccountLockedMessage(undefined)).toBe(ACCOUNT_LOCKED_FALLBACK);
  });

  it("0 → 일반 메시지", () => {
    expect(formatAccountLockedMessage(0)).toBe(ACCOUNT_LOCKED_FALLBACK);
  });

  it("음수 → 일반 메시지", () => {
    expect(formatAccountLockedMessage(-10)).toBe(ACCOUNT_LOCKED_FALLBACK);
  });
});

describe("formatRateLimitedMessage", () => {
  it("120초 → 2분", () => {
    expect(formatRateLimitedMessage(120)).toBe(
      "로그인 요청이 많습니다. 2분 후 다시 시도해 주세요."
    );
  });

  it("45초 → 45초", () => {
    expect(formatRateLimitedMessage(45)).toBe(
      "로그인 요청이 많습니다. 45초 후 다시 시도해 주세요."
    );
  });

  it("undefined → 일반 메시지", () => {
    expect(formatRateLimitedMessage(undefined)).toBe(RATE_LIMITED_FALLBACK);
  });
});

describe("signInErrorMessage", () => {
  it("AUTH_ACCOUNT_LOCKED는 retryAfterSeconds로 메시지 생성", () => {
    expect(
      signInErrorMessage({
        code: "AUTH_ACCOUNT_LOCKED",
        message: "계정이 잠겼습니다.",
        retryAfterSeconds: 120,
      })
    ).toBe("로그인이 일시적으로 제한되었습니다. 2분 후 다시 시도해 주세요.");
  });

  it("AUTH_ACCOUNT_LOCKED는 백엔드 message를 노출하지 않음", () => {
    expect(
      signInErrorMessage({
        code: "AUTH_ACCOUNT_LOCKED",
        message: "AUTH_ACCOUNT_LOCKED",
        retryAfterSeconds: 45,
      })
    ).toBe("로그인이 일시적으로 제한되었습니다. 45초 후 다시 시도해 주세요.");
  });

  it("AUTH_CAPTCHA_REQUIRED 메시지 유지", () => {
    expect(
      signInErrorMessage({
        code: "AUTH_CAPTCHA_REQUIRED",
        message: "로그인 시도가 많습니다. 보안 확인을 완료해 주세요.",
      })
    ).toBe("로그인 시도가 많습니다. 보안 확인을 완료해 주세요.");
  });

  it("AUTH_RATE_LIMITED는 retryAfterSeconds로 메시지 생성", () => {
    expect(
      signInErrorMessage({
        code: "AUTH_RATE_LIMITED",
        message: "로그인 요청이 많습니다. 잠시 후 다시 시도해 주세요.",
        retryAfterSeconds: 60,
      })
    ).toBe("로그인 요청이 많습니다. 1분 후 다시 시도해 주세요.");
  });

  it("AUTH_RATE_LIMITED는 계정 잠금 문구를 사용하지 않음", () => {
    expect(
      signInErrorMessage({
        code: "AUTH_RATE_LIMITED",
        message: "계정이 잠겼습니다.",
        retryAfterSeconds: 45,
      })
    ).toBe("로그인 요청이 많습니다. 45초 후 다시 시도해 주세요.");
  });

  it("AUTH_UNAUTHORIZED 메시지 유지", () => {
    expect(
      signInErrorMessage({
        code: "AUTH_UNAUTHORIZED",
        message: "아이디 또는 비밀번호가 올바르지 않습니다.",
      })
    ).toBe("아이디 또는 비밀번호가 올바르지 않습니다.");
  });
});
