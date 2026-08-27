"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";

import { Icon } from "@/components/atoms/icons";
import { Spinner } from "@/components/atoms/spinner";
import { ChatDateDivider } from "@/components/molecules/chat/ChatDateDivider";
import { ChatMessageBubble } from "@/components/molecules/chat/ChatMessageBubble";
import { ChatReservationNotice } from "@/components/molecules/chat/ChatReservationNotice";
import { KakaoMapPicker } from "@/components/molecules/maps/KakaoMapPicker";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/molecules/overlay/Dialog";
import { formatChatDateLabel, isSameChatDay } from "@/lib/chat/map-message";
import { cn } from "@/lib/utils";
import type { UiChatMessage } from "@/types/chat/ui";

type MediaViewer =
  | { kind: "image"; src: string }
  | {
      kind: "location";
      placeName: string;
      latitude?: number;
      longitude?: number;
    };

interface ChatConversationProps {
  peerName: string;
  peerImageUrl?: string | null;
  messages: UiChatMessage[];
  hasMore?: boolean;
  loadingOlder?: boolean;
  onLoadOlder?: () => void;
  onViewReservation?: () => void;
  onPeerProfileClick?: () => void;
}

const PEER_AVATAR_SIZE_CLASS = "block size-[35px] shrink-0 lg:size-9";

function PeerAvatar({
  src,
  name,
  onClick,
}: {
  src?: string | null;
  name: string;
  onClick?: () => void;
}) {
  const trimmedSrc = src?.trim() ?? "";
  const [failedSrc, setFailedSrc] = useState("");
  const showImage = Boolean(trimmedSrc) && failedSrc !== trimmedSrc;
  const initial = name.trim().slice(0, 1);

  const avatar = (
    <span
      className={cn(
        PEER_AVATAR_SIZE_CLASS,
        "flex items-center justify-center overflow-hidden rounded-full bg-[#d0d0d0] font-sans text-[10px] text-[#323232] lg:text-xs"
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- 멤버 프로필 CDN
        <img
          src={trimmedSrc}
          alt=""
          className="size-full object-cover"
          onError={() => setFailedSrc(trimmedSrc)}
        />
      ) : initial ? (
        initial
      ) : (
        <Icon name="user" size={16} className="opacity-70" />
      )}
    </span>
  );

  if (!onClick) return avatar;

  return (
    <button
      type="button"
      aria-label={`${name} 프로필`}
      className={cn("overflow-hidden p-0 leading-none", PEER_AVATAR_SIZE_CLASS)}
      onClick={onClick}
    >
      {avatar}
    </button>
  );
}

function PeerName({ name, onClick }: { name: string; onClick?: () => void }) {
  if (!onClick) {
    return (
      <p className="font-sans text-[13px] text-[#323232] lg:text-base">
        {name}
      </p>
    );
  }
  return (
    <button
      type="button"
      aria-label={`${name} 프로필`}
      className="w-fit text-left font-sans text-[13px] text-[#323232] lg:text-base"
      onClick={onClick}
    >
      {name}
    </button>
  );
}

const PEER_META_GAP_MS = 60_000;

function isChatBubble(message: UiChatMessage) {
  return message.kind !== "system-reservation" && message.kind !== "typing";
}

function isWithinOneMinute(earlier: UiChatMessage, later: UiChatMessage) {
  if (!earlier.createdAt || !later.createdAt) return true;
  const start = Date.parse(earlier.createdAt);
  const end = Date.parse(later.createdAt);
  if (Number.isNaN(start) || Number.isNaN(end)) return true;
  return Math.abs(end - start) < PEER_META_GAP_MS;
}

/** 상대 박스: 첫 말풍선, 또는 이전 상대 말과 1분 이상 떨어질 때 */
function shouldShowPeerMeta(messages: UiChatMessage[], index: number) {
  const current = messages[index];
  if (current.from !== "peer" || !isChatBubble(current)) return false;

  for (let i = index - 1; i >= 0; i -= 1) {
    const prev = messages[i];
    if (!isChatBubble(prev)) continue;
    if (prev.from !== "peer") return true;
    return !isWithinOneMinute(prev, current);
  }
  return true;
}

