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

const DUPLICATE_LOGIN_TITLE = "로그아웃 안내";
const DUPLICATE_LOGIN_MESSAGE =
  "다른 기기에서 로그인하여 현재 세션이 종료되었습니다.\n다시 로그인해 주세요.";
const DUPLICATE_LOGIN_CONFIRM_LABEL = "로그인 화면으로 이동";

const AUTH_SKIP_PREFIXES = ["/signup"];
const POLL_INTERVAL_MS = 10_000;

function shouldSkipDuplicateCheck(pathname: string): boolean {
  return AUTH_SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

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
    if (shouldSkipDuplicateCheck(pathname)) return;

    if (isDuplicateLoginModalActive()) {
      setOpen(true);
      return;
    }

    if (checkingRef.current) return;
    checkingRef.current = true;

    try {
      const response = await fetch("/api/auth/session-event", {
        cache: "no-store",
        credentials: "include",
      });
      if (!response.ok) return;

      const data = (await response.json()) as {
        duplicateLogin?: boolean;
        hasSessionMaterial?: boolean;
      };

      if (!data.duplicateLogin) return;

      showDuplicateLoginModal();
    } catch (error) {
      console.error("Duplicate login check failed:", error);
    } finally {
      checkingRef.current = false;
    }
  }, [pathname, showDuplicateLoginModal]);

  useEffect(() => {
    const runInitialCheck = () => {
      void checkDuplicateLogin();
    };

    queueMicrotask(runInitialCheck);

    const onFocus = () => {
      void checkDuplicateLogin();
    };

    window.addEventListener("focus", onFocus);
    const timer = window.setInterval(() => {
      void checkDuplicateLogin();
    }, POLL_INTERVAL_MS);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(timer);
    };
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
