"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { withdrawMemberAction } from "@/actions/auth";
import { confirmIdentityVerificationAction } from "@/actions/identity-verification";
import { MyPageGhostButton } from "@/components/molecules/mypage/MyPageGhostButton";
import { ConfirmModal } from "@/components/molecules/overlay/ConfirmModal";
import { logSafeError } from "@/lib/log/safe-log";
import { cn } from "@/lib/utils";

interface MyPageWithdrawButtonProps {
  className?: string;
}

/**
 * 마이페이지 탈퇴하기 — ConfirmModal + PASS(WITHDRAWAL) → POST /auth/withdraw
 */
export function MyPageWithdrawButton({ className }: MyPageWithdrawButtonProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onOpenConfirm = () => {
    if (pending) return;
    setError(null);
    setConfirmOpen(true);
  };

  const onCancel = () => {
    if (pending) return;
    setConfirmOpen(false);
    setError(null);
  };

  const onConfirmWithdraw = () => {
    if (pending) return;

    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID?.trim();
    const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY?.trim();
    if (!storeId || !channelKey) {
      setError("PortOne Store ID·Channel Key를 설정해 주세요.");
      return;
    }

    setPending(true);
    setError(null);

    void (async () => {
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
          setError("본인인증 응답이 없습니다.");
          return;
        }
        if (response.code !== undefined) {
          setError(response.message ?? "본인인증에 실패했습니다.");
          return;
        }

        const confirmResult = await confirmIdentityVerificationAction(
          response.identityVerificationId ?? identityVerificationId,
          "WITHDRAWAL"
        );
        if (!confirmResult.ok) {
          setError(confirmResult.message);
          return;
        }

        const withdrawResult = await withdrawMemberAction(
          confirmResult.data.requestToken
        );
        if (!withdrawResult.ok) {
          setError(withdrawResult.message);
          return;
        }

        setConfirmOpen(false);
        await signOut({ redirect: false });
        router.replace("/");
        router.refresh();
      } catch (e) {
        logSafeError("Member withdraw failed:", e);
        setError("회원 탈퇴 중 오류가 발생했습니다. 다시 시도해 주세요.");
      } finally {
        setPending(false);
      }
    })();
  };

  return (
    <>
      <MyPageGhostButton
        className={cn("w-[134px]", className)}
        onClick={onOpenConfirm}
        disabled={pending}
      >
        탈퇴하기
      </MyPageGhostButton>

      <ConfirmModal
        open={confirmOpen}
        title="회원 탈퇴"
        message={
          error
            ? error
            : "탈퇴하려면 PASS 본인인증이 필요합니다.\n인증 후 계정이 탈퇴 처리되며 되돌릴 수 없습니다."
        }
        confirmLabel={pending ? "처리 중…" : "본인인증 후 탈퇴"}
        cancelLabel="취소"
        onConfirm={onConfirmWithdraw}
        onCancel={onCancel}
        confirmPending={pending}
        confirmFilled
        dismissible={!pending}
      />
    </>
  );
}
