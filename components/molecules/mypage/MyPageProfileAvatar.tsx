"use client";

import { useState } from "react";

import { Icon } from "@/components/atoms/icons";
import { cn } from "@/lib/utils";

interface MyPageProfileAvatarProps {
  imageUrl?: string | null;
  className?: string;
}

/** 프로필 아바타 — 로드 실패 시 user 아이콘 폴백 (깨진 이미지 아이콘 방지) */
export function MyPageProfileAvatar({
  imageUrl,
  className,
}: MyPageProfileAvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(imageUrl?.trim()) && !failed;

  return (
    <div
      className={cn("relative size-[50px] shrink-0 lg:size-[70px]", className)}
    >
      <div className="flex size-full items-center justify-center overflow-hidden rounded-full bg-[rgba(221,221,221,0.87)]">
        {showImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl!}
            alt=""
            className="size-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <>
            <Icon name="user" size={28} className="text-[#606060] lg:hidden" />
            <Icon
              name="user"
              size={36}
              className="hidden text-[#606060] lg:inline-block"
            />
          </>
        )}
      </div>
      <span className="absolute right-0 bottom-0 flex size-4 items-center justify-center rounded-full bg-white lg:size-[22px]">
        <Icon name="camera" size={10} className="lg:hidden" />
        <Icon name="camera" size={14} className="hidden lg:inline-block" />
      </span>
    </div>
  );
}
