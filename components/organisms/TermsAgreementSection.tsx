"use client";

import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type TermsState = {
  all: boolean;
  service: boolean;
  privacy: boolean;
  marketing: boolean;
  marketingEmail: boolean;
  marketingSms: boolean;
};

export const initialTerms: TermsState = {
  all: false,
  service: false,
  privacy: false,
  marketing: false,
  marketingEmail: false,
  marketingSms: false,
};

interface TermsAgreementSectionProps {
  value: TermsState;
  onChange: (value: TermsState) => void;
  error?: string;
  className?: string;
}

function CheckboxRow({
  checked,
  onChange,
  label,
  showArrow = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  showArrow?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
      <span className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="size-4 rounded-none border border-vh-gray-100 bg-transparent accent-vh-gold-500"
        />
        <span className="text-sm text-vh-gray-100">{label}</span>
      </span>
      {showArrow ? (
        <ChevronRight
          className="size-4 shrink-0 text-vh-gray-500"
          aria-hidden
        />
      ) : null}
    </label>
  );
}

/** 약관 동의 — UI 검증 (약관 API 미연동) */
export function TermsAgreementSection({
  value,
  onChange,
  error,
  className,
}: TermsAgreementSectionProps) {
  function toggleAll(checked: boolean) {
    onChange({
      all: checked,
      service: checked,
      privacy: checked,
      marketing: checked,
      marketingEmail: checked,
      marketingSms: checked,
    });
  }

  function updateField<K extends keyof TermsState>(key: K, checked: boolean) {
    const next = { ...value, [key]: checked };
    next.all =
      next.service &&
      next.privacy &&
      next.marketing &&
      next.marketingEmail &&
      next.marketingSms;
    onChange(next);
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <CheckboxRow
        checked={value.all}
        onChange={toggleAll}
        label="약관 전체동의"
      />
      <div className="ml-1 border-t border-vh-gray-700/60 pt-1">
        <CheckboxRow
          checked={value.service}
          onChange={(checked) => updateField("service", checked)}
          label="[필수] 이용약관 동의"
          showArrow
        />
        <CheckboxRow
          checked={value.privacy}
          onChange={(checked) => updateField("privacy", checked)}
          label="[필수] 개인정보 수집 및 이용 동의"
          showArrow
        />
        <CheckboxRow
          checked={value.marketing}
          onChange={(checked) => updateField("marketing", checked)}
          label="[선택] 마케팅 활용 수집 이용 동의"
          showArrow
        />
      </div>
      <div className="ml-8 flex flex-wrap gap-4 pt-1">
        <label className="flex items-center gap-2 text-sm text-vh-gray-500">
          <input
            type="checkbox"
            checked={value.marketingEmail}
            onChange={(event) =>
              updateField("marketingEmail", event.target.checked)
            }
            className="size-4 rounded-none border border-vh-gray-100 bg-transparent accent-vh-gold-500"
          />
          E-mail
        </label>
        <label className="flex items-center gap-2 text-sm text-vh-gray-500">
          <input
            type="checkbox"
            checked={value.marketingSms}
            onChange={(event) =>
              updateField("marketingSms", event.target.checked)
            }
            className="size-4 rounded-none border border-vh-gray-100 bg-transparent accent-vh-gold-500"
          />
          SMS
        </label>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
