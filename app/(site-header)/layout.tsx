import { SiteHeader } from "@/components/templates/SiteHeader";
import { loadHeaderCategoryNavService } from "@/services/categories.service";

/** FO 공통 헤더 — 대분류는 category-service GET /categories */
export default async function SiteHeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categoryNavItems = await loadHeaderCategoryNavService();

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-vh-surface-charcoal">
      <SiteHeader categoryNavItems={categoryNavItems} />
      {children}
    </div>
  );
}
