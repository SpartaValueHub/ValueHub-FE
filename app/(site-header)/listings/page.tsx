/** Listing 목록 스텁 — 헤더 미리보기용. 실제 목록은 Listing 서비스 때 교체 */
export default function ListingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col px-5 py-10 sm:px-8 md:px-10">
      <h1 className="font-serif text-2xl text-vh-gray-100 md:text-3xl">
        상품 목록
      </h1>
      <p className="mt-3 font-sans text-sm text-vh-gray-500">
        Listing 서비스 연동 전 미리보기 화면입니다. 위 헤더(카테고리)를 확인할 수
        있습니다.
      </p>
    </main>
  );
}
