"use client";

import Link from "next/link";

import { Button } from "@/components/atoms/button";
import { useSession } from "@/context/SessionContext";

export function Header() {
  const { isAuthenticated, isLoading, user, logout } = useSession();

  return (
    <header className="w-full">
      <nav className="mx-auto flex max-w-5xl items-center justify-end gap-2 px-4 py-5 md:gap-3 md:py-6">
        {isLoading ? (
          <span className="text-sm text-vh-gray-500">...</span>
        ) : isAuthenticated ? (
          <>
            <span className="text-sm text-vh-gray-100">
              {user?.name || "회원"}
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
                variant="brand"
                size="sm"
                className="min-w-[5.5rem] rounded-sm px-4"
              >
                Sign up
              </Button>
            </Link>
            <Link href="/signin">
              <Button
                variant="brand"
                size="sm"
                className="min-w-[5.5rem] rounded-sm px-4"
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
