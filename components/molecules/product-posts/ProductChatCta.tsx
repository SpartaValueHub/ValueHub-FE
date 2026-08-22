"use client";

import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

export type ProductChatViewerRole = "guest" | "buyer" | "owner";

interface ProductChatCtaProps {
  role: ProductChatViewerRole;
  productPostUuid: string;
  sellerMemberUuid: string;
  /** 채팅 서비스 연동 전 placeholder — owner UI만 사용 */
  activeChatCount?: number;
  className?: string;
}

const buttonBase =
  "flex items-center justify-center gap-1.5 font-sans text-[#323232] transition-opacity hover:opacity-90";

/**
 * 상세 채팅 CTA
 * - owner: 대화중인 채팅 N
 * - buyer: 채팅하기 → /chat?productPostUuid&sellerMemberUuid (닉네임은 Chat에서 Member resolve)
 * - guest: 채팅하기 → /signin
 * - 모바일: 하단 고정 바에서 full-width로 사용
 */
export function ProductChatCta({
  role,
  productPostUuid,
  sellerMemberUuid,
  activeChatCount = 0,
  className,
}: ProductChatCtaProps) {
  const router = useRouter();
  const pathname = usePathname();

  if (role === "owner") {
    return (
      <button
        type="button"
        data-product-post-uuid={productPostUuid}
        data-seller-member-uuid={sellerMemberUuid}
        data-chat-role="owner"
        className={cn(
          buttonBase,
          "h-10 w-full bg-white text-sm tracking-[-0.28px] md:h-[52px] md:flex-1 md:px-[30px] md:text-lg md:tracking-[0.36px]",
          className
        )}
      >
        <span>대화중인 채팅</span>
        <span className="inline-block min-w-[1.5ch] text-center tabular-nums">
          {activeChatCount}
        </span>
      </button>
    );
  }

  const goChatOrSignIn = () => {
    if (role === "guest") {
      const callbackUrl = pathname || `/product-posts/${productPostUuid}`;
      router.push(
        `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
      );
      return;
    }

    const params = new URLSearchParams({
      productPostUuid,
      sellerMemberUuid,
    });
    router.push(`/chat?${params.toString()}`);
  };

  return (
    <button
      type="button"
      data-product-post-uuid={productPostUuid}
      data-seller-member-uuid={sellerMemberUuid}
      data-chat-role={role}
      onClick={goChatOrSignIn}
      className={cn(
        buttonBase,
        "h-10 w-full bg-[#efbb55] text-sm tracking-[-0.28px] md:h-[52px] md:flex-1 md:px-[30px] md:text-lg md:tracking-[0.36px]",
        className
      )}
    >
      채팅하기
    </button>
  );
}
