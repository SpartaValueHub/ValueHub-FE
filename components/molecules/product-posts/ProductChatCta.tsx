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
  "flex h-[52px] flex-1 items-center justify-center gap-1.5 px-[30px] font-sans text-lg tracking-[0.36px] text-[#323232] transition-opacity hover:opacity-90";

/**
 * 상세 채팅 CTA
 * - owner: 대화중인 채팅 N (Figma 518:889)
 * - buyer: 채팅하기 + productPostUuid / seller memberUuid
 * - guest: 채팅하기 → /signin
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
        className={cn(buttonBase, "bg-white", className)}
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
    // buyer: 채팅 팀에서 방 생성 연동
  };

  return (
    <button
      type="button"
      data-product-post-uuid={productPostUuid}
      data-seller-member-uuid={sellerMemberUuid}
      data-chat-role={role}
      onClick={goChatOrSignIn}
      className={cn(buttonBase, "bg-[#efbb55]", className)}
    >
      채팅하기
    </button>
  );
}
