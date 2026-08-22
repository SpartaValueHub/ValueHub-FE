"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

export type ProductChatViewerRole = "guest" | "buyer" | "owner";

interface ProductChatCtaProps {
  role: ProductChatViewerRole;
  productPostUuid: string;
  sellerMemberUuid: string;
  /**
   * 상세에서 Member profile로 이미 조회한 판매자 닉.
   * 채팅 `POST /rooms`의 sellerNickname용 — fallback 문구는 넘기지 말 것.
   */
  sellerNickname?: string;
  /** 채팅 서비스 연동 전 placeholder — owner UI만 사용 */
  activeChatCount?: number;
  className?: string;
}

const buttonBase =
  "flex items-center justify-center gap-1.5 font-sans text-[#323232] transition-opacity hover:opacity-90";

/**
 * 상세 채팅 CTA
 * - owner: 대화중인 채팅 N
 * - buyer: 채팅하기 → POST /api/chat/rooms → /chat/{roomId}
 * - guest: 채팅하기 → /signin
 */
export function ProductChatCta({
  role,
  productPostUuid,
  sellerMemberUuid,
  sellerNickname = "",
  activeChatCount = 0,
  className,
}: ProductChatCtaProps) {
  const router = useRouter();
  const pathname = usePathname();
  const nicknameForChat = sellerNickname.trim();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (role === "owner") {
    return (
      <button
        type="button"
        data-product-post-uuid={productPostUuid}
        data-seller-member-uuid={sellerMemberUuid}
        data-seller-nickname={nicknameForChat}
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
      router.push(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    setError(null);
    setPending(true);
    void fetch("/api/chat/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productPostUuid,
        sellerUuid: sellerMemberUuid,
        sellerNickname: nicknameForChat,
      }),
    })
      .then(async (res) => {
        const json = (await res.json()) as {
          ok?: boolean;
          message?: string;
          data?: { roomId: string };
        };
        if (!res.ok || !json.ok || !json.data?.roomId) {
          setError(json.message || "채팅방을 만들지 못했습니다.");
          return;
        }
        router.push(`/chat/${json.data.roomId}`);
      })
      .catch(() => {
        setError("채팅방을 만들지 못했습니다.");
      })
      .finally(() => {
        setPending(false);
      });
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      <button
        type="button"
        data-product-post-uuid={productPostUuid}
        data-seller-member-uuid={sellerMemberUuid}
        data-seller-nickname={nicknameForChat}
        data-chat-role={role}
        disabled={pending}
        onClick={goChatOrSignIn}
        className={cn(
          buttonBase,
          "h-10 w-full bg-[#efbb55] text-sm tracking-[-0.28px] md:h-[52px] md:flex-1 md:px-[30px] md:text-lg md:tracking-[0.36px]",
          pending && "opacity-60",
          className
        )}
      >
        {pending ? "채팅방 여는 중" : "채팅하기"}
      </button>
      {error ? (
        <p className="font-sans text-xs text-[#efbb55]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
