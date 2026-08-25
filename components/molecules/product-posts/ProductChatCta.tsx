"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { createChatRoomAction } from "@/actions/chat";
import { SESSION_EXPIRED_CODE } from "@/constants/auth-session";
import { notifyIfSessionExpiredAction } from "@/lib/auth/session-expired.client";
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
  /** owner: GET product-posts/{uuid}/rooms 의 rooms.length */
  activeChatCount?: number;
  className?: string;
}

const buttonBase =
  "flex items-center justify-center gap-1.5 font-sans text-[#323232] transition-opacity hover:opacity-90";

/**
 * 상세 채팅 CTA
 * - owner: 대화중인 채팅 N
 * - buyer: 채팅하기 → POST /rooms → /chat/[roomId]
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
        onClick={() =>
          router.push(
            `/chat?productPostUuid=${encodeURIComponent(productPostUuid)}`
          )
        }
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

  const callbackUrl = pathname || `/product-posts/${productPostUuid}`;

  const goChatOrSignIn = () => {
    if (pending) return;

    if (role === "guest") {
      router.push(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    setPending(true);
    setError(null);
    void (async () => {
      try {
        const result = await createChatRoomAction({
          productPostUuid,
          sellerUuid: sellerMemberUuid,
          sellerNickname: nicknameForChat || undefined,
        });

        if (!result.ok) {
          notifyIfSessionExpiredAction(result);
          if (result.code === SESSION_EXPIRED_CODE) {
            router.push(
              `/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
            );
            return;
          }
          setError(result.message);
          return;
        }

        router.push(`/chat/${result.data.roomId}`);
      } catch {
        setError("채팅방을 만들지 못했습니다. 다시 시도해 주세요.");
      } finally {
        setPending(false);
      }
    })();
  };

  return (
    <div className={cn("flex w-full flex-col gap-1.5 md:flex-1", className)}>
      <button
        type="button"
        disabled={pending}
        data-product-post-uuid={productPostUuid}
        data-seller-member-uuid={sellerMemberUuid}
        data-seller-nickname={nicknameForChat}
        data-chat-role={role}
        onClick={goChatOrSignIn}
        className={cn(
          buttonBase,
          "h-10 w-full bg-[#efbb55] text-sm tracking-[-0.28px] disabled:opacity-60 md:h-[52px] md:px-[30px] md:text-lg md:tracking-[0.36px]"
        )}
      >
        {pending ? "채팅 연결 중..." : "채팅하기"}
      </button>
      {error ? (
        <p className="font-sans text-xs text-[#efbb55]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
