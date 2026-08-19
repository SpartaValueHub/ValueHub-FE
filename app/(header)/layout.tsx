import { SiteHeader } from "@/components/templates/SiteHeader";
import { loadHeaderCategoryNavService } from "@/services/categories.service";

export default async function HomeLayout({
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
