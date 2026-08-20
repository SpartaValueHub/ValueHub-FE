import { notFound } from "next/navigation";

import { ProductPostDetail } from "@/components/templates/ProductPostDetail";
import { NearbyProductsStub } from "@/components/organisms/NearbyProductsStub";
import { getProductPostDetailService } from "@/services/product-posts.service";
import { getCategoryPathService } from "@/services/categories.service";

interface ProductPostDetailPageProps {
  params: Promise<{ uuid: string }>;
}

export default async function ProductPostDetailPage({
  params,
}: ProductPostDetailPageProps) {
  const { uuid } = await params;

  let post;
  try {
    post = await getProductPostDetailService(uuid);
  } catch {
    notFound();
  }

  const categoryPath = await getCategoryPathService(post.categoryUuid);

  return (
    <>
      <ProductPostDetail post={post} categoryPath={categoryPath} />
      <NearbyProductsStub />
    </>
  );
}
