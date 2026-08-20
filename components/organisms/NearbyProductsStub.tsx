import Image from "next/image";

interface StubCard {
  name: string;
  price: string;
  deliveryNote: string;
  time: string;
  image: string;
}

const STUB_ITEMS: StubCard[] = [
  {
    name: "루이비통 모노그램 니트 반팔티",
    price: "1,500,000원",
    deliveryNote: "배송비포함",
    time: "30분 전",
    image: "/brand/logo-mark.png",
  },
  {
    name: "알반 아트웰드 캠브리지 벨프도넌",
    price: "1,500,000원",
    deliveryNote: "제주/산간별도",
    time: "30분 전",
    image: "/brand/logo-mark.png",
  },
  {
    name: "쇼파드 알파인이글",
    price: "1,500,000원",
    deliveryNote: "배송비포함",
    time: "30분 전",
    image: "/brand/logo-mark.png",
  },
  {
    name: "불가리 BB33 골드",
    price: "1,500,000원",
    deliveryNote: "배송비포함",
    time: "30분 전",
    image: "/brand/logo-mark.png",
  },
  {
    name: "샤넬 드팔백 라지 핑크",
    price: "1,500,000원",
    deliveryNote: "제주/산간별도",
    time: "30분 전",
    image: "/brand/logo-mark.png",
  },
];

const BANNER_ITEMS = [
  { label: "JEWELRY", image: "/brand/logo-mark.png" },
  { label: "Elevate Your Legacy", image: "/brand/logo-mark.png" },
  { label: "Year-End Rewards", image: "/brand/logo-mark.png" },
  { label: "SUMMER", image: "/brand/logo-mark.png" },
  { label: "The New Edit", image: "/brand/logo-mark.png" },
];

export function NearbyProductsStub() {
  return (
    <>
      {/* ── 동네 추천 상품 ── */}
      <section className="mx-auto w-full max-w-[1240px] px-5 pt-10 sm:px-8">
        <h2 className="mb-5 font-sans text-base font-semibold text-vh-gray-100">
          동네 추천 상품
        </h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {STUB_ITEMS.map((item) => (
            <div key={item.name} className="group cursor-pointer">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-vh-gray-700">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              </div>
              <div className="mt-2.5 space-y-0.5">
                <p className="truncate font-sans text-sm text-vh-gray-100">
                  {item.name}
                </p>
                <p className="font-sans text-sm font-bold text-vh-gray-100">
                  {item.price}{" "}
                  <span className="text-xs font-normal text-vh-gray-500">
                    {item.deliveryNote}
                  </span>
                </p>
                <p className="font-sans text-xs text-vh-gray-500">
                  {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 배너 섹션 ── */}
      <section className="mx-auto w-full max-w-[1240px] px-5 pb-16 pt-10 sm:px-8 md:pb-20">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {BANNER_ITEMS.map((banner) => (
            <div
              key={banner.label}
              className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-lg bg-vh-gray-700"
            >
              <Image
                src={banner.image}
                alt={banner.label}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 20vw"
              />
              <div className="absolute left-3 top-3 rounded-full bg-black/50 px-2 py-0.5 font-sans text-[10px] text-white">
                AD
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
