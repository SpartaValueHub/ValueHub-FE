import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const socialLinks = [
  { label: "Facebook", href: "#", icon: "/main/icons/facebook.svg" },
  { label: "Instagram", href: "#", icon: "/main/icons/instagram.svg" },
  { label: "X", href: "#", icon: "/main/icons/twitter.svg" },
] as const;

interface FooterSocialLinksProps {
  className?: string;
}

export function FooterSocialLinks({ className }: FooterSocialLinksProps) {
  return (
    <div className={cn("flex items-center gap-6", className)}>
      {socialLinks.map((social) => (
        <Link
          key={social.label}
          href={social.href}
          aria-label={social.label}
          className="relative size-6 transition-opacity hover:opacity-70 md:size-[30px]"
        >
          <Image src={social.icon} alt="" fill className="object-contain" />
        </Link>
      ))}
    </div>
  );
}
