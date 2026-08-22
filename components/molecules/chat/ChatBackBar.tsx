"use client";

import { useRouter } from "next/navigation";

import { Icon } from "@/components/atoms/icons";
import { cn } from "@/lib/utils";

interface ChatBackBarProps {
  className?: string;
}

/** Figma 채팅 상단 바 — 뒤로가기만 (사이트 Header 대신) */
export function ChatBackBar({ className }: ChatBackBarProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex h-[60px] shrink-0 items-center bg-[#fbefd8] px-2 py-3",
        className
      )}
    >
      <button
        type="button"
        aria-label="뒤로 가기"
        className="flex size-9 items-center justify-center text-[#323232]"
        onClick={() => router.back()}
      >
        <Icon name="chevron-left" size={36} />
      </button>
    </div>
  );
}
