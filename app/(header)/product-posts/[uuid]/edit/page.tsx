import { notFound, redirect } from "next/navigation";

import { ProductPostCreateTemplate } from "@/components/templates/product-posts/ProductPostCreateTemplate";
import {
  PRODUCT_POSTS_PATH,
  productPostEditPath,
} from "@/constants/product-posts";
import { requireAuth } from "@/lib/session";
import { resolveCategoryFormSelection } from "@/services/categories.service";
import { getProductPostDetailService } from "@/services/product-posts.service";

interface ProductPostEditPageProps {
  params: Promise<{ uuid: string }>;
}

export default async function ProductPostEditPage({
  params,
}: ProductPostEditPageProps) {
  const { uuid } = await params;
  const authUser = await requireAuth(productPostEditPath(uuid));

  let post;
  try {
    post = await getProductPostDetailService(uuid);
  } catch {
    notFound();
  }

  if (post.memberUuid !== authUser.memberUuid) {
    redirect(`${PRODUCT_POSTS_PATH}/${encodeURIComponent(uuid)}`);
  }

  if (post.tradeStatus !== "SELLING") {
    redirect(`${PRODUCT_POSTS_PATH}/${encodeURIComponent(uuid)}`);
  }

  const category = await resolveCategoryFormSelection(post.categoryUuid);

  return (
    <ProductPostCreateTemplate
      mode="edit"
      initialValues={{ post, category }}
    />
  );
}
