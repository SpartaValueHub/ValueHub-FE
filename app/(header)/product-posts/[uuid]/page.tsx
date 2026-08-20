import { notFound } from "next/navigation";

import type { ProductChatViewerRole } from "@/components/molecules/product-posts/ProductChatCta";
import { ProductPostDetailTemplate } from "@/components/templates/product-posts/ProductPostDetailTemplate";
import { getAuthUser } from "@/lib/session";
import {
  getCategoryPathService,
  listSiblingLeafCategoryUuids,
} from "@/services/categories.service";
import {
  getProductPostDetailService,
  listProductPostsService,
} from "@/services/product-posts.service";
import type { UiProductPostCard } from "@/types/product-posts/ui";

interface ProductPostDetailPageProps {
  params: Promise<{ uuid: string }>;
}

const NEARBY_SIZE = 5;

function resolveChatRole(
  viewerMemberUuid: string | null,
  sellerMemberUuid: string
): ProductChatViewerRole {
  if (!viewerMemberUuid) return "guest";
  if (viewerMemberUuid === sellerMemberUuid) return "owner";
  return "buyer";
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

  const authUser = await getAuthUser();
  const chatRole = resolveChatRole(
    authUser?.memberUuid ?? null,
    post.memberUuid
  );

  const [categoryPath, nearbyCategoryUuids] = await Promise.all([
    getCategoryPathService(post.categoryUuid),
    listSiblingLeafCategoryUuids(post.categoryUuid),
  ]);

  let nearbyItems: UiProductPostCard[] = [];
  try {
    const nearby = await listProductPostsService({
      page: "1",
      size: String(NEARBY_SIZE + 5),
      categoryUuids: nearbyCategoryUuids,
    });
    nearbyItems = nearby.items
      .filter((item) => item.productPostUuid !== post.productPostUuid)
      .slice(0, NEARBY_SIZE);
  } catch {
    nearbyItems = [];
  }

  return (
    <ProductPostDetailTemplate
      post={post}
      categoryPath={categoryPath}
      nearbyItems={nearbyItems}
      chatRole={chatRole}
      activeChatCount={0}
    />
  );
}
