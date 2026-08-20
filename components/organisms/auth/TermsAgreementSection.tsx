"use client";

import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import {
  TermDetailModal,
  type TermDetailSection,
} from "@/components/molecules/auth/TermDetailModal";
import { useActiveTerms } from "@/hooks/terms/useActiveTerms";
import { cn } from "@/lib/utils";
import type { ApiActiveTerm, ApiTermCode } from "@/types/terms/api";

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

type TermModalKind = "service" | "privacy" | "marketing" | null;

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
  onArrowClick,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  showArrow?: boolean;
  onArrowClick?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <label className="flex flex-1 cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="vh-checkbox size-4 rounded-none"
        />
        <span className="text-sm text-vh-gray-100">{label}</span>
      </label>
      {showArrow ? (
        <button
          type="button"
          className="shrink-0 rounded p-1 text-vh-gray-500 hover:text-vh-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vh-gold-500"
          aria-label={`${label} 내용 보기`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onArrowClick?.();
          }}
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

function computeAllChecked(terms: TermsState): boolean {
  return (
    terms.service &&
    terms.privacy &&
    terms.marketing &&
    terms.marketingEmail &&
    terms.marketingSms
  );
}

function syncTermsState(terms: TermsState): TermsState {
  const next = { ...terms };

  if (next.marketingEmail || next.marketingSms) {
    next.marketing = true;
  } else {
    next.marketing = false;
  }

  next.all = computeAllChecked(next);
  return next;
}

function findTermByCode(
  terms: ApiActiveTerm[] | null | undefined,
  termCode: ApiTermCode
): ApiActiveTerm | undefined {
  return terms?.find((term) => term.termCode === termCode);
}

function buildModalContent(
  modalKind: TermModalKind,
  terms: ApiActiveTerm[] | null | undefined
): { title: string; sections: TermDetailSection[] } {
  if (modalKind === "service") {
    const term = findTermByCode(terms, "TERMS_OF_SERVICE");
    return {
      title: term?.termName ?? "이용약관",
      sections: term?.content
        ? [{ title: term.termName, content: term.content }]
        : [],
    };
  }

  if (modalKind === "privacy") {
    const term = findTermByCode(terms, "PRIVACY_POLICY");
    return {
      title: term?.termName ?? "개인정보 수집 및 이용",
      sections: term?.content
        ? [{ title: term.termName, content: term.content }]
        : [],
    };
  }

  if (modalKind === "marketing") {
    const emailTerm = findTermByCode(terms, "EMAIL_MARKETING");
    const smsTerm = findTermByCode(terms, "SMS_MARKETING");
    const sections: TermDetailSection[] = [];

    if (emailTerm?.content) {
      sections.push({
        title: emailTerm.termName,
        content: emailTerm.content,
      });
    }
    if (smsTerm?.content) {
      sections.push({
        title: smsTerm.termName,
        content: smsTerm.content,
      });
    }

    return {
      title: "마케팅 활용 수집 이용",
      sections,
    };
  }

  return { title: "", sections: [] };
}

/** 약관 동의 — 회원가입 createMember termConsents 로 전달 */
export function TermsAgreementSection({
  value,
  onChange,
  error,
  className,
}: TermsAgreementSectionProps) {
  const [modalKind, setModalKind] = useState<TermModalKind>(null);
  const { terms, isLoading, error: termsError, load } = useActiveTerms();
  const modalContent = useMemo(
    () => buildModalContent(modalKind, terms),
    [modalKind, terms]
  );
  const allChecked = computeAllChecked(value);

  function openTermModal(kind: Exclude<TermModalKind, null>) {
    setModalKind(kind);
    void load();
  }

  function toggleAll(checked: boolean) {
    onChange(
      syncTermsState({
        all: checked,
        service: checked,
        privacy: checked,
        marketing: checked,
        marketingEmail: checked,
        marketingSms: checked,
      })
    );
  }

  function updateField<K extends keyof TermsState>(key: K, checked: boolean) {
    onChange(
      syncTermsState({
        ...value,
        [key]: checked,
        ...(key === "marketing" && checked
          ? { marketingEmail: true, marketingSms: true }
          : {}),
        ...(key === "marketing" && !checked
          ? { marketingEmail: false, marketingSms: false }
          : {}),
      })
    );
  }

  return (
    <>
      <div className={cn("flex flex-col gap-1", className)}>
        <CheckboxRow
          checked={allChecked}
          onChange={toggleAll}
          label="약관 전체동의"
        />
        <div className="ml-1 border-t border-vh-gray-700/60 pt-1">
          <CheckboxRow
            checked={value.service}
            onChange={(checked) => updateField("service", checked)}
            label="[필수] 이용약관 동의"
            showArrow
            onArrowClick={() => openTermModal("service")}
          />
          <CheckboxRow
            checked={value.privacy}
            onChange={(checked) => updateField("privacy", checked)}
            label="[필수] 개인정보 수집 및 이용 동의"
            showArrow
            onArrowClick={() => openTermModal("privacy")}
          />
          <CheckboxRow
            checked={value.marketing}
            onChange={(checked) => updateField("marketing", checked)}
            label="[선택] 마케팅 활용 수집 이용 동의"
            showArrow
            onArrowClick={() => openTermModal("marketing")}
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
              className="vh-checkbox size-4 rounded-none"
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
              className="vh-checkbox size-4 rounded-none"
            />
            SMS
          </label>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <TermDetailModal
        open={modalKind !== null}
        title={modalContent.title}
        sections={modalContent.sections}
        isLoading={isLoading}
        error={termsError}
        onClose={() => setModalKind(null)}
      />
    </>
  );
}
