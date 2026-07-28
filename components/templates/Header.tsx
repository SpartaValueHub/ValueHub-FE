"use client";

import Link from "next/link";

import { Button } from "@/components/atoms/button";
import { useSession } from "@/context/SessionContext";

export function Header() {
  const { isAuthenticated, isLoading, user, login, logout } = useSession();

  return (
    <header className="border-b">
      <nav className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <ul className="flex flex-wrap items-center gap-4 text-sm">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/feeds">Feeds</Link>
          </li>
          <li>
            <Link href="/chat">Chat</Link>
          </li>
          <li>
            <Link href="/signup">Signup</Link>
          </li>
          <li>
            <Link href="/signin">Signin</Link>
          </li>
        </ul>

        <div className="flex items-center gap-2 text-sm">
          {isLoading ? (
            <span className="text-muted-foreground">...</span>
          ) : isAuthenticated ? (
            <>
              <span className="text-muted-foreground">
                {user?.name || user?.logInId}
              </span>
              <Button type="button" variant="outline" size="sm" onClick={logout}>
                로그아웃
              </Button>
            </>
          ) : (
            <Button type="button" size="sm" onClick={login}>
              로그인
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
