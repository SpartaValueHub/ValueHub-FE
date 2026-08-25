"use client";

import { useRouter } from "next/navigation";
import { useContext } from "react";

import { SideActionButton } from "@/components/molecules/form/SideActionButton";
import { PRODUCT_POST_CREATE_PATH } from "@/constants/product-posts";
import { SessionContext } from "@/context/SessionContext";
import { cn } from "@/lib/utils";

interface ListingSideActionsProps {
  className?: string;
}

/** 목록·상세 우측 FAB — SideActionButton 재사용 */
export function ListingSideActions({ className }: ListingSideActionsProps) {
  const router = useRouter();
  const session = useContext(SessionContext);
  const isAuthenticated = session?.isAuthenticated ?? false;
  const isLoading = session?.isLoading ?? false;

  const onWrite = () => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push(
        `/signin?callbackUrl=${encodeURIComponent(PRODUCT_POST_CREATE_PATH)}`
      );
      return;
    }
    router.push(PRODUCT_POST_CREATE_PATH);
  };

  return (
    <div
      className={cn(
        "fixed right-5 bottom-8 z-40 flex flex-col items-end gap-6 md:right-8",
        className
      )}
    >
      <SideActionButton
        action="top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      />
      <SideActionButton action="write" onClick={onWrite} />
    </div>
  );
}
