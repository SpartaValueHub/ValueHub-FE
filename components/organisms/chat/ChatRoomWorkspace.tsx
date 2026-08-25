"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { listOlderChatMessagesAction } from "@/actions/chat";
import { useChatRoomSocket } from "@/hooks/chat/useChatRoomSocket";
import { applyChatListPatch } from "@/lib/chat/map-list-patch";

import { Icon, type SystemIconName } from "@/components/atoms/icons";
import { StatusBadge } from "@/components/atoms/status-badge";
import { Popover } from "@/components/molecules/overlay/Popover";
import { ChatConversation } from "@/components/organisms/chat/ChatConversation";
import {
  ChatMessageForm,
  type ChatOutgoingPayload,
} from "@/components/organisms/chat/ChatMessageForm";
import { ChatRoomList } from "@/components/organisms/chat/ChatRoomList";
import {
  TradeReservationPanel,
  reservationNoticeLines,
} from "@/components/organisms/chat/TradeReservationPanel";
import {
  CHAT_RESERVATIONS,
  formatReservationChipDate,
  formatReservationChipSubline,
  reservationFromCard,
} from "@/constants/chat-page";
import { PRODUCT_POSTS_PATH } from "@/constants/product-posts";
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
  initialHasMoreMessages?: boolean;
}

function ProductPostLink({
  room,
  className,
  children,
}: {
  room: UiChatRoom;
  className?: string;
  children: React.ReactNode;
}) {
  if (!room.productPostUuid) {
    return <div className={className}>{children}</div>;
  }
  return (
    <Link
      href={`${PRODUCT_POSTS_PATH}/${encodeURIComponent(room.productPostUuid)}`}
      className={className}
    >
      {children}
    </Link>
  );
}

const MORE_MENU_ITEMS: {
  icon: SystemIconName;
  label: string;
  action?: "reserve";
}[] = [
  { icon: "calendar-plus", label: "거래 예약하기", action: "reserve" },
  { icon: "siren", label: "신고하기" },
  { icon: "block", label: "차단하기" },
  { icon: "trash", label: "채팅방 나가기" },
];

