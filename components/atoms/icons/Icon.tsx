import { VhIcon } from "@/components/atoms/vh-icon";
import { cn } from "@/lib/utils";

export const SYSTEM_ICONS = {
  edit: "/icons/system/software/edit.svg",
  clock: "/icons/system/furniture/clock.svg",
  location: "/icons/system/navigation/location.svg",
  calendar: "/icons/system/essentials/calendar.svg",
  "calendar-plus": "/icons/system/essentials/calendar-plus.svg",
  smile: "/icons/system/emojis/smile.svg",
  "shield-check": "/icons/system/safety/shield-check.svg",
  "calendar-check": "/icons/system/essentials/calendar-check.svg",
  "calendar-reserved": "/icons/system/essentials/calendar-reserved.svg",
  send: "/icons/system/essentials/send.svg",
  "calendar-minus": "/icons/system/essentials/calendar-minus.svg",
  photo: "/icons/system/essentials/photo.svg",
  siren: "/icons/system/essentials/siren.svg",
  chat: "/icons/system/messages/chat.svg",
  alert: "/icons/system/essentials/alert.svg",
  "eye-off": "/icons/system/essentials/eye-off.svg",
  eye: "/icons/system/essentials/eye.svg",
  search: "/icons/system/essentials/search.svg",
  block: "/icons/system/essentials/block.svg",
  refresh: "/icons/system/essentials/refresh.svg",
  "zoom-out": "/icons/system/essentials/zoom-out.svg",
  "my-location": "/icons/system/navigation/my-location.svg",
  camera: "/icons/system/essentials/camera.svg",
  "chevron-right": "/icons/system/arrows/chevron-right.svg",
  more: "/icons/system/menus/more.svg",
  "zoom-in": "/icons/system/essentials/zoom-in.svg",
  "chevron-left": "/icons/system/arrows/chevron-left.svg",
  "offer-check": "/icons/system/essentials/offer-check.svg",
  bell: "/icons/system/essentials/bell.svg",
  swap: "/icons/system/arrows/swap.svg",
  "chevron-up": "/icons/system/arrows/chevron-up.svg",
  check: "/icons/system/essentials/check.svg",
  plus: "/icons/system/essentials/plus.svg",
  close: "/icons/system/essentials/close.svg",
  "chevron-down": "/icons/system/arrows/chevron-down.svg",
  trash: "/icons/system/essentials/trash.svg",
  menu: "/icons/system/menus/hamburger.svg",
  home: "/icons/system/menus/home.svg",
  grid: "/icons/system/menus/grid.svg",
  user: "/icons/system/essentials/user.svg",
  star: "/icons/system/essentials/star.svg",
  "star-fill": "/icons/system/essentials/star-fill.svg",
  boost: "/icons/system/essentials/boost.svg",
  link: "/icons/system/essentials/link.svg",
  warning: "/icons/system/essentials/warning.svg",
} as const;

export type SystemIconName = keyof typeof SYSTEM_ICONS;

export const SYSTEM_ICON_NAMES = Object.keys(SYSTEM_ICONS) as SystemIconName[];

const FLIP_Y: Partial<Record<SystemIconName, boolean>> = {
  "chevron-down": true,
};

interface IconProps {
  name: SystemIconName;
  size?: number;
  className?: string;
  alt?: string;
}

/** Figma 시스템 아이콘 — public/icons/system/{category}/ */
export function Icon({ name, size = 24, className, alt = "" }: IconProps) {
  return (
    <VhIcon
      src={SYSTEM_ICONS[name]}
      width={size}
      height={size}
      alt={alt}
      className={cn(FLIP_Y[name] && "-scale-y-100", className)}
    />
  );
}
