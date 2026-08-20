import { ListingSideActions } from "@/components/organisms/listing/ListingSideActions";
import { NearbyProductPosts } from "@/components/organisms/product-posts/NearbyProductPosts";
import { ProductDetailAdBanners } from "@/components/organisms/product-posts/ProductDetailAdBanners";
import type { ProductChatViewerRole } from "@/components/molecules/product-posts/ProductChatCta";
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
}

/** Figma product_detail — 공통 Header/Footer는 레이아웃, 본문+추천+AD+FAB */
export function ProductPostDetailTemplate({
  post,
  categoryPath,
  nearbyItems,
  chatRole,
  activeChatCount = 0,
}: ProductPostDetailTemplateProps) {
  return (
    <main className="relative flex flex-1 flex-col bg-[#323232] pb-[100px] pt-[132px] md:pt-[160px]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-[150px] px-5 sm:px-8">
        <ProductPostDetail
          post={post}
          categoryPath={categoryPath}
          chatRole={chatRole}
          activeChatCount={activeChatCount}
        />
        <div className="flex flex-col gap-[150px]">
          <NearbyProductPosts items={nearbyItems} />
          <ProductDetailAdBanners />
        </div>
      </div>
      <ListingSideActions />
    </main>
  );
}
