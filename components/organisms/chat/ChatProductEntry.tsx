"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createChatRoomAction } from "@/actions/chat";
import { Spinner } from "@/components/atoms/spinner";
import type { UiProductChatEntry } from "@/types/chat/ui";

interface ChatProductEntryProps {
  entry: UiProductChatEntry;
}

/** 상품 상세 쿼리로 /chat 진입 시 방을 만들고 상세로 보냄 */
export function ChatProductEntry({ entry }: ChatProductEntryProps) {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const nickname = entry.sellerNickname?.trim() ?? "";
  const nicknameMissing = !nickname;

  useEffect(() => {
    if (nicknameMissing || started.current) return;
    started.current = true;

    void createChatRoomAction({
      productPostUuid: entry.productPostUuid,
      sellerUuid: entry.sellerMemberUuid,
      sellerNickname: nickname,
    }).then((result) => {
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.replace(`/chat/${result.data.roomId}`);
    });
  }, [entry, nickname, nicknameMissing, router]);

  if (nicknameMissing || error) {
    return (
      <p className="px-5 py-3 font-sans text-sm text-[#c45c26]" role="alert">
        {error ?? "판매자 닉네임을 확인할 수 없습니다."}
      </p>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 px-5 py-3">
      <Spinner size="sm" />
      <span className="font-sans text-sm text-[#606060]">채팅방을 여는 중</span>
    </div>
  );
}
