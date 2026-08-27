import { notFound } from "next/navigation";

import type { ProductChatViewerRole } from "@/components/molecules/product-posts/ProductChatCta";
import { ProductPostDetailTemplate } from "@/components/templates/product-posts/ProductPostDetailTemplate";
import { getAuthUser } from "@/lib/session";
import {
  getCategoryPathService,
  listSiblingLeafCategoryUuids,
} from "@/services/categories.service";
import { listChatRoomsByProductPostService } from "@/services/chat.service";
import { getMemberPublicProfileService } from "@/services/member.service";
import {
  appendListCenterQuery,
  resolveProductListLocationService,
} from "@/services/product-list-location.service";
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

  const [categoryPath, nearbyCategoryUuids, sellerProfileResult] =
    await Promise.all([
      getCategoryPathService(post.categoryUuid),
      listSiblingLeafCategoryUuids(post.categoryUuid),
      getMemberPublicProfileService(post.memberUuid).then(
        (profile) => ({ ok: true as const, profile }),
        () => ({ ok: false as const })
      ),
    ]);

  const sellerNickname = sellerProfileResult.ok
    ? sellerProfileResult.profile.nickname
    : "";
  const sellerProfileImageUrl = sellerProfileResult.ok
    ? sellerProfileResult.profile.profileImageUrl
    : null;

  let nearbyItems: UiProductPostCard[] = [];
  const locationState = await resolveProductListLocationService({});
  if (locationState.kind === "ready") {
    try {
      const nearbyParams: Record<string, string | string[]> = {
        page: "1",
        size: String(NEARBY_SIZE + 5),
        categoryUuids: nearbyCategoryUuids,
      };
      appendListCenterQuery(nearbyParams, locationState.location);
      const nearby = await listProductPostsService(nearbyParams);
      nearbyItems = nearby.items
        .filter((item) => item.productPostUuid !== post.productPostUuid)
        .slice(0, NEARBY_SIZE);
    } catch {
      nearbyItems = [];
    }
  }

  let activeChatCount = 0;
  if (chatRole === "owner") {
    try {
      const rooms = await listChatRoomsByProductPostService(
        post.productPostUuid
      );
      activeChatCount = rooms.length;
    } catch {
      activeChatCount = 0;
    }
  }

  return (
    <ProductPostDetailTemplate
      post={post}
      categoryPath={categoryPath}
      nearbyItems={nearbyItems}
      chatRole={chatRole}
      activeChatCount={activeChatCount}
      sellerNickname={sellerNickname}
      sellerProfileImageUrl={sellerProfileImageUrl}
    />
  );
}
