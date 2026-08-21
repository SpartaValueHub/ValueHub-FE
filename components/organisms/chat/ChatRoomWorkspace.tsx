"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import { Icon } from "@/components/atoms/icons";
import { StatusBadge } from "@/components/atoms/status-badge";
import { ChatConversation } from "@/components/organisms/chat/ChatConversation";
import {
  ChatMessageForm,
  type ChatOutgoingPayload,
} from "@/components/organisms/chat/ChatMessageForm";
import { CHAT_MAP_PREVIEW } from "@/constants/chat-page";
import { ChatRoomList } from "@/components/organisms/chat/ChatRoomList";
import {
  TradeReservationPanel,
  reservationNoticeLines,
} from "@/components/organisms/chat/TradeReservationPanel";
import { cn } from "@/lib/utils";
import type {
  UiChatMessage,
  UiChatRoom,
  UiTradeReservation,
} from "@/types/chat/ui";

interface ChatRoomWorkspaceProps {
  rooms: UiChatRoom[];
  roomId: string;
  initialMessages: UiChatMessage[];
}

/** 채팅 3단 셸 — 목록 / 대화 / 거래 예약 */
export function ChatRoomWorkspace({
  rooms,
  roomId,
  initialMessages,
}: ChatRoomWorkspaceProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [reserved, setReserved] = useState(false);

  const room = useMemo(
    () => rooms.find((item) => item.id === roomId) ?? rooms[0],
    [rooms, roomId]
  );

  function handleReserved(reservation: UiTradeReservation) {
    const summary = reservationNoticeLines(reservation);
    setReserved(true);
    setMessages((current) => [
      ...current.filter((item) => item.kind !== "typing"),
      {
        id: `reserve-${Date.now()}`,
        kind: "system-reservation",
        from: "me",
        reservationSummary: summary,
      },
    ]);
  }

  function handleSend(payload: ChatOutgoingPayload) {
    const base = {
      id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      from: "me" as const,
      time: "방금",
    };

    setMessages((current) => {
      const withoutTyping = current.filter((item) => item.kind !== "typing");
      if (payload.kind === "text") {
        return [
          ...withoutTyping,
          { ...base, kind: "text", text: payload.text },
        ];
      }
      if (payload.kind === "image") {
        return [
          ...withoutTyping,
          { ...base, kind: "image", imageSrc: payload.src },
        ];
      }
      return [
        ...withoutTyping,
        {
          ...base,
          kind: "location",
          placeName: payload.placeName,
          mapImage: CHAT_MAP_PREVIEW,
        },
      ];
    });
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-[#fbefd8]">
      <ChatRoomList rooms={rooms} selectedId={room.id} />

      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-5 bg-[#fbefd8] px-5 py-[30px]">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="relative size-16 shrink-0 overflow-hidden rounded-[6px] bg-[#868686]">
              <Image
                src={room.thumbnail}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-center gap-1">
                <p className="truncate font-sans text-sm text-[#323232]">
                  {room.title}
                </p>
                {reserved ? <StatusBadge status="reserved" /> : null}
              </div>
              <p className="font-sans text-lg text-[#323232]">
                {room.price.toLocaleString("ko-KR")}
                <span className="ml-0.5 text-base">원</span>
              </p>
              <p className="flex items-center gap-0.5 font-sans text-sm text-[#323232]">
                <Icon name="location" size={12} />
                {room.location}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="더보기"
            className="flex size-9 shrink-0 items-center justify-center"
          >
            <Icon name="more" size={36} />
          </button>
        </div>

        <div
          className={cn(
            "flex min-h-0 flex-1 bg-white",
            "rounded-tr-[10px] border-r border-[#d9d9d9]"
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <ChatConversation peerName={room.peerName} messages={messages} />
            <ChatMessageForm onSend={handleSend} />
          </div>
          <TradeReservationPanel key={room.id} onReserved={handleReserved} />
        </div>
      </section>
    </div>
  );
}
