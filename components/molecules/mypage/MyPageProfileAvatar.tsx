"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import {
  createMemberMediaPresignedUrlAction,
  updateMyProfileImageAction,
} from "@/actions/members";
import { Icon } from "@/components/atoms/icons";
import { Spinner } from "@/components/atoms/spinner";
import { notifyIfSessionExpiredAction } from "@/lib/auth/session-expired.client";
import {
  isAllowedMediaImageFile,
  MEDIA_IMAGE_ACCEPT,
  MEDIA_IMAGE_REJECT_MESSAGE,
  normalizeMediaImageContentType,
} from "@/lib/media/image-file";
import { putFileToS3 } from "@/lib/media/put-to-s3";
import { cn } from "@/lib/utils";

interface MyPageProfileAvatarProps {
  imageUrl?: string | null;
  className?: string;
}

/** 프로필 아바타 — 카메라 클릭 시 Presign → S3 PUT → PATCH /members/me */
export function MyPageProfileAvatar({
  imageUrl,
  className,
}: MyPageProfileAvatarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [failed, setFailed] = useState(false);
  const [displayUrl, setDisplayUrl] = useState(imageUrl?.trim() || null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showImage = Boolean(displayUrl) && !failed;

  const onPick = () => {
    if (pending) return;
    inputRef.current?.click();
  };

  const onFileChange = (files: FileList | null) => {
    const file = files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file || pending) return;

    if (!isAllowedMediaImageFile(file)) {
      setError(MEDIA_IMAGE_REJECT_MESSAGE);
      return;
    }

    const contentType = normalizeMediaImageContentType(file.type);
    if (!contentType) {
      setError(MEDIA_IMAGE_REJECT_MESSAGE);
      return;
    }

    setPending(true);
    setError(null);

    void (async () => {
      try {
        const presign = await createMemberMediaPresignedUrlAction({
          contentType,
          contentLength: file.size,
        });
        if (!presign.ok) {
          notifyIfSessionExpiredAction(presign);
          setError(presign.message);
          return;
        }

        await putFileToS3(presign.data.uploadUrl, file, contentType);

        const saved = await updateMyProfileImageAction({
          profileImageUrl: presign.data.publicUrl,
        });
        if (!saved.ok) {
          notifyIfSessionExpiredAction(saved);
          setError(saved.message);
          return;
        }

        setDisplayUrl(
          saved.data.profileImageUrl?.trim() || presign.data.publicUrl
        );
        setFailed(false);
        router.refresh();
      } catch {
        setError("프로필 이미지를 올리지 못했습니다. 다시 시도해 주세요.");
      } finally {
        setPending(false);
      }
    })();
  };

  return (
    <div className={cn("relative shrink-0", className)}>
      <div className="relative size-[50px] lg:size-[70px]">
        <div className="flex size-full items-center justify-center overflow-hidden rounded-full bg-[rgba(221,221,221,0.87)]">
          {showImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={displayUrl!}
              alt=""
              className="size-full object-cover"
              onError={() => setFailed(true)}
            />
          ) : (
            <>
              <Icon
                name="user"
                size={28}
                className="text-[#606060] lg:hidden"
              />
              <Icon
                name="user"
                size={36}
                className="hidden text-[#606060] lg:inline-block"
              />
            </>
          )}
          {pending ? (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45">
              <Spinner size="sm" inline aria-label="프로필 업로드 중" />
            </span>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="프로필 사진 변경"
          disabled={pending}
          onClick={onPick}
          className="absolute right-0 bottom-0 flex size-4 items-center justify-center rounded-full bg-white disabled:opacity-60 lg:size-[22px]"
        >
          <Icon name="camera" size={10} className="lg:hidden" />
          <Icon name="camera" size={14} className="hidden lg:inline-block" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={MEDIA_IMAGE_ACCEPT}
          className="sr-only"
          onChange={(e) => onFileChange(e.target.files)}
        />
      </div>
      {error ? (
        <p
          className="mt-1 max-w-[140px] font-sans text-[10px] text-[#efbb55] lg:max-w-[200px]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
