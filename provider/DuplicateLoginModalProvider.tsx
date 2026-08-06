"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import { ConfirmModal } from "@/components/molecules/ConfirmModal";
import {
  isDuplicateLoginModalActive,
  releaseDuplicateLoginModal,
  tryAcquireDuplicateLoginModal,
} from "@/lib/auth/duplicate-login-client";
import { subscribeDuplicateLoginEvent } from "@/lib/auth/duplicate-login-event";
import {
  mountDuplicateLoginSessionMonitor,
  performDuplicateLoginCheck,
} from "@/lib/auth/duplicate-login-session-check";

const DUPLICATE_LOGIN_TITLE = "로그아웃 안내";
const DUPLICATE_LOGIN_MESSAGE =
  "다른 기기에서 로그인하여 현재 세션이 종료되었습니다.\n다시 로그인해 주세요.";
const DUPLICATE_LOGIN_CONFIRM_LABEL = "로그인 화면으로 이동";

export function DuplicateLoginModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmPending, setConfirmPending] = useState(false);
  const checkingRef = useRef(false);

  const showDuplicateLoginModal = useCallback(() => {
    if (!tryAcquireDuplicateLoginModal()) return;
    setOpen(true);
  }, []);

  const checkDuplicateLogin = useCallback(async () => {
    await performDuplicateLoginCheck(
      {
        pathname,
        isModalActive: isDuplicateLoginModalActive,
        openModalIfActive: () => setOpen(true),
      },
      checkingRef
    );
  }, [pathname]);

  useEffect(() => {
    return subscribeDuplicateLoginEvent(showDuplicateLoginModal);
  }, [showDuplicateLoginModal]);

  useEffect(() => {
    return mountDuplicateLoginSessionMonitor({
      runCheck: checkDuplicateLogin,
    });
  }, [checkDuplicateLogin]);

  const handleConfirm = async () => {
    setConfirmPending(true);
    try {
      await fetch("/api/auth/local-logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error(
        "Local logout during duplicate login handling failed:",
        error
      );
    }

    await signOut({ redirect: false });
    releaseDuplicateLoginModal();
    setOpen(false);
    router.push("/signin");
    router.refresh();
  };

  return (
    <>
      {children}
      <ConfirmModal
        open={open}
        title={DUPLICATE_LOGIN_TITLE}
        message={DUPLICATE_LOGIN_MESSAGE}
        confirmLabel={DUPLICATE_LOGIN_CONFIRM_LABEL}
        confirmPending={confirmPending}
        dismissible={false}
        onConfirm={() => {
          void handleConfirm();
        }}
      />
    </>
  );
}
