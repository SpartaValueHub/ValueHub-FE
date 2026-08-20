"use client";

import { useState } from "react";

import { Icon } from "@/components/atoms/icons";
import { VhInput } from "@/components/atoms/vh-input";
import { AlertDialog } from "@/components/molecules/AlertDialog";
import { DialogDescription } from "@/components/molecules/Dialog";
import { cn } from "@/lib/utils";

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (password: string) => void;
  hint?: string;
}

function PasswordField({
  id,
  value,
  onChange,
  placeholder,
  visible,
  onToggleVisible,
  hint,
  error,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  visible: boolean;
  onToggleVisible: () => void;
  hint?: string;
  error?: string;
}) {
  const focused = value.length > 0;

  return (
    <div className="flex w-full flex-col items-start gap-1.5">
      <VhInput
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        autoComplete="new-password"
        inputState={focused ? "focus" : "default"}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "border-[#323232] text-[#323232] placeholder:text-[#ababab]",
          "focus:border-[#323232] focus:text-[#323232]"
        )}
        trailing={
          <button
            type="button"
            aria-label={visible ? "비밀번호 숨기기" : "비밀번호 표시"}
            onClick={onToggleVisible}
            className="flex size-7 items-center justify-center overflow-clip"
          >
            <Icon name={visible ? "eye" : "eye-off"} size={28} />
          </button>
        }
      />
      {error ? (
        <p className="flex items-center gap-0.5 font-sans text-[13px] text-[#e97c00]">
          <Icon name="warning" size={18} />
          {error}
        </p>
      ) : hint ? (
        <p className="font-sans text-[13px] text-[#606060]">{hint}</p>
      ) : null}
    </div>
  );
}

/** Figma 비밀번호 재설정 모달 */
export function PasswordResetDialog({
  open,
  onOpenChange,
  onSubmit,
  hint = "특수문자 1개 이상을 포함한 영문, 숫자 조합 8-16자리",
}: PasswordResetDialogProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  function resetFields() {
    setPassword("");
    setConfirm("");
    setShowPassword(false);
    setShowConfirm(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetFields();
    onOpenChange?.(next);
  }

  function handleSubmit() {
    if (!password || mismatch) return;
    onSubmit?.(password);
    resetFields();
    onOpenChange?.(false);
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={handleOpenChange}
      primaryLabel="비밀번호 재설정"
      onPrimary={handleSubmit}
    >
      <div className="flex w-full flex-col gap-[30px]">
        <DialogDescription>새로운 비밀번호를 입력해주세요.</DialogDescription>
        <div className="flex w-full flex-col gap-5">
          <PasswordField
            id="new-password"
            value={password}
            onChange={setPassword}
            placeholder="새 비밀번호"
            visible={showPassword}
            onToggleVisible={() => setShowPassword((prev) => !prev)}
            hint={hint}
          />
          <PasswordField
            id="new-password-confirm"
            value={confirm}
            onChange={setConfirm}
            placeholder="새 비밀번호 확인"
            visible={showConfirm}
            onToggleVisible={() => setShowConfirm((prev) => !prev)}
            error={mismatch ? "비밀번호가 일치하지 않습니다." : undefined}
          />
        </div>
      </div>
    </AlertDialog>
  );
}
