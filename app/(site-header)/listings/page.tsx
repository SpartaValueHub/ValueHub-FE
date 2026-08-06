/**
 * Listing 목록 스텁 — SiteHeader 미리보기용.
 * 실제 UI(중분류 탭·필터 사이드바·상품 그리드·광고·페이지네이션)는
 * Listing 서비스 FE 때 product_list 시안 기준으로 교체.
 */
export default function ListingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col px-5 pb-16 pt-10 sm:px-8 md:pb-20 md:pt-12">
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-vh-gray-100 md:text-3xl">
        상품 목록
      </h1>
      <p className="mt-3 font-sans text-sm text-vh-gray-500">
        Listing 서비스 연동 전 미리보기 화면입니다. 위 헤더(카테고리)를 확인할 수
        있습니다.
      </p>
    </main>
  );
}
