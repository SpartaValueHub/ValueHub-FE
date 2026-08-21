import { ProductPostCreateTemplate } from "@/components/templates/product-posts/ProductPostCreateTemplate";
import { PRODUCT_POST_CREATE_PATH } from "@/constants/product-posts";
import { requireAuth } from "@/lib/session";

export default async function ProductPostCreatePage() {
  await requireAuth(PRODUCT_POST_CREATE_PATH);
  return <ProductPostCreateTemplate />;
}
