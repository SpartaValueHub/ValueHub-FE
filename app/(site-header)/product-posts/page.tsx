/**
 * 상품 목록 스텁 — product-post 본문 UI는 담당 FE에서 교체.
 * 헤더 카테고리 연동 확인용.
 */
export default function ProductPostsPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col px-5 pb-16 pt-10 sm:px-8 md:pb-20 md:pt-12">
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-vh-gray-100 md:text-3xl">
        상품 목록
      </h1>
      <p className="mt-3 font-sans text-sm text-vh-gray-500">
        product-post 연동 전 미리보기 화면입니다. 위 헤더(카테고리)를 확인할 수
        있습니다.
      </p>
    </main>
  );
}
