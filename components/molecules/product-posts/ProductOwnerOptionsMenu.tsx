"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteProductPostAction } from "@/actions/product-posts";
import { Icon, type SystemIconName } from "@/components/atoms/icons";
import { ConfirmModal } from "@/components/molecules/overlay/ConfirmModal";
import { Popover } from "@/components/molecules/overlay/Popover";
import {
  PRODUCT_POSTS_PATH,
  productPostEditPath,
} from "@/constants/product-posts";
import { useProductPostBump } from "@/hooks/product-posts/useProductPostBump";
import { notifyIfSessionExpiredAction } from "@/lib/auth/session-expired.client";
import { cn } from "@/lib/utils";

type OwnerMenuItem = {
  key: "bump" | "edit" | "delete";
  label: string;
  icon: SystemIconName;
  /** false면 비활성(opacity) — 수정은 SELLING만, 끌올도 SELLING만 */
  enabled: boolean;
};

interface ProductOwnerOptionsMenuProps {
  productPostUuid: string;
  /** BE PUT·bump는 SELLING만 허용 — false면 「수정하기」「끌어올리기」 비활성 */
  canEdit?: boolean;
  className?: string;
}

/**
 * Figma option_product_detail (518:862)
 * — owner 전용 ⋯ 메뉴. 끌어올리기·삭제·수정(SELLING) 연동.
 */
export function ProductOwnerOptionsMenu({
  productPostUuid,
  canEdit = false,
  className,
}: ProductOwnerOptionsMenuProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    requestBump,
    bumping,
    dialogs: bumpDialogs,
  } = useProductPostBump({
    productPostUuid,
    onSuccess: () => {
      router.refresh();
    },
  });

  const menuItems: OwnerMenuItem[] = [
    {
      key: "bump",
      label: "끌어올리기",
      icon: "chevron-up",
      enabled: canEdit,
    },
    {
      key: "edit",
      label: "수정하기",
      icon: "edit",
      enabled: canEdit,
    },
    { key: "delete", label: "삭제하기", icon: "trash", enabled: true },
  ];

  const onSelect = (item: OwnerMenuItem) => {
    if (!item.enabled || bumping || deleting) {
      setMenuOpen(false);
      return;
    }
    if (item.key === "bump") {
      setMenuOpen(false);
      requestBump();
      return;
    }
    if (item.key === "edit") {
      setMenuOpen(false);
      router.push(productPostEditPath(productPostUuid));
      return;
    }
    if (item.key === "delete") {
      setMenuOpen(false);
      setError(null);
      setConfirmOpen(true);
    }
  };

  const onConfirmDelete = () => {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    void (async () => {
      try {
        const res = await deleteProductPostAction(productPostUuid);
        if (!res.ok) {
          setError(res.message);
          notifyIfSessionExpiredAction(res);
          return;
        }
        setConfirmOpen(false);
        router.replace(PRODUCT_POSTS_PATH);
      } catch {
        setError("상품 삭제 중 오류가 발생했습니다. 다시 시도해 주세요.");
      } finally {
        setDeleting(false);
      }
    })();
  };

  return (
    <>
      <Popover
        open={menuOpen}
        onOpenChange={setMenuOpen}
        className={cn("shrink-0", className)}
        contentClassName="left-auto right-0 mt-1 w-auto min-w-[140px] border-0 p-5 shadow-[0px_4px_7.5px_rgba(0,0,0,0.15)]"
        trigger={
          <button
            type="button"
            aria-label="판매글 옵션"
            aria-haspopup="menu"
            className="shrink-0 text-white"
          >
            <Icon name="more" size={30} />
          </button>
        }
      >
        <ul className="flex flex-col gap-5" role="menu">
          {menuItems.map((item) => (
            <li key={item.key} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={deleting || bumping || !item.enabled}
                onClick={() => onSelect(item)}
                className={cn(
                  "flex w-full items-center gap-1 text-left font-sans text-base text-[#323232]",
                  !item.enabled && "opacity-60"
                )}
              >
                <Icon name={item.icon} size={18} className="text-[#323232]" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </Popover>

      <ConfirmModal
        open={confirmOpen}
        title="판매글 삭제"
        message={
          error ??
          "판매글을 삭제하시겠습니까?\n삭제된 글은 목록과 상세에서 더 이상 보이지 않습니다."
        }
        confirmLabel={deleting ? "삭제 중…" : "삭제하기"}
        cancelLabel="취소"
        confirmPending={deleting}
        onConfirm={onConfirmDelete}
        onCancel={() => {
          if (deleting) return;
          setConfirmOpen(false);
          setError(null);
        }}
      />

      {bumpDialogs}
    </>
  );
}
