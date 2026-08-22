import { ListingSideActions } from "@/components/organisms/listing/ListingSideActions";
import { NearbyProductPosts } from "@/components/organisms/product-posts/NearbyProductPosts";
import { ProductDetailAdBanners } from "@/components/organisms/product-posts/ProductDetailAdBanners";
import {
  ProductChatCta,
  type ProductChatViewerRole,
} from "@/components/molecules/product-posts/ProductChatCta";
import { ProductPostDetail } from "@/components/templates/ProductPostDetail";
import type {
  UiProductPostCard,
  UiProductPostDetail,
} from "@/types/product-posts/ui";

interface ProductPostDetailTemplateProps {
  post: UiProductPostDetail;
  categoryPath: string;
  nearbyItems: UiProductPostCard[];
  chatRole: ProductChatViewerRole;
  activeChatCount?: number;
  sellerNickname?: string;
  sellerProfileImageUrl?: string | null;
}

/** Figma product_detail — 모바일 하단 채팅 고정, PC는 본문 인라인 CTA */
export function ProductPostDetailTemplate({
  post,
  categoryPath,
  nearbyItems,
  chatRole,
  activeChatCount = 0,
  sellerNickname = "",
  sellerProfileImageUrl = null,
}: ProductPostDetailTemplateProps) {
  return (
    <main className="relative flex flex-1 flex-col bg-[#323232] pb-[110px] pt-[72px] md:pb-[100px] md:pt-[160px]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-[50px] md:gap-[150px] md:px-8">
        <ProductPostDetail
          post={post}
          categoryPath={categoryPath}
          chatRole={chatRole}
          activeChatCount={activeChatCount}
          sellerNickname={sellerNickname}
          sellerProfileImageUrl={sellerProfileImageUrl}
        />
        <div className="flex flex-col gap-[50px] px-4 md:gap-[150px] md:px-0">
          <NearbyProductPosts items={nearbyItems} />
          <ProductDetailAdBanners className="hidden md:grid" />
        </div>
      </div>

      {/* 모바일: 채팅 CTA 하단 고정 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#606060] bg-[#323232] p-3.5 md:hidden">
        <div className="mx-auto flex w-full max-w-[300px] justify-center">
          <ProductChatCta
            role={chatRole}
            productPostUuid={post.productPostUuid}
            sellerMemberUuid={post.memberUuid}
            sellerNickname={sellerNickname}
            activeChatCount={activeChatCount}
          />
        </div>
      </div>

      <ListingSideActions />
    </main>
  );
}
