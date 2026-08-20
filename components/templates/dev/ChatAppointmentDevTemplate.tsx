"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/atoms/button";
import { PopoverInlineAppointmentFlow } from "@/components/organisms/chat/appointment/PopoverInlineAppointmentFlow";
import { StackedAppointmentFlow } from "@/components/organisms/chat/appointment/StackedAppointmentFlow";

type DevMode = "stacked" | "popover-inline";

interface ChatAppointmentDevTemplateProps {
  mode: DevMode;
}

export function ChatAppointmentDevTemplate({
  mode,
}: ChatAppointmentDevTemplateProps) {
  const [open, setOpen] = useState(false);

  const isStacked = mode === "stacked";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 pb-20 pt-36 md:px-10">
      <header className="space-y-3">
        <p className="font-sans text-sm text-vh-brand-gold">Dev only</p>
        <h1 className="font-serif text-3xl text-vh-gray-100">
          채팅 거래 예약 —{" "}
          {isStacked ? "A안 모달 겹침" : "B안 Popover + 인라인"}
        </h1>
        <p className="font-sans text-sm leading-relaxed text-[#868686]">
          {isStacked
            ? "메인 약속 모달 위에 날짜·시간·장소 선택 모달을 각각 겹쳐 띄웁니다."
            : "약속 모달은 하나만 유지합니다. 날짜·시간은 필드 아래 Popover, 장소는 모달 안에서 인라인으로 펼칩니다."}
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Button variant="brand-solid" onClick={() => setOpen(true)}>
          거래 예약하기 열기
        </Button>
        <Link
          href="/dev/appointment"
          className={buttonVariants({ variant: "brand", size: "sm" })}
        >
          Dev 목록으로
        </Link>
        <Link
          href={
            isStacked ? "/dev/appointment/inline" : "/dev/appointment/stacked"
          }
          className={buttonVariants({ variant: "brand", size: "sm" })}
        >
          {isStacked ? "B안 보기" : "A안 보기"}
        </Link>
      </div>

      <section className="rounded-sm border border-[#606060] bg-[#2a2a2a] p-6 font-sans text-sm text-[#ababab]">
        <p className="text-vh-gray-100">채팅방 배경 (mock)</p>
        <div className="mt-4 space-y-2">
          <div className="inline-block rounded-sm bg-[#404040] px-3 py-2">
            안녕하세요, 거래 가능할까요?
          </div>
          <div className="ml-auto w-fit rounded-sm bg-vh-brand-gold/20 px-3 py-2 text-vh-gray-100">
            네, 약속 잡을게요.
          </div>
        </div>
      </section>

      {isStacked ? (
        <StackedAppointmentFlow open={open} onOpenChange={setOpen} />
      ) : (
        <PopoverInlineAppointmentFlow open={open} onOpenChange={setOpen} />
      )}
    </div>
  );
}
