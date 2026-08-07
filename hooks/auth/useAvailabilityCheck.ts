"use client";

import { useState, useTransition } from "react";

import {
  checkEmailAvailabilityAction,
  checkLoginIdAvailabilityAction,
  checkNicknameAvailabilityAction,
} from "@/actions/auth";

type AvailabilityCheckState = {
  message?: string;
  tone?: "success" | "error";
  checkedValue?: string;
};

export function useAvailabilityCheck() {
  const [loginIdCheck, setLoginIdCheck] = useState<AvailabilityCheckState>({});
  const [emailCheck, setEmailCheck] = useState<AvailabilityCheckState>({});
  const [nicknameCheck, setNicknameCheck] = useState<AvailabilityCheckState>(
    {}
  );
  const [isCheckingLoginId, startLoginIdCheck] = useTransition();
  const [isCheckingEmail, startEmailCheck] = useTransition();
  const [isCheckingNickname, startNicknameCheck] = useTransition();

  function clearLoginIdCheck() {
    setLoginIdCheck({});
  }

  function clearEmailCheck() {
    setEmailCheck({});
  }

  function clearNicknameCheck() {
    setNicknameCheck({});
  }

  function checkLoginId(loginId: string) {
    const trimmed = loginId.trim();
    startLoginIdCheck(async () => {
      const result = await checkLoginIdAvailabilityAction(trimmed);
      const success = result.ok && result.available;
      setLoginIdCheck({
        message: result.message,
        tone: success ? "success" : "error",
        checkedValue: success ? trimmed : undefined,
      });
    });
  }

  function checkEmail(email: string) {
    const trimmed = email.trim();
    startEmailCheck(async () => {
      const result = await checkEmailAvailabilityAction(trimmed);
      const success = result.ok && result.available;
      setEmailCheck({
        message: result.message,
        tone: success ? "success" : "error",
        checkedValue: success ? trimmed : undefined,
      });
    });
  }

  function checkNickname(nickname: string) {
    const trimmed = nickname.trim();
    startNicknameCheck(async () => {
      const result = await checkNicknameAvailabilityAction(trimmed);
      const success = result.ok && result.available;
      setNicknameCheck({
        message: result.message,
        tone: success ? "success" : "error",
        checkedValue: success ? trimmed : undefined,
      });
    });
  }

  function verifyLoginId(currentValue: string): string | undefined {
    const trimmed = currentValue.trim();
    if (loginIdCheck.tone !== "success" || !loginIdCheck.checkedValue) {
      return "아이디 중복 확인을 해주세요.";
    }
    if (trimmed !== loginIdCheck.checkedValue) {
      return "아이디가 변경되었습니다. 다시 중복 확인해 주세요.";
    }
    return undefined;
  }

  function verifyEmail(currentValue: string): string | undefined {
    const trimmed = currentValue.trim();
    if (emailCheck.tone !== "success" || !emailCheck.checkedValue) {
      return "이메일 중복 확인을 해주세요.";
    }
    if (trimmed !== emailCheck.checkedValue) {
      return "이메일이 변경되었습니다. 다시 중복 확인해 주세요.";
    }
    return undefined;
  }

  function verifyNickname(currentValue: string): string | undefined {
    const trimmed = currentValue.trim();
    if (nicknameCheck.tone !== "success" || !nicknameCheck.checkedValue) {
      return "닉네임 중복 확인을 해주세요.";
    }
    if (trimmed !== nicknameCheck.checkedValue) {
      return "닉네임이 변경되었습니다. 다시 중복 확인해 주세요.";
    }
    return undefined;
  }

  return {
    loginIdCheck,
    emailCheck,
    nicknameCheck,
    isCheckingLoginId,
    isCheckingEmail,
    isCheckingNickname,
    checkLoginId,
    checkEmail,
    checkNickname,
    clearLoginIdCheck,
    clearEmailCheck,
    clearNicknameCheck,
    verifyLoginId,
    verifyEmail,
    verifyNickname,
  };
}
