"use client";

import { useEffect, useRef, useState } from "react";

import { SignupFieldWithAction } from "@/components/molecules/auth/SignupFieldWithAction";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void;
        width?: string;
        height?: string;
      }) => {
        embed: (element: HTMLElement) => void;
      };
    };
  }
}

export type DaumPostcodeData = {
  sido: string;
  sigungu: string;
  bname: string;
  bname1: string;
  bname2: string;
  roadAddress: string;
  jibunAddress: string;
  userSelectedType: "R" | "J";
  buildingName: string;
  apartment: "Y" | "N" | "";
};

const DAUM_POSTCODE_SCRIPT =
  "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

/** Daum Postcode oncomplete — 시/도 + 시/군/구 + 법정동(·리)만 조합 (DB 저장용) */
export function buildLegalDongAddress(data: DaumPostcodeData): string {
  const parts: string[] = [];

  const sido = data.sido?.trim();
  const sigungu = data.sigungu?.trim();
  const bname = data.bname?.trim();
  const bname1 = data.bname1?.trim();
  const bname2 = data.bname2?.trim();

  if (sido) parts.push(sido);
  if (sigungu) parts.push(sigungu);

  if (bname1 && bname2) {
    parts.push(bname1, bname2);
  } else if (bname) {
    parts.push(bname);
  } else if (bname2) {
    parts.push(bname2);
  }

  return parts.join(" ");
}

/** Daum Postcode oncomplete — 도로명/지번 + 참고항목 (입력란 표시용) */
export function buildFullDisplayAddress(data: DaumPostcodeData): string {
  let addr =
    data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;

  if (data.userSelectedType === "R") {
    let extraAddr = "";

    if (data.bname && /[동|로|가]$/g.test(data.bname)) {
      extraAddr += data.bname;
    }

    if (data.buildingName && data.apartment === "Y") {
      extraAddr += extraAddr ? `, ${data.buildingName}` : data.buildingName;
    }

    if (extraAddr) {
      addr += ` (${extraAddr})`;
    }
  }

  return addr.trim();
}

interface AddressSearchFieldProps {
  label?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onLegalDongChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

/** Kakao(다음) 우편번호 검색 — CDN 스크립트 로드 후 주소 선택 */
export function AddressSearchField({
  label = "주소",
  name,
  value,
  onChange,
  onLegalDongChange,
  error,
  disabled,
  required,
}: AddressSearchFieldProps) {
  const scriptLoadedRef = useRef(false);
  const embedRef = useRef<HTMLDivElement>(null);
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

  useEffect(() => {
    if (
      scriptLoadedRef.current ||
      document.querySelector(`script[src="${DAUM_POSTCODE_SCRIPT}"]`)
    ) {
      scriptLoadedRef.current = true;
      return;
    }

    const script = document.createElement("script");
    script.src = DAUM_POSTCODE_SCRIPT;
    script.async = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!isPostcodeOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isPostcodeOpen]);

  useEffect(() => {
    if (!isPostcodeOpen || !embedRef.current || !window.daum?.Postcode) {
      return;
    }

    embedRef.current.innerHTML = "";

    new window.daum.Postcode({
      oncomplete: (data) => {
        onChange(buildFullDisplayAddress(data));
        onLegalDongChange?.(buildLegalDongAddress(data));
        setIsPostcodeOpen(false);
      },
      width: "100%",
      height: "100%",
    }).embed(embedRef.current);
  }, [isPostcodeOpen, onChange, onLegalDongChange]);

  function openPostcodeSearch() {
    if (!window.daum?.Postcode) {
      return;
    }

    setIsPostcodeOpen(true);
  }

  function closePostcodeSearch() {
    setIsPostcodeOpen(false);
  }

  return (
    <>
      <SignupFieldWithAction
        label={label}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        error={error}
        disabled={disabled}
        readOnly
        placeholder="주소 검색 버튼을 눌러 주세요"
        actionLabel="주소검색"
        onAction={openPostcodeSearch}
        actionDisabled={disabled}
      />

      {isPostcodeOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="주소 검색"
          onClick={closePostcodeSearch}
        >
          <div
            className={cn(
              "relative flex h-[min(480px,80vh)] w-[min(500px,calc(100vw-2rem))] flex-col",
              "overflow-hidden rounded-md bg-white shadow-lg"
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-2 top-2 z-10 rounded-sm bg-white/90 px-2 py-1 text-sm text-vh-gray-500 hover:text-vh-gray-100"
              aria-label="주소 검색 닫기"
              onClick={closePostcodeSearch}
            >
              닫기
            </button>
            <div ref={embedRef} className="h-full w-full" />
          </div>
        </div>
      ) : null}
    </>
  );
}
