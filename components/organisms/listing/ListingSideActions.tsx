"use client";

import { SideActionButton } from "@/components/molecules/form/SideActionButton";
import { cn } from "@/lib/utils";

interface ListingSideActionsProps {
  className?: string;
}

/** 목록 우측 FAB — SideActionButton 재사용 */
export function ListingSideActions({ className }: ListingSideActionsProps) {
  return (
    <div
      className={cn(
        "fixed bottom-8 right-8 z-40 hidden flex-col gap-6 md:flex",
        className
      )}
    >
      <SideActionButton
        action="top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      />
      <SideActionButton
        action="write"
        onClick={() => {
          window.location.href = "/write";
        }}
      />
    </div>
  );
}
