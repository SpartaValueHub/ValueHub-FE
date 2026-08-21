import { ProductPostCreateForm } from "@/components/organisms/product-posts/ProductPostCreateForm";

export function ProductPostCreateTemplate() {
  return (
    <main className="flex flex-1 flex-col bg-[#323232] pt-[72px] md:pt-[140px]">
      <ProductPostCreateForm />
    </main>
  );
}
