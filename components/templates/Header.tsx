"use client";

import Link from "next/link";

import { Button } from "@/components/atoms/button";
import { useAppSession } from "@/context/SessionContext";

export function Header() {
  const { isAuthenticated, isLoading, user, logout } = useAppSession();

  return (
    <header className="w-full shrink-0">
      <nav className="flex w-full items-center justify-end gap-2 px-6 py-5 md:gap-3 md:px-10 md:py-6">
        {isLoading ? (
          <span className="text-sm text-vh-gray-500">...</span>
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
                className="min-w-[5.5rem] rounded-md border border-vh-gray-100 bg-transparent px-5 py-1.5 text-vh-gray-100 hover:border-vh-gray-100 hover:bg-transparent hover:text-vh-gray-100"
              >
                Sign up
              </Button>
            </Link>
            <Link href="/signin">
              <Button
                variant="ghost"
                size="sm"
                className="min-w-[5.5rem] rounded-md border border-vh-gray-100 bg-transparent px-5 py-1.5 text-vh-gray-100 hover:border-vh-gray-100 hover:bg-transparent hover:text-vh-gray-100"
              >
                Log in
              </Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
