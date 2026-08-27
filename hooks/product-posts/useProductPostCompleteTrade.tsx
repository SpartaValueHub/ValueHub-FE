"use client";

import { useCallback, useState, type ReactNode } from "react";

import { updateProductPostTradeStatusAction } from "@/actions/product-posts";
import { AlertDialog } from "@/components/molecules/overlay/AlertDialog";
import { ConfirmModal } from "@/components/molecules/overlay/ConfirmModal";
import { DialogDescription } from "@/components/molecules/overlay/Dialog";
import { notifyIfSessionExpiredAction } from "@/lib/auth/session-expired.client";
import type { UiProductPostDetail } from "@/types/product-posts/ui";

/** Figma finish (572:522) */
const CONFIRM_TITLE = "거래를 완료하시겠습니까?";
const CONFIRM_MESSAGE = "완료된 거래는 되돌릴 수 없습니다.";

type UseProductPostCompleteTradeOptions = {
  productPostUuid: string;
  onSuccess?: (detail: UiProductPostDetail) => void;
};

function failMessage(message?: string, code?: string): string {
  if (code === "INVALID_ARGUMENT") {
    return message?.trim() || "현재 상태에서는 거래를 완료할 수 없습니다.";
  }
  if (code === "FORBIDDEN") {
    return "본인 판매글만 거래를 완료할 수 있습니다.";
  }
  if (code === "PRODUCT_POST_NOT_FOUND") {
    return "판매글을 찾을 수 없습니다.";
  }
  return message?.trim() || "거래 완료에 실패했습니다. 다시 시도해 주세요.";
}

export function useProductPostCompleteTrade({
  productPostUuid,
  onSuccess,
}: UseProductPostCompleteTradeOptions) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [failOpen, setFailOpen] = useState(false);
  const [failText, setFailText] = useState("");

  const requestComplete = useCallback(() => {
    if (completing) return;
    setFailOpen(false);
    setConfirmOpen(true);
  }, [completing]);

  const runComplete = useCallback(() => {
    if (completing) return;
    setCompleting(true);
    void (async () => {
      try {
        const res = await updateProductPostTradeStatusAction(
          productPostUuid,
          "SOLD_OUT"
        );
        if (!res.ok) {
          setConfirmOpen(false);
          notifyIfSessionExpiredAction(res);
          setFailText(failMessage(res.message, res.code));
          setFailOpen(true);
          return;
        }
        setConfirmOpen(false);
        onSuccess?.(res.data);
        setSuccessOpen(true);
      } catch {
        setConfirmOpen(false);
        setFailText("거래 완료에 실패했습니다. 다시 시도해 주세요.");
        setFailOpen(true);
      } finally {
        setCompleting(false);
      }
    })();
  }, [completing, onSuccess, productPostUuid]);

  const dialogs: ReactNode = (
    <>
      <ConfirmModal
        open={confirmOpen}
        title={CONFIRM_TITLE}
        message={CONFIRM_MESSAGE}
        confirmLabel={completing ? "처리 중…" : "거래 완료"}
        cancelLabel="취소"
        confirmPending={completing}
        onConfirm={runComplete}
        onCancel={() => {
          if (completing) return;
          setConfirmOpen(false);
        }}
      />

      <AlertDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="거래가 완료되었습니다."
        primaryLabel="확인"
        onPrimary={() => setSuccessOpen(false)}
      />

      <AlertDialog
        open={failOpen}
        onOpenChange={setFailOpen}
        title="거래 완료 실패"
        primaryLabel="확인"
        onPrimary={() => setFailOpen(false)}
      >
        <DialogDescription className="whitespace-pre-wrap text-left text-base leading-[1.5] text-[#323232]">
          {failText}
        </DialogDescription>
      </AlertDialog>
    </>
  );

  return { requestComplete, completing, dialogs };
}
