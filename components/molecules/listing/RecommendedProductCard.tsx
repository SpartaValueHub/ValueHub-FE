import { ProductCard } from "@/components/molecules/listing/ProductCard";
import type { RecommendedProduct } from "@/constants/main-page";

interface RecommendedProductCardProps {
  product: RecommendedProduct;
  className?: string;
}

export function RecommendedProductCard({
  product,
  className,
}: RecommendedProductCardProps) {
  return (
    <ProductCard
      name={product.name}
      image={product.image}
      size="landing"
      className={className}
    />
  );
}
