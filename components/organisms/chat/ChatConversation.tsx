"use client";

import { useState } from "react";
import Image from "next/image";

import { Icon } from "@/components/atoms/icons";
import { ChatDateDivider } from "@/components/molecules/chat/ChatDateDivider";
import { ChatMessageBubble } from "@/components/molecules/chat/ChatMessageBubble";
import { ChatReservationNotice } from "@/components/molecules/chat/ChatReservationNotice";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/molecules/overlay/Dialog";
import {
  CHAT_LOCATION_PIN,
  CHAT_MAP_PICKER,
  CHAT_MAP_PREVIEW,
  formatChatDateDivider,
} from "@/constants/chat-page";
import type { UiChatMessage } from "@/types/chat/ui";

type MediaViewer =
  | { kind: "image"; src: string }
  | { kind: "location"; placeName: string; mapImage: string };

interface ChatConversationProps {
  peerName: string;
  peerImageUrl?: string | null;
  messages: UiChatMessage[];
  onViewReservation?: () => void;
}

function shouldShowPeerMeta(messages: UiChatMessage[], index: number) {
  if (messages[index].from !== "peer") return false;
  if (index === 0) return true;
  return messages[index - 1].from !== "peer";
}

function MessageBody({
  message,
  onOpenImage,
  onOpenLocation,
}: {
  message: UiChatMessage;
  onOpenImage: (src: string) => void;
  onOpenLocation: (placeName: string, mapImage: string) => void;
}) {
  if (message.kind === "image" && message.imageSrc) {
    return (
      <ChatMessageBubble
        from={message.from}
        time={message.time}
        className="text-left"
      >
        <button
          type="button"
          aria-label="사진 크게 보기"
          className="block cursor-pointer"
          onClick={() => onOpenImage(message.imageSrc!)}
        >
          {/* blob URL은 next/image 최적화 대상이 아님 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={message.imageSrc}
            alt=""
            className="max-h-[240px] max-w-[280px] rounded-[6px] object-cover"
          />
        </button>
      </ChatMessageBubble>
    );
  }

  if (message.kind === "location" && message.placeName) {
    const mapImage = message.mapImage ?? CHAT_MAP_PREVIEW;
    return (
      <ChatMessageBubble
        from={message.from}
        time={message.time}
        className="text-left"
      >
        <button
          type="button"
          aria-label={`${message.placeName} 지도 크게 보기`}
          className="flex w-[220px] cursor-pointer flex-col gap-2 text-left"
          onClick={() => onOpenLocation(message.placeName!, mapImage)}
        >
          <span className="relative h-[120px] w-full overflow-hidden bg-[#d9d9d9]">
            <Image
              src={mapImage}
              alt=""
              fill
              sizes="220px"
              className="object-cover"
            />
          </span>
          <span className="flex items-center gap-1 font-sans text-sm">
            <Icon name="location" size={16} />
            {message.placeName}
          </span>
        </button>
      </ChatMessageBubble>
    );
  }

  return (
    <ChatMessageBubble from={message.from} time={message.time}>
      {message.text}
    </ChatMessageBubble>
  );
}

/** 대화 메시지 스트림 — 사진·지도 클릭 시 Dialog로 확대 */
function PeerAvatar({ src }: { src?: string | null }) {
  if (src) {
    return (
      <span className="relative size-[35px] shrink-0 overflow-hidden rounded-full bg-[#d0d0d0] lg:size-9">
        <Image src={src} alt="" fill sizes="36px" className="object-cover" />
      </span>
    );
  }
  return (
    <span className="size-[35px] shrink-0 rounded-full bg-[#d0d0d0] lg:size-9" />
  );
}

export function ChatConversation({
  peerName,
  peerImageUrl,
  messages,
  onViewReservation,
}: ChatConversationProps) {
  const [viewer, setViewer] = useState<MediaViewer | null>(null);

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-3 pt-5 lg:px-[30px] lg:pt-[30px]">
        {messages.map((message, index) => {
          const dateKey = message.dateKey;
          const prevDateKey =
            index > 0 ? messages[index - 1].dateKey : undefined;
          const showDate = Boolean(dateKey) && dateKey !== prevDateKey;
          const divider = showDate ? (
            <ChatDateDivider
              label={
                message.createdAt
                  ? formatChatDateDivider(message.createdAt)
                  : dateKey!
              }
            />
          ) : null;

          if (
            message.kind === "system-reservation" &&
            message.reservationSummary
          ) {
            return (
              <div key={message.id} className="flex flex-col gap-5">
                {divider}
                <ChatReservationNotice
                  dateLine={message.reservationSummary.dateLine}
                  timePlaceLine={message.reservationSummary.timePlaceLine}
                  time={message.time}
                  onViewDetails={onViewReservation}
                />
              </div>
            );
          }

          if (message.kind === "typing") {
            return (
              <div key={message.id} className="flex flex-col gap-5">
                {divider}
                <div className="flex items-start gap-2.5">
                  <PeerAvatar src={peerImageUrl} />
                  <div className="flex flex-col gap-2.5">
                    <p className="font-sans text-[13px] text-[#323232] lg:text-base">
                      {peerName}
                    </p>
                    <div className="flex h-[39px] items-center justify-center rounded-[10px] bg-[rgba(134,134,134,0.1)] px-4">
                      <span className="flex gap-1">
                        <span className="size-1.5 rounded-full bg-[#868686]" />
                        <span className="size-1.5 rounded-full bg-[#868686]" />
                        <span className="size-1.5 rounded-full bg-[#868686]" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          const body = (
            <MessageBody
              message={message}
              onOpenImage={(src) => setViewer({ kind: "image", src })}
              onOpenLocation={(placeName, mapImage) =>
                setViewer({ kind: "location", placeName, mapImage })
              }
            />
          );

          if (message.from === "peer" && shouldShowPeerMeta(messages, index)) {
            return (
              <div key={message.id} className="flex flex-col gap-5">
                {divider}
                <div className="flex items-start gap-2.5 lg:gap-3.5">
                  <PeerAvatar src={peerImageUrl} />
                  <div className="flex min-w-0 flex-col gap-3.5">
                    <p className="font-sans text-[13px] text-[#323232] lg:text-base">
                      {peerName}
                    </p>
                    {body}
                  </div>
                </div>
              </div>
            );
          }

          if (message.from === "peer") {
            return (
              <div key={message.id} className="flex flex-col gap-5">
                {divider}
                <div className="flex items-start gap-2.5 pl-[45px] lg:gap-3.5 lg:pl-12">
                  {body}
                </div>
              </div>
            );
          }

          return (
            <div key={message.id} className="flex flex-col gap-5">
              {divider}
              {body}
            </div>
          );
        })}
      </div>

      <Dialog
        open={Boolean(viewer)}
        onOpenChange={(open) => {
          if (!open) setViewer(null);
        }}
        className={viewer?.kind === "image" ? "max-w-4xl" : undefined}
      >
        {viewer?.kind === "image" ? (
          <DialogContent
            padded={false}
            onClose={() => setViewer(null)}
            className="flex items-center justify-center bg-black p-4"
          >
            <DialogTitle className="sr-only">사진 보기</DialogTitle>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={viewer.src}
              alt=""
              className="max-h-[80vh] w-auto max-w-full object-contain"
            />
          </DialogContent>
        ) : null}

        {viewer?.kind === "location" ? (
          <DialogContent
            onClose={() => setViewer(null)}
            className="px-[50px] pb-8"
          >
            <DialogTitle className="w-full px-0 text-xl leading-[1.5] sm:px-0">
              {viewer.placeName}
            </DialogTitle>
            <div className="relative size-[400px] max-w-full overflow-hidden bg-[#d9d9d9]">
              <Image
                src={CHAT_MAP_PICKER}
                alt=""
                fill
                sizes="400px"
                className="object-cover"
              />
              <span className="pointer-events-none absolute left-1/2 top-1/2 size-[78px] -translate-x-1/2 -translate-y-[85%]">
                <Image
                  src={CHAT_LOCATION_PIN}
                  alt=""
                  width={78}
                  height={76}
                  unoptimized
                  className="size-full object-contain"
                />
              </span>
            </div>
            <p className="flex w-full items-center gap-1.5 font-sans text-base text-[#323232]">
              <Icon name="location" size={20} />
              {viewer.placeName}
            </p>
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}