/** 채팅 3단 셸 — 목록 / 대화 / 거래 예약. 모바일은 대화 + 예약 모달 */
export function ChatRoomWorkspace({
  rooms,
  roomId,
  initialMessages,
  initialHasMoreMessages = false,
}: ChatRoomWorkspaceProps) {
  const router = useRouter();
  const [listRooms, setListRooms] = useState(rooms);
  const [messages, setMessages] = useState(initialMessages);
  const [hasMoreMessages, setHasMoreMessages] = useState(
    initialHasMoreMessages
  );
  const [loadingOlder, setLoadingOlder] = useState(false);
  const loadingOlderRef = useRef(false);
  const requestedBeforeRef = useRef<string | null>(null);

  const { publishText, publishLocation } = useChatRoomSocket({
    roomId,
    onMessage: (incoming) => {
      setMessages((current) => {
        if (current.some((item) => item.id === incoming.id)) return current;
        return [...current, incoming];
      });
    },
    onListPatch: (patch) => {
      setListRooms((current) =>
        applyChatListPatch(current, patch, { activeRoomId: roomId })
      );
    },
  });
  const [reservation, setReservation] = useState<UiTradeReservation | null>(
    () => {
      const card = CHAT_RESERVATIONS.find((item) => item.roomId === roomId);
      return card ? reservationFromCard(card) : null;
    }
  );
  const [postReserved, setPostReserved] = useState(Boolean(reservation));
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [desktopMoreOpen, setDesktopMoreOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogIntent, setDialogIntent] = useState<"form" | "detail">("form");

  const room = useMemo(
    () => listRooms.find((item) => item.id === roomId) ?? listRooms[0],
    [listRooms, roomId]
  );

  async function handleLoadOlder() {
    const before = messages[0]?.id;
    if (!before || !hasMoreMessages || loadingOlderRef.current) return;
    if (requestedBeforeRef.current === before) return;

    requestedBeforeRef.current = before;
    loadingOlderRef.current = true;
    setLoadingOlder(true);
    try {
      const result = await listOlderChatMessagesAction({ roomId, before });
      if (!result.ok) {
        requestedBeforeRef.current = null;
        return;
      }
      setMessages((current) => [...result.data.messages, ...current]);
      setHasMoreMessages(result.data.hasMore);
    } finally {
      loadingOlderRef.current = false;
      setLoadingOlder(false);
    }
  }

  function handleReserved(next: UiTradeReservation) {
    const summary = reservationNoticeLines(next);
    setReservation(next);
    setPostReserved(true);
    setMessages((current) => [
      ...current.filter(
        (item) => item.kind !== "typing" && item.kind !== "system-reservation"
      ),
      {
        id: `reserve-${Date.now()}`,
        kind: "system-reservation",
        from: "me",
        time: "방금",
        reservationSummary: summary,
      },
    ]);
  }

  function handleCancelReservation() {
    setReservation(null);
    setPostReserved(false);
    setMessages((current) =>
      current.filter((item) => item.kind !== "system-reservation")
    );
  }

  function openReserveForm() {
    setMobileMoreOpen(false);
    setDesktopMoreOpen(false);
    setDialogIntent("form");
    setDialogOpen(true);
  }

  function openReserveDetail() {
    if (!reservation) return;
    setDialogIntent("detail");
    setDialogOpen(true);
  }

  function handleSend(payload: ChatOutgoingPayload) {
    if (payload.kind === "text") {
      publishText(payload.text);
      return;
    }

    if (payload.kind === "location") {
      publishLocation({
        placeName: payload.placeName,
        latitude: payload.latitude,
        longitude: payload.longitude,
      });
      return;
    }

    const base = {
      id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      from: "me" as const,
      time: "방금",
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => {
      const withoutTyping = current.filter((item) => item.kind !== "typing");
      return [
        ...withoutTyping,
        { ...base, kind: "image", imageSrc: payload.src },
      ];
    });
  }

  function renderMoreMenu(
    open: boolean,
    onOpenChange: (open: boolean) => void
  ) {
    return (
      <Popover
        open={open}
        onOpenChange={onOpenChange}
        className="shrink-0"
        contentClassName="left-auto right-0 z-50 mt-1 w-max min-w-[148px] rounded-[4px] border-0 p-5 shadow-[0px_4px_7.5px_rgba(0,0,0,0.15)]"
        trigger={
          <button
            type="button"
            aria-label="더보기"
            className="flex size-[30px] shrink-0 items-center justify-center lg:size-9"
          >
            <Icon name="more" size={30} />
          </button>
        }
      >
        <div className="flex flex-col gap-5">
          {MORE_MENU_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex items-center gap-[7px] text-left font-sans text-sm text-[#323232]"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (item.action === "reserve") {
                  openReserveForm();
                  return;
                }
                onOpenChange(false);
              }}
            >
              <Icon name={item.icon} size={12} />
              {item.label}
            </button>
          ))}
        </div>
      </Popover>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-[#fbefd8]">
      <div className="hidden h-full lg:flex">
        <ChatRoomList rooms={listRooms} selectedId={room.id} />
      </div>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex flex-col gap-5 bg-[#fbefd8] px-2.5 pt-3 pb-3.5 lg:hidden">
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="뒤로 가기"
              className="flex size-[30px] items-center justify-center text-[#323232]"
              onClick={() => router.back()}
            >
              <Icon name="chevron-left" size={30} />
            </button>
            <span className="flex h-[30px] items-center gap-0.5 rounded-[45px] bg-white px-3 py-[3px]">
              <Icon name="user-fill" size={12} />
              <span className="font-sans text-sm font-medium text-[#323232]">
                {room.peerName}
              </span>
            </span>
            {renderMoreMenu(mobileMoreOpen, setMobileMoreOpen)}
          </div>

          <div className="flex items-start justify-between pr-1 pl-1.5">
            <ProductPostLink
              room={room}
              className="flex min-w-0 items-start gap-2.5"
            >
              <span className="relative size-[43px] shrink-0 overflow-hidden rounded-[6px] bg-[#868686]">
                <Image
                  src={room.thumbnail}
                  alt=""
                  fill
                  sizes="43px"
                  className="object-cover"
                />
              </span>
              <div className="flex min-w-0 flex-col justify-center gap-0.5">
                <p className="truncate font-sans text-xs tracking-[-0.24px] text-[#323232]">
                  {room.title}
                </p>
                <p className="font-sans text-sm font-medium text-[#323232]">
                  {room.price.toLocaleString("ko-KR")}
                  <span className="ml-0.5 text-xs">원</span>
                </p>
              </div>
            </ProductPostLink>
            {reservation ? (
              <button
                type="button"
                className="flex shrink-0 flex-col items-end justify-center gap-1 rounded-[3px] bg-white py-[3px] pr-1.5 pl-[3px]"
                onClick={openReserveDetail}
              >
                <span className="flex items-center gap-0.5">
                  <Icon name="calendar" size={16} />
                  <span className="font-sans text-xs tracking-[-0.24px] text-[#323232]">
                    {formatReservationChipDate(reservation.date)}
                  </span>
                </span>
                <span className="font-sans text-xs tracking-[-0.24px] text-[#323232]">
                  {formatReservationChipSubline(
                    reservation.date,
                    reservation.time
                  )}
                </span>
              </button>
            ) : null}
          </div>
        </div>

        <div className="hidden items-start gap-5 bg-[#fbefd8] px-5 py-[30px] lg:flex">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <ProductPostLink
              room={room}
              className="flex min-w-0 flex-1 items-center gap-2.5"
            >
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
                  {postReserved ? <StatusBadge status="reserved" /> : null}
                </div>
                <p className="font-sans text-lg text-[#323232]">
                  {room.price.toLocaleString("ko-KR")}
                  <span className="ml-0.5 text-base">원</span>
                </p>
                <p className="flex items-center gap-0.5 font-sans text-sm text-[#323232]">
                  <Icon name="user-fill" size={12} />
                  {room.peerName}
                </p>
              </div>
            </ProductPostLink>
          </div>
          {renderMoreMenu(desktopMoreOpen, setDesktopMoreOpen)}
        </div>

        <div
          className={cn(
            "flex min-h-0 flex-1 bg-white",
            "lg:rounded-tr-[10px] lg:border-r lg:border-[#d9d9d9]"
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <ChatConversation
              peerName={room.peerName}
              peerImageUrl={room.peerImageUrl}
              messages={messages}
              hasMore={hasMoreMessages}
              loadingOlder={loadingOlder}
              onLoadOlder={handleLoadOlder}
              onViewReservation={openReserveDetail}
            />
            <ChatMessageForm onSend={handleSend} />
          </div>
          <div className="hidden lg:flex">
            <TradeReservationPanel
              key={room.id}
              reservation={reservation}
              postReserved={postReserved}
              onReserved={handleReserved}
              onCancelReservation={handleCancelReservation}
            />
          </div>
        </div>
      </section>

      {dialogOpen ? (
        <TradeReservationPanel
          variant="dialog"
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          intent={dialogIntent}
          reservation={reservation}
          postReserved={postReserved}
          product={{
            title: room.title,
            thumbnail: room.thumbnail,
            price: room.price,
          }}
          onReserved={handleReserved}
          onCancelReservation={handleCancelReservation}
        />
      ) : null}
    </div>
  );
}
