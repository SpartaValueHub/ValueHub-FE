"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteProductPostAction } from "@/actions/product-posts";
import { Icon, type SystemIconName } from "@/components/atoms/icons";
import { ConfirmModal } from "@/components/molecules/overlay/ConfirmModal";
import { Popover } from "@/components/molecules/overlay/Popover";
import { PRODUCT_POSTS_PATH } from "@/constants/product-posts";
import { notifyIfSessionExpiredAction } from "@/lib/auth/session-expired.client";
import { cn } from "@/lib/utils";

type OwnerMenuItem = {
  key: "bump" | "edit" | "delete";
  label: string;
  icon: SystemIconName;
  /** false면 UI만 표시 (이번 스프린트: 끌어올리기·수정하기) */
  enabled: boolean;
};

const MENU_ITEMS: OwnerMenuItem[] = [
  { key: "bump", label: "끌어올리기", icon: "chevron-up", enabled: false },
  { key: "edit", label: "수정하기", icon: "edit", enabled: false },
  { key: "delete", label: "삭제하기", icon: "trash", enabled: true },
];

interface ProductOwnerOptionsMenuProps {
  productPostUuid: string;
  className?: string;
}

/**
 * Figma option_product_detail (518:862)
 * — owner 전용 ⋯ 메뉴. 삭제만 연동, 끌어올리기·수정은 UI placeholder.
 */
export function ProductOwnerOptionsMenu({
  productPostUuid,
  className,
}: ProductOwnerOptionsMenuProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSelect = (item: OwnerMenuItem) => {
    if (!item.enabled) {
      setMenuOpen(false);
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
        // 삭제 후 목록으로 이동 (히스토리에 상세 안 남김)
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
          {MENU_ITEMS.map((item) => (
            <li key={item.key} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={deleting}
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
    </>
  );
}
