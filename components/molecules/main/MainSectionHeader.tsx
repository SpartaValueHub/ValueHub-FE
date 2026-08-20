import { TextUnderlineLink } from "@/components/molecules/form/TextUnderlineLink";
import { cn } from "@/lib/utils";

interface MainSectionHeaderProps {
  title: string;
  className?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  navSlot?: React.ReactNode;
}

export function MainSectionHeader({
  title,
  className,
  viewAllHref,
  viewAllLabel = "전체상품보기",
  navSlot,
}: MainSectionHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <h2 className="font-sans text-base font-normal text-vh-gray-100 md:text-[30px]">
        {title}
      </h2>

      <div className="flex items-center gap-2.5">
        {navSlot}

        {viewAllHref ? (
          <TextUnderlineLink href={viewAllHref} variant="section" showChevron>
            {viewAllLabel}
          </TextUnderlineLink>
        ) : null}
      </div>
    </div>
  );
}
