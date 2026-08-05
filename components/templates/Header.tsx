"use client";

import Link from "next/link";

import { Button } from "@/components/atoms/button";
import { useAppSession } from "@/context/SessionContext";

export function Header() {
  const { isAuthenticated, isLoading, user, logout } = useAppSession();

  return (
    <header className="w-full shrink-0">
      <nav className="flex w-full items-center justify-end gap-4 px-5 pt-5 sm:px-8 md:gap-5 md:px-10 md:pt-8">
        {isLoading ? (
          <>
            <span
              aria-hidden
              className="inline-block h-10 min-w-24 rounded-none md:h-11 md:min-w-[108px]"
            />
            <span
              aria-hidden
              className="inline-block h-10 min-w-24 rounded-none md:h-11 md:min-w-[108px]"
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
              className="rounded-sm px-5"
              onClick={logout}
            >
              Log out
            </Button>
          </>
        ) : (
          <>
            <Link href="/signup">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 min-w-24 rounded-none border border-vh-gray-100/70 bg-transparent px-5 text-sm font-normal text-vh-gray-100 hover:border-vh-brand-gold hover:bg-transparent hover:text-vh-brand-gold md:h-11 md:min-w-[108px] md:text-base"
              >
                회원가입
              </Button>
            </Link>
            <Link href="/signin">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 min-w-24 rounded-none border border-vh-gray-100/70 bg-transparent px-5 text-sm font-normal text-vh-gray-100 hover:border-vh-brand-gold hover:bg-transparent hover:text-vh-brand-gold md:h-11 md:min-w-[108px] md:text-base"
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
