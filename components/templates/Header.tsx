"use client";

import Link from "next/link";

import { Button } from "@/components/atoms/button";
import { useAppSession } from "@/context/SessionContext";

const headerAuthButtonClassName = "h-9 rounded-sm px-5";

export function Header() {
  const { isAuthenticated, isLoading, user, logout } = useAppSession();

  return (
    <header className="w-full shrink-0">
      <nav className="flex w-full items-center justify-end gap-4 px-5 pt-5 sm:px-8 md:gap-5 md:px-10 md:pt-8">
        {isLoading ? (
          <>
            <span
              aria-hidden
              className="inline-block h-7 min-w-20 rounded-sm"
            />
            <span
              aria-hidden
              className="inline-block h-7 min-w-20 rounded-sm"
            />
          </>
        ) : isAuthenticated ? (
          <>
            <span className="text-sm text-vh-gray-100">
              {user?.nickname || "회원"}
            </span>
            <Button
              type="button"
              variant="brand"
              size="sm"
              className={headerAuthButtonClassName}
              onClick={logout}
            >
              로그아웃
            </Button>
          </>
        ) : (
          <>
            <Link href="/signup">
              <Button
                variant="brand"
                size="sm"
                className={headerAuthButtonClassName}
              >
                회원가입
              </Button>
            </Link>
            <Link href="/signin">
              <Button
                variant="brand"
                size="sm"
                className={headerAuthButtonClassName}
              >
                로그인
              </Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
