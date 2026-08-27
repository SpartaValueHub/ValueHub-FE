"use client";

import { useCallback, useState, type ReactNode } from "react";

import { bumpProductPostAction } from "@/actions/product-posts";
import { AlertDialog } from "@/components/molecules/overlay/AlertDialog";
import { ConfirmModal } from "@/components/molecules/overlay/ConfirmModal";
import { DialogDescription } from "@/components/molecules/overlay/Dialog";
import { notifyIfSessionExpiredAction } from "@/lib/auth/session-expired.client";
import {
  classifyBumpFailMessage,
  type BumpFailView,
} from "@/lib/product-posts/bump-error";
import type { UiProductPostDetail } from "@/types/product-posts/ui";

const CONFIRM_TITLE = "선택한 게시물을 끌어올리겠습니까?";
const CONFIRM_MESSAGE =
  "끌어올리기 진행시 해당 게시물이 상단에 노출됩니다.\n다음 끌어올리기는 12시간 후에 가능합니다.";

type UseProductPostBumpOptions = {
  productPostUuid: string;
  onSuccess?: (detail: UiProductPostDetail) => void;
};

export function useProductPostBump({
  productPostUuid,
  onSuccess,
}: UseProductPostBumpOptions) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bumping, setBumping] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [failView, setFailView] = useState<BumpFailView | null>(null);

  const requestBump = useCallback(() => {
    if (bumping) return;
    setFailView(null);
    setConfirmOpen(true);
  }, [bumping]);

  const runBump = useCallback(() => {
    if (bumping) return;
    setBumping(true);
    void (async () => {
      try {
        const res = await bumpProductPostAction(productPostUuid);
        if (!res.ok) {
          setConfirmOpen(false);
          notifyIfSessionExpiredAction(res);
          setFailView(classifyBumpFailMessage(res.message));
          return;
        }
        setConfirmOpen(false);
        onSuccess?.(res.data);
        setSuccessOpen(true);
      } catch {
        setConfirmOpen(false);
        setFailView(
          classifyBumpFailMessage(
            "끌어올리기에 실패했습니다. 다시 시도해 주세요."
          )
        );
      } finally {
        setBumping(false);
      }
    })();
  }, [bumping, onSuccess, productPostUuid]);

  const dialogs: ReactNode = (
    <>
      <ConfirmModal
        open={confirmOpen}
        title={CONFIRM_TITLE}
        message={CONFIRM_MESSAGE}
        confirmLabel={bumping ? "끌어올리는 중…" : "끌어올리기"}
        cancelLabel="취소"
        confirmPending={bumping}
        onConfirm={runBump}
        onCancel={() => {
          if (bumping) return;
          setConfirmOpen(false);
        }}
      />

      <AlertDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="끌어올렸습니다"
        primaryLabel="확인"
        onPrimary={() => setSuccessOpen(false)}
      >
        <DialogDescription className="whitespace-pre-wrap text-left text-base leading-[1.5] text-[#323232]">
          게시물이 상단에 노출됩니다.
        </DialogDescription>
      </AlertDialog>

      <AlertDialog
        open={failView != null}
        onOpenChange={(open) => {
          if (!open) setFailView(null);
        }}
        title={failView?.title ?? "게시글 끌어올리기를 실패했습니다."}
        primaryLabel="확인"
        onPrimary={() => setFailView(null)}
      >
        <DialogDescription className="whitespace-pre-wrap text-left text-base leading-[1.5] text-[#323232]">
          {failView?.lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
          {failView?.remainingLabel ? (
            <span className="mt-4 block text-center text-xl">
              다음 끌어올리기 가능 시간 :{" "}
              <span className="font-medium text-[#e97c00]">
                {failView.remainingLabel}
              </span>
            </span>
          ) : null}
        </DialogDescription>
      </AlertDialog>
    </>
  );

  return { requestBump, bumping, dialogs };
}
