"use client";

import { useState, useTransition } from "react";
import { v4 as uuidv4 } from "uuid";

import { confirmIdentityVerificationAction } from "@/actions/identity-verification";
import { logSafeError } from "@/lib/log/safe-log";
import type { GenderOption } from "@/components/molecules/auth/GenderToggle";
import type { ApiGender } from "@/types/auth/api";
import type { SignupInput } from "@/types/auth/signup";

function mapApiGender(gender?: ApiGender): GenderOption | undefined {
  if (gender === "MALE") return "male";
  if (gender === "FEMALE") return "female";
  return undefined;
}

type IdentityPrefill = Pick<SignupInput, "name" | "phone">;

export function useIdentityVerification(
  onPrefill: (values: IdentityPrefill) => void
) {
  const [requestToken, setRequestToken] = useState("");
  const [identityMessage, setIdentityMessage] = useState<string>();
  const [gender, setGender] = useState<GenderOption | undefined>();
  const [isVerifying, startVerifyTransition] = useTransition();

  const isIdentityVerified = Boolean(requestToken);

  function handleIdentityVerification() {
    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID?.trim();
    const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY?.trim();
    if (!storeId || !channelKey) {
      setIdentityMessage("PortOne Store ID·Channel Key를 설정해 주세요.");
      return;
    }

    startVerifyTransition(async () => {
      setIdentityMessage(undefined);
      try {
        const { requestIdentityVerification } =
          await import("@portone/browser-sdk/v2");
        const identityVerificationId = `identity-verification-${uuidv4()}`;
        const response = await requestIdentityVerification({
          storeId,
          channelKey,
          identityVerificationId,
          popup: { center: true },
        });

        if (!response) {
          setIdentityMessage("본인인증 응답이 없습니다.");
          return;
        }

        if (response.code !== undefined) {
          setIdentityMessage(response.message ?? "본인인증에 실패했습니다.");
          return;
        }

        const confirmResult = await confirmIdentityVerificationAction(
          response.identityVerificationId ?? identityVerificationId
        );
        if (!confirmResult.ok) {
          setIdentityMessage(confirmResult.message);
          return;
        }

        const { data } = confirmResult;
        setRequestToken(data.requestToken);
        const verifiedGender = mapApiGender(data.gender);
        if (verifiedGender) {
          setGender(verifiedGender);
        }
        onPrefill({
          name: data.memberName ?? "",
          phone: data.phoneNumber?.replace(/\D/g, "") ?? "",
        });
        setIdentityMessage("본인인증이 완료되었습니다.");
      } catch (error) {
        logSafeError("Identity verification failed:", error);
        setIdentityMessage("본인인증 처리 중 오류가 발생했습니다.");
      }
    });
  }

  return {
    requestToken,
    identityMessage,
    gender,
    isVerifying,
    isIdentityVerified,
    handleIdentityVerification,
    setIdentityMessage,
  };
}
