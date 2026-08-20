import { FooterBrand } from "@/components/molecules/FooterBrand";
import { FooterInfoRow } from "@/components/molecules/FooterInfoRow";
import { FooterNavLinks } from "@/components/molecules/FooterNavLinks";
import { FooterSocialLinks } from "@/components/molecules/FooterSocialLinks";
import { cn } from "@/lib/utils";

interface FooterProps {
  /** responsive: 뷰포트 분기 / pc·mobile: 디자인 시스템 고정 레이아웃 */
  layout?: "responsive" | "pc" | "mobile";
  className?: string;
}

export function Footer({ layout = "responsive", className }: FooterProps) {
  const isPc = layout === "pc";
  const isMobile = layout === "mobile";

  return (
    <footer
      className={cn(
        "bg-[#323232] px-5 py-[50px]",
        !isMobile && "md:px-10",
        isPc && "px-10",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1440px] flex-col gap-5",
          !isMobile && "md:flex-row md:items-end md:justify-between",
          isPc && "flex-row items-end justify-between"
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-1.5",
            !isMobile && "md:max-w-[527px]",
            isPc && "max-w-[527px]"
          )}
        >
          <FooterBrand />

          <FooterNavLinks
            layout="row"
            className={cn(
              "justify-start text-[13px] font-normal",
              !isMobile && "md:hidden",
              isPc && "hidden"
            )}
          />

          <FooterInfoRow
            items={[
              <span key="company">상호명 Value Hub</span>,
              <span key="ceo">대표자 홍길동</span>,
              <span
                key="biz"
                className={cn(
                  !isMobile && "hidden md:inline",
                  isPc && "inline"
                )}
              >
                사업자등록번호 123-45-67890
              </span>,
            ]}
          />

          <p
            className={cn(
              "font-sans text-xs leading-normal text-[#868686]",
              !isMobile && "md:hidden",
              isPc && "hidden"
            )}
          >
            사업자등록번호 123-45-67890
          </p>

          <p
            className={cn(
              "font-sans text-xs leading-normal text-[#868686]",
              !isMobile && "md:text-base",
              isPc && "text-base"
            )}
          >
            주소 부산광역시 해운대구 센텀중앙로 123, Value Hub Square 12층
            (재송동)
          </p>

          <FooterInfoRow
            items={[
              <span key="phone">대표번호 1234-5678</span>,
              <span key="email">
                이메일{" "}
                <a
                  href="mailto:contact@valuehub.com"
                  className="transition-colors hover:text-vh-gray-500"
                >
                  contact@valuehub.com
                </a>
              </span>,
            ]}
          />
        </div>

        <div
          className={cn(
            "flex flex-col items-start gap-2",
            !isMobile && "md:items-end",
            isPc && "items-end"
          )}
        >
          <FooterSocialLinks />
          <FooterNavLinks
            layout="row"
            className={cn("hidden", !isMobile && "md:flex", isPc && "flex")}
          />
          <p
            className={cn(
              "w-full font-sans text-[10px] text-[#868686]",
              !isMobile && "text-right md:text-sm",
              isPc && "text-right text-sm",
              isMobile && "text-left"
            )}
          >
            ⓒ 2026 Value Hub. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
