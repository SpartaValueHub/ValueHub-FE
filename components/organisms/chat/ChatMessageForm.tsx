"use client";

import { useRef, useState } from "react";

import { Icon } from "@/components/atoms/icons";
import { LocationRegisterDialog } from "@/components/molecules/overlay/LocationRegisterDialog";

export type ChatOutgoingPayload =
  | { kind: "text"; text: string }
  | { kind: "image"; src: string }
  | { kind: "location"; placeName: string };

interface ChatMessageFormProps {
  onSend?: (payload: ChatOutgoingPayload) => void;
}

/** 채팅 입력바 — 텍스트·사진·장소 전송 */
export function ChatMessageForm({ onSend }: ChatMessageFormProps) {
  const [text, setText] = useState("");
  const [placeOpen, setPlaceOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function submitText() {
    const next = text.trim();
    if (!next) return;
    onSend?.({ kind: "text", text: next });
    setText("");
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      onSend?.({ kind: "image", src: URL.createObjectURL(file) });
    }
  }

  return (
    <>
      <form
        className="flex flex-col gap-4 border-t-2 border-[#f2ca7b] px-3.5 pt-2.5 pb-5 lg:flex-row lg:items-center lg:gap-5 lg:border-t lg:px-[30px] lg:py-5"
        onSubmit={(event) => {
          event.preventDefault();
          submitText();
        }}
      >
        <div className="flex items-center gap-5">
          <button
            type="button"
            aria-label="사진 첨부"
            className="text-[#323232]"
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon name="photo" size={26} />
          </button>
          <button
            type="button"
            aria-label="장소 공유"
            className="text-[#323232]"
            onClick={() => setPlaceOpen(true)}
          >
            <Icon name="location" size={26} />
          </button>
          <button type="button" aria-label="이모지" className="text-[#323232]">
            <Icon name="smile" size={26} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            multiple
            className="sr-only"
            onChange={handlePhotoChange}
          />
        </div>
        <div className="flex h-9 min-w-0 flex-1 items-center justify-between rounded-[6px] bg-[#f5f5f5] px-1.5 lg:h-10">
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="보낼 메시지를 입력하세요."
            className="h-full min-w-0 flex-1 bg-transparent px-1.5 font-sans text-[13px] tracking-[-0.26px] text-[#323232] outline-none placeholder:text-[#ababab] lg:text-base lg:tracking-[-0.32px]"
          />
          <button type="submit" aria-label="전송" className="shrink-0">
            <Icon name="send" size={26} />
          </button>
        </div>
      </form>

      <LocationRegisterDialog
        open={placeOpen}
        onOpenChange={setPlaceOpen}
        confirmLabel="전송"
        onConfirm={(placeName) => onSend?.({ kind: "location", placeName })}
      />
    </>
  );
}