/** 같은 사람·1분 묶음의 마지막 말풍선에만 시각 표시 */
function shouldShowMessageTime(messages: UiChatMessage[], index: number) {
  const current = messages[index];
  if (!isChatBubble(current)) return false;

  for (let i = index + 1; i < messages.length; i += 1) {
    const next = messages[i];
    if (!isChatBubble(next)) continue;
    if (next.from !== current.from) return true;
    return !isWithinOneMinute(current, next);
  }
  return true;
}

function MessageBody({
  message,
  time,
  onOpenImage,
  onOpenLocation,
}: {
  message: UiChatMessage;
  time?: string;
  onOpenImage: (src: string) => void;
  onOpenLocation: (place: {
    placeName: string;
    latitude?: number;
    longitude?: number;
  }) => void;
}) {
  if (message.kind === "image" && message.imageSrc) {
    return (
      <ChatMessageBubble from={message.from} time={time} className="text-left">
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
    return (
      <ChatMessageBubble from={message.from} time={time} className="text-left">
        <button
          type="button"
          aria-label={`${message.placeName} 지도 크게 보기`}
          className="flex w-[220px] cursor-pointer flex-col gap-2 text-left"
          onClick={() =>
            onOpenLocation({
              placeName: message.placeName!,
              latitude: message.latitude,
              longitude: message.longitude,
            })
          }
        >
          <span className="pointer-events-none relative h-[120px] w-full overflow-hidden bg-[#d9d9d9]">
            <KakaoMapPicker
              fill
              interactive={false}
              initialLatitude={message.latitude}
              initialLongitude={message.longitude}
              className="h-full w-full"
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
    <ChatMessageBubble from={message.from} time={time}>
      {message.text}
    </ChatMessageBubble>
  );
}

/** 대화 메시지 스트림 — 사진·지도 클릭 시 Dialog로 확대 */
export function ChatConversation({
  peerName,
  peerImageUrl,
  messages,
  hasMore = false,
  loadingOlder = false,
  onLoadOlder,
  onViewReservation,
  onPeerProfileClick,
}: ChatConversationProps) {
  const [viewer, setViewer] = useState<MediaViewer | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const didInitScroll = useRef(false);
  const prevFirstId = useRef<string | undefined>(undefined);
  const prevLastId = useRef<string | undefined>(undefined);
  const prevScrollHeight = useRef(0);
  const loadOlderRef = useRef(onLoadOlder);

  const firstId = messages[0]?.id;
  const lastId = messages[messages.length - 1]?.id;

  useEffect(() => {
    loadOlderRef.current = onLoadOlder;
  }, [onLoadOlder]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (!didInitScroll.current) {
      el.scrollTop = el.scrollHeight;
      didInitScroll.current = true;
      prevFirstId.current = firstId;
      prevLastId.current = lastId;
      prevScrollHeight.current = el.scrollHeight;
      return;
    }

    if (firstId && firstId !== prevFirstId.current) {
      el.scrollTop += el.scrollHeight - prevScrollHeight.current;
    } else if (lastId && lastId !== prevLastId.current) {
      el.scrollTop = el.scrollHeight;
    }

    prevFirstId.current = firstId;
    prevLastId.current = lastId;
    prevScrollHeight.current = el.scrollHeight;
  }, [firstId, lastId, messages]);

  useEffect(() => {
    const root = scrollRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel || !hasMore || loadingOlder) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadOlderRef.current?.();
      },
      { root, rootMargin: "40px 0px 0px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, firstId, loadingOlder]);

  return (
    <>
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-3 py-5 lg:px-[30px] lg:py-[30px]"
      >
        <div className="flex flex-col gap-5">
          <div ref={sentinelRef} className="h-px shrink-0" aria-hidden />
          {loadingOlder ? (
            <div className="flex justify-center py-1">
              <Spinner size="sm" label="이전 메시지" inline />
            </div>
          ) : null}
          {messages.map((message, index) => {
            const prev = messages[index - 1];
            const dateLabel =
              message.createdAt &&
              (!prev || !isSameChatDay(prev.createdAt, message.createdAt))
                ? formatChatDateLabel(message.createdAt)
                : "";
            const dateDivider = dateLabel ? (
              <ChatDateDivider label={dateLabel} />
            ) : null;

            if (
              message.kind === "system-reservation" &&
              message.reservationSummary
            ) {
              const notice = (
                <ChatReservationNotice
                  from={message.from}
                  dateLine={message.reservationSummary.dateLine}
                  timePlaceLine={message.reservationSummary.timePlaceLine}
                  time={message.time}
                  onViewDetails={onViewReservation}
                />
              );
              if (message.from === "peer") {
                return (
                  <Fragment key={message.id}>
                    {dateDivider}
                    <div className="flex items-start gap-2.5 lg:gap-3.5">
                      <PeerAvatar
                        src={peerImageUrl}
                        name={peerName}
                        onClick={onPeerProfileClick}
                      />
                      <div className="flex min-w-0 flex-col gap-3.5">
                        <PeerName
                          name={peerName}
                          onClick={onPeerProfileClick}
                        />
                        {notice}
                      </div>
                    </div>
                  </Fragment>
                );
              }
              return (
                <Fragment key={message.id}>
                  {dateDivider}
                  {notice}
                </Fragment>
              );
            }

            if (message.kind === "typing") {
              return (
                <Fragment key={message.id}>
                  {dateDivider}
                  <div className="flex items-start gap-2.5">
                    <PeerAvatar
                      src={peerImageUrl}
                      name={peerName}
                      onClick={onPeerProfileClick}
                    />
                    <div className="flex flex-col gap-2.5">
                      <PeerName name={peerName} onClick={onPeerProfileClick} />
                      <div className="flex h-[39px] items-center justify-center rounded-[10px] bg-[rgba(134,134,134,0.1)] px-4">
                        <span className="flex gap-1">
                          <span className="size-1.5 rounded-full bg-[#868686]" />
                          <span className="size-1.5 rounded-full bg-[#868686]" />
                          <span className="size-1.5 rounded-full bg-[#868686]" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Fragment>
              );
            }

            const showTime = shouldShowMessageTime(messages, index);
            const body = (
              <MessageBody
                message={message}
                time={showTime ? message.time : undefined}
                onOpenImage={(src) => setViewer({ kind: "image", src })}
                onOpenLocation={(place) =>
                  setViewer({ kind: "location", ...place })
                }
              />
            );

            if (message.from === "peer") {
              const showMeta = shouldShowPeerMeta(messages, index);
              return (
                <Fragment key={message.id}>
                  {dateDivider}
                  <div className="flex items-start gap-2.5 lg:gap-3.5">
                    <span
                      className={cn(
                        PEER_AVATAR_SIZE_CLASS,
                        "overflow-hidden",
                        !showMeta && "invisible"
                      )}
                      aria-hidden={!showMeta}
                    >
                      <PeerAvatar
                        src={peerImageUrl}
                        name={peerName}
                        onClick={showMeta ? onPeerProfileClick : undefined}
                      />
                    </span>
                    <div className="flex min-w-0 flex-col gap-3.5">
                      {showMeta ? (
                        <PeerName
                          name={peerName}
                          onClick={onPeerProfileClick}
                        />
                      ) : null}
                      {body}
                    </div>
                  </div>
                </Fragment>
              );
            }

            return (
              <Fragment key={message.id}>
                {dateDivider}
                <div>{body}</div>
              </Fragment>
            );
          })}
        </div>
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
            <KakaoMapPicker
              interactive={false}
              initialLatitude={viewer.latitude}
              initialLongitude={viewer.longitude}
              className="size-full max-h-[400px] min-h-[240px] sm:size-[400px]"
            />
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
