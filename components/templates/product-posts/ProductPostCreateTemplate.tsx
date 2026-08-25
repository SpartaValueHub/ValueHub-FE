import { ProductPostCreateForm } from "@/components/organisms/product-posts/ProductPostCreateForm";
import type {
  ProductPostFormInitialValues,
  ProductPostFormMode,
} from "@/components/organisms/product-posts/ProductPostCreateForm";

interface ProductPostCreateTemplateProps {
  mode?: ProductPostFormMode;
  initialValues?: ProductPostFormInitialValues;
}

export function ProductPostCreateTemplate({
  mode = "create",
  initialValues,
}: ProductPostCreateTemplateProps = {}) {
  return (
    <main className="flex flex-1 flex-col bg-[#323232] pt-[72px] md:pt-[140px]">
      <ProductPostCreateForm mode={mode} initialValues={initialValues} />
    </main>
  );
}
