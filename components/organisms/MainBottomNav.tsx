"use client";

import Link from "next/link";

import { Icon, type SystemIconName } from "@/components/atoms/icons";
import { cn } from "@/lib/utils";

interface MainBottomNavProps {
  className?: string;
  activeId?: string;
  floating?: boolean;
}

const navItems: {
  id: string;
  label: string;
  href: string;
  icon: SystemIconName;
}[] = [
  { id: "home", label: "홈", href: "/", icon: "home" },
  { id: "category", label: "카테고리", href: "#", icon: "grid" },
  { id: "chat", label: "채팅", href: "#", icon: "chat" },
  { id: "notification", label: "알림", href: "#", icon: "bell" },
  { id: "profile", label: "마이", href: "#", icon: "user" },
];

export function MainBottomNav({
  className,
  activeId = "home",
  floating = true,
}: MainBottomNavProps) {
  return (
    <nav
      aria-label="모바일 하단 메뉴"
      className={cn(
        "flex h-[60px] w-[340px] shrink-0 items-center gap-6 rounded-[53px] bg-[rgba(50,50,50,0.3)] px-[14px] backdrop-blur-sm",
        floating && "fixed inset-x-0 bottom-4 z-40 mx-auto md:hidden",
        className
      )}
    >
      {navItems.map((item) => {
        const isActive = activeId === item.id;

        return (
          <Link
            key={item.id}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center justify-center overflow-clip rounded-[32px]",
              isActive
                ? "size-10 bg-[rgba(245,245,245,0.75)] p-2 shadow-[0_2px_4px_0_rgba(0,0,0,0.15)]"
                : "size-11 p-2.5"
            )}
          >
            <span className="flex size-6 items-center justify-center overflow-clip">
              <Icon name={item.icon} size={24} />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
