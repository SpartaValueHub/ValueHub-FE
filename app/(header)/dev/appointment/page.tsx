import Link from "next/link";

import { buttonVariants } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

export default function AppointmentDevIndexPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 pb-20 pt-36 md:px-10">
      <header className="space-y-3">
        <p className="font-sans text-sm text-vh-brand-gold">Dev only</p>
        <h1 className="font-serif text-3xl text-vh-gray-100">
          채팅 거래 예약 UX 비교
        </h1>
        <p className="font-sans text-sm text-[#868686]">
          Figma 와이어프레임 기준 — 두 가지 인터랙션 패턴을 비교합니다.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/dev/appointment/stacked"
          className={cn(
            buttonVariants({ variant: "brand-solid", size: "lg" }),
            "h-auto flex-col items-start gap-2 px-6 py-5 text-left"
          )}
        >
          <span className="text-base font-medium">A안 — 모달 겹침</span>
          <span className="text-sm font-normal opacity-80">
            메인 모달 + 날짜/시간/장소 서브 모달
          </span>
        </Link>

        <Link
          href="/dev/appointment/inline"
          className={cn(
            buttonVariants({ variant: "brand-solid", size: "lg" }),
            "h-auto flex-col items-start gap-2 px-6 py-5 text-left"
          )}
        >
          <span className="text-base font-medium">B안 — Popover + 인라인</span>
          <span className="text-sm font-normal opacity-80">
            날짜·시간 Popover / 장소 모달 안 펼침
          </span>
        </Link>
      </div>

      <Link
        href="/design-system"
        className={buttonVariants({ variant: "brand", size: "sm" })}
      >
        Design System으로
      </Link>
    </div>
  );
}
