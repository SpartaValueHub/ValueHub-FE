"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";

import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Checkbox } from "@/components/atoms/checkbox";
import { Icon, SYSTEM_ICON_NAMES } from "@/components/atoms/icons";
import { Skeleton } from "@/components/atoms/skeleton";
import { Spinner } from "@/components/atoms/spinner";
import { StatusBadge } from "@/components/atoms/status-badge";
import { Toggle } from "@/components/atoms/toggle";
import { VhInput } from "@/components/atoms/vh-input";
import { VerticalDivider } from "@/components/atoms/vertical-divider";
import { BrandLogoIcon } from "@/components/molecules/brand/BrandLogoIcon";
import { BrandWordmark } from "@/components/molecules/brand/BrandWordmark";
import { CategoryDropdown } from "@/components/molecules/form/CategoryDropdown";
import { FeedPostCard } from "@/components/molecules/listing/FeedPostCard";
import { AlertDialog } from "@/components/molecules/overlay/AlertDialog";
import { ChatFilterChip } from "@/components/molecules/chat/ChatFilterChip";
import { DialogMaskedValue } from "@/components/molecules/overlay/Dialog";
import { Empty } from "@/components/molecules/overlay/Empty";
import { FormField } from "@/components/molecules/form/FormField";
import { HeaderAuthLinks } from "@/components/molecules/header/HeaderAuthLinks";
import { HeaderCategoryNav } from "@/components/molecules/header/HeaderCategoryNav";
import { LoginLimitDialog } from "@/components/molecules/auth/LoginLimitDialog";
import { PasswordResetDialog } from "@/components/molecules/auth/PasswordResetDialog";
import { ProductCard } from "@/components/molecules/listing/ProductCard";
import { SideActionButton } from "@/components/molecules/form/SideActionButton";
import { TextUnderlineLink } from "@/components/molecules/form/TextUnderlineLink";
import {
  TrustGrade,
  TRUST_GRADE_LEVELS,
} from "@/components/molecules/listing/TrustGrade";
import {
  HeaderSearchPanel,
  HeaderUtilityIcons,
} from "@/components/organisms/header/HeaderSearchPanel";
import { MainBottomNav } from "@/components/organisms/main/MainBottomNav";
import { Footer } from "@/components/templates/layout/Footer";
import { MAIN_RECOMMENDED_PRODUCTS } from "@/constants/main-page";
import { cn } from "@/lib/utils";

const FIGMA_GOLD = [
  "#4C3B1B",
  "#775D2A",
  "#B89041",
  "#EFBB55",
  "#F2CA7B",
  "#F8E3B9",
  "#FBEFD8",
];
const FIGMA_TAN = [
  "#563D1F",
  "#7D582D",
  "#A4733B",
  "#D4954D",
  "#E5C096",
  "#F1DDC6",
  "#F9F0E6",
];
const FIGMA_GRAY = [
  "#1D1D1D",
  "#323232",
  "#606060",
  "#868686",
  "#ABABAB",
  "#D0D0D0",
  "#F5F5F5",
];

function Section({
  title,
  description,
  code,
  children,
  className,
}: {
  title: string;
  description?: string;
  code?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <div>
        <h2 className="font-sans text-xl text-vh-gray-100">{title}</h2>
        {description ? (
          <p className="mt-1 font-sans text-sm text-[#868686]">{description}</p>
        ) : null}
      </div>
      <div className="rounded-sm border border-[#606060] bg-[#2a2a2a] p-6">
        {children}
        {code ? <Usage code={code} /> : null}
      </div>
    </section>
  );
}

function Usage({ code }: { code: string }) {
  return (
    <pre className="mt-5 overflow-x-auto rounded-sm border border-[#606060] bg-[#1e1e1e] p-4 font-mono text-[11px] leading-relaxed text-[#d0d0d0] md:text-xs">
      <code>{code.trim()}</code>
    </pre>
  );
}

function PaletteRow({ colors }: { colors: string[] }) {
  return (
    <div className="flex">
      {colors.map((color, index) => (
        <span
          key={color}
          title={color}
          className="size-[52px] rounded-full ring-1 ring-black/10 md:size-[62px]"
          style={{ backgroundColor: color, marginLeft: index === 0 ? 0 : -19 }}
        />
      ))}
    </div>
  );
}

function PreviewLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 font-sans text-sm text-[#868686]">{children}</p>;
}

function PcHeaderPreview({
  variant,
}: {
  variant: "guest" | "login" | "search";
}) {
  const searchOpen = variant === "search";
  const isAuthenticated = variant !== "guest";

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/main/hero.png')" }}
      />
      <div
        className={cn(
          "relative bg-[#323232]/70 px-10 py-5",
          searchOpen ? "min-h-[280px]" : "overflow-x-auto"
        )}
      >
        <div className="flex min-w-[960px] flex-col gap-5">
          <div className="relative flex min-h-[52px] items-center justify-between">
            <BrandWordmark size="lg" className="text-[36px]" />
            {searchOpen ? (
              <div className="absolute inset-x-0 z-10 flex justify-center">
                <HeaderSearchPanel />
              </div>
            ) : null}
            <HeaderUtilityIcons
              isAuthenticated={isAuthenticated}
              showSearch={!searchOpen}
              showInboxIcons={isAuthenticated}
            />
          </div>
          <div className="flex items-center justify-between">
            <HeaderCategoryNav activeId="all" />
            <HeaderAuthLinks
              isAuthenticated={isAuthenticated}
              onLogout={() => undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileHeaderPreview({ variant }: { variant: "default" | "back" }) {
  return (
    <div className="relative w-[375px] overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/main/hero.png')" }}
      />
      <div className="relative bg-[#323232]/70 px-[18px] py-2.5">
        <div className="grid grid-cols-[24px_1fr_26px] items-center">
          <span className="flex size-6 items-center justify-center">
            <Icon
              name={variant === "back" ? "chevron-left" : "menu"}
              size={24}
            />
          </span>
          <BrandWordmark size="sm" className="justify-self-center" />
          <span className="flex size-[26px] items-center justify-center">
            <Icon name="search" size={26} />
          </span>
        </div>
        {variant === "default" ? (
          <HeaderCategoryNav
            size="sm"
            activeId="all"
            className="mt-2.5 justify-between"
          />
        ) : null}
      </div>
    </div>
  );
}

function SwatchRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-end gap-6">{children}</div>;
}

function Swatch({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-center font-sans text-sm text-vh-gray-100">{label}</p>
      {children}
    </div>
  );
}

export function DesignSystemTemplate() {
  const [dialogDemo, setDialogDemo] = useState<
    "id" | "email" | "nickname" | "lock" | "findId" | "reset" | null
  >(null);
  const [sampleInput, setSampleInput] = useState("");
  const [underlineValue, setUnderlineValue] = useState("가나다라마바사");
  const [categoryId, setCategoryId] = useState<string>();
  const [chatFilter, setChatFilter] = useState<"all" | "unread">("all");
  const [toggleOn, setToggleOn] = useState(true);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-5 pb-20 pt-36 md:px-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl text-vh-brand-gold md:text-4xl">
          Design System
        </h1>
        <p className="font-sans text-sm text-[#868686] md:text-base">
          Value Hub 공통 UI 컴포넌트 카탈로그 — Figma 디자인 시스템 기준
        </p>
      </header>

      <Section
        title="Color"
        description="Figma Gold · Tan · Grayscale — 어두운 면과 밝은 면에서 동일 스와치"
        code={`
bg-vh-gold-500   // #F2CA7B brand
bg-vh-gold-600   // #EFBB55 star · toggle
bg-vh-tan-500    // #A4733B
bg-[#323232]     // charcoal surface
`}
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6 rounded-sm bg-[#323232] p-6 md:flex-row md:items-center md:justify-between">
            <PaletteRow colors={FIGMA_GOLD} />
            <PaletteRow colors={FIGMA_TAN} />
          </div>
          <div className="flex flex-col gap-6 rounded-sm bg-white p-6 md:flex-row md:items-center md:justify-between">
            <PaletteRow colors={FIGMA_GOLD.slice(0, 6)} />
            <PaletteRow colors={FIGMA_TAN.slice(0, 6)} />
          </div>
          <PaletteRow colors={FIGMA_GRAY} />
        </div>
      </Section>

      <Section
        title="Font"
        description="Noto Serif KR — 브랜드 / Pretendard — UI"
        code={`
<p className="font-serif text-[36px] text-vh-brand-gold">Value hub</p>
<p className="font-sans text-xl text-white">Category</p>
`}
      >
        <div className="flex flex-wrap items-end gap-16">
          <div>
            <p className="font-sans text-sm tracking-wide text-[#868686]">
              Noto serif KR
            </p>
            <p className="mt-2 font-serif text-[36px] text-vh-brand-gold">
              Value hub
            </p>
          </div>
          <div>
            <p className="font-sans text-sm tracking-wide text-[#868686]">
              PRETENDARD
            </p>
            <p className="mt-2 font-sans text-[36px] font-normal text-white">
              Category
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Logo"
        code={`
<BrandLogoIcon size="md" className="size-[42px]" />
<BrandWordmark size="lg" />
`}
      >
        <div className="flex items-end gap-2.5">
          <BrandLogoIcon size="md" className="size-[42px]" />
          <BrandWordmark size="lg" className="text-[36px]" />
        </div>
      </Section>

      <Section
        title="Button"
        description="default/inactive · active · hover 상태 — 직접 올려 확인"
        code={`
<Button variant="brand">button</Button>          // default, hover 시 회색 배경
<Button variant="brand-solid">button</Button>    // active, hover 시 흰색
<Button variant="brand" disabled>button</Button>
`}
      >
        <SwatchRow>
          <Swatch label="default/inactive">
            <Button variant="brand">button</Button>
          </Swatch>
          <Swatch label="active">
            <Button variant="brand-solid">button</Button>
          </Swatch>
          <Swatch label="active hover">
            <p className="sr-only">gold 버튼에 마우스를 올리면 흰색</p>
            <Button variant="brand-solid">button</Button>
          </Swatch>
          <Swatch label="default hover">
            <p className="sr-only">outline 버튼에 마우스를 올리면 회색 배경</p>
            <Button variant="brand">button</Button>
          </Swatch>
          <Swatch label="disabled">
            <Button variant="brand" disabled>
              button
            </Button>
          </Swatch>
        </SwatchRow>
      </Section>

      <Section
        title="Inline Button"
        description="전체상품보기 텍스트 링크"
        code={`
<TextUnderlineLink href="/feeds" variant="section" showChevron>
  전체상품보기
</TextUnderlineLink>
// variant: "section" | "category" | "categoryMuted" | "footer" | "header"
`}
      >
        <TextUnderlineLink href="#" variant="section" showChevron>
          전체상품보기
        </TextUnderlineLink>
      </Section>

      <Section
        title="Check box"
        description="unselected #f8e3b9 border · selected #f8e3b9 fill"
        code={`
<Checkbox />
<Checkbox label="약관 동의" />
<Checkbox label="선택됨" defaultChecked />
`}
      >
        <SwatchRow>
          <Checkbox label="unselected" />
          <Checkbox label="selected" defaultChecked />
        </SwatchRow>
      </Section>

      <Section
        title="Input"
        description="underline default · focus · typed + clear · disabled"
        code={`
<VhInput placeholder="인풋" />
<VhInput value={value} onChange={...} clearable onClear={() => setValue("")} />
<VhInput placeholder="010-1234-5678" disabled />

<FormField label="아이디" name="id" error={error}>
  <input id="id" ... />
</FormField>
`}
      >
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <VhInput placeholder="인풋" />
          <VhInput placeholder="인풋" inputState="focus" defaultValue="인풋" />
          <VhInput
            value={underlineValue}
            onChange={(event) => setUnderlineValue(event.target.value)}
            inputState="focus"
            clearable
            onClear={() => setUnderlineValue("")}
          />
          <div>
            <p className="mb-1 font-sans text-sm text-[#868686]">disable</p>
            <VhInput
              placeholder="010-1234-5678"
              disabled
              defaultValue="010-1234-5678"
            />
          </div>
        </div>
        <div className="mx-auto mt-8 w-full max-w-md">
          <FormField label="아이디" name="demo-id" error={undefined}>
            <input
              id="demo-id"
              value={sampleInput}
              onChange={(event) => setSampleInput(event.target.value)}
              placeholder="아이디 입력"
              className="h-10 min-w-0 flex-1 bg-transparent py-1 text-base text-vh-gray-100 outline-none placeholder:text-vh-gray-700"
            />
          </FormField>
        </div>
      </Section>

      <Section
        title="사이드버튼"
        description="default 원형 · hover 시 라벨 확장"
        code={`
<SideActionButton action="top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
<SideActionButton action="write" onClick={() => router.push("/write")} />
// expanded: 카탈로그용 고정 펼침. 실제 사용은 hover로 자동 확장
`}
      >
        <SwatchRow>
          <Swatch label="top">
            <SideActionButton action="top" />
          </Swatch>
          <Swatch label="글쓰기">
            <SideActionButton action="write" />
          </Swatch>
          <Swatch label="hover">
            <div className="flex items-end gap-4">
              <SideActionButton action="top" expanded />
              <SideActionButton action="write" expanded />
            </div>
          </Swatch>
        </SwatchRow>
      </Section>

      <Section
        title="헤더 아이콘"
        description="default · notification count"
        code={`
<HeaderUtilityIcons
  isAuthenticated
  onSearchClick={() => setSearchOpen(true)}
  notificationCount={10}  // 99 초과 시 "99+"
  chatCount={3}
/>

<HeaderIconButton label="알림" badgeCount={1}>
  {icon}
</HeaderIconButton>
`}
      >
        <div className="flex flex-col gap-8">
          <Swatch label="default">
            <HeaderUtilityIcons isAuthenticated />
          </Swatch>
          <Swatch label="notification count">
            <HeaderUtilityIcons
              isAuthenticated
              searchCount={1}
              notificationCount={10}
              chatCount={100}
            />
          </Swatch>
        </div>
      </Section>

      <Section
        title="판매상태 뱃지"
        code={`
<StatusBadge status="reserved" />  // 예약중
<StatusBadge status="sold" />      // 판매완료
<StatusBadge status="selling" />   // 판매중
<StatusBadge status="document" label="보증서" />
`}
      >
        <SwatchRow>
          <StatusBadge status="reserved" />
          <StatusBadge status="sold" />
          <StatusBadge status="selling" />
          <StatusBadge status="document" label="보증서" />
          <StatusBadge status="document" label="영수증" />
          <StatusBadge status="document" label="감정서" />
        </SwatchRow>
      </Section>

      <Section
        title="드롭다운"
        description="default · click 펼침 · menu hover 골드 틴트"
        code={`
<CategoryDropdown value={id} onChange={setId} placeholder="대분류" />
// options 기본값: Luxury / Collectibles / Premium / Electric
// options?: { id, title, description }[]
`}
      >
        <div className="flex flex-wrap items-start gap-8">
          <Swatch label="default">
            <CategoryDropdown />
          </Swatch>
          <Swatch label="click">
            <CategoryDropdown value={categoryId} onChange={setCategoryId} />
          </Swatch>
        </div>
      </Section>

      <Section
        title="거래안심등급"
        code={`
<TrustGrade level="bronze" />
<TrustGrade level="gold" showLabel={false} />
// level: "bronze" | "silver" | "gold" | "platinum" | "diamond"
`}
      >
        <div className="inline-flex gap-7 bg-white p-5">
          {TRUST_GRADE_LEVELS.map((level) => (
            <TrustGrade key={level} level={level} />
          ))}
        </div>
      </Section>

      <Section
        title="상품카드"
        description="pc landing · mobile landing"
        code={`
<ProductCard name="에르메스 파랑돌 펜던트 목걸이" image="/main/products/product-1.png" size="pc" />
<ProductCard name={name} image={image} size="mobile" />
<ProductCard name={name} image={image} size="landing" />  // 반응형
`}
      >
        <div className="flex flex-wrap items-end gap-8">
          <Swatch label="pc landing page">
            <ProductCard
              name={MAIN_RECOMMENDED_PRODUCTS[0].name}
              image={MAIN_RECOMMENDED_PRODUCTS[0].image}
              size="pc"
            />
          </Swatch>
          <Swatch label="mobile landing page">
            <ProductCard
              name={MAIN_RECOMMENDED_PRODUCTS[0].name}
              image={MAIN_RECOMMENDED_PRODUCTS[0].image}
              size="mobile"
            />
          </Swatch>
        </div>
      </Section>

      <Section
        title="상품 리스트 카드"
        description="피드 목록 — 판매상태 · 관심 · 가격 · 서류 뱃지"
        code={`
<FeedPostCard
  name="에르메스 파랑돌 펜던트 목걸이"
  image="/main/products/product-1.png"
  price={1500000}
  timeAgo="30분 전"
  status="reserved"
  documents={["warranty", "receipt", "appraisal"]}
/>
`}
      >
        <div className="flex flex-wrap items-start gap-8">
          <Swatch label="서류 · 예약중">
            <FeedPostCard
              name="에르메스 파랑돌 펜던트 목걸이"
              image={MAIN_RECOMMENDED_PRODUCTS[0].image}
              price={1_500_000}
              timeAgo="30분 전"
              status="reserved"
              documents={["warranty", "receipt", "appraisal"]}
            />
          </Swatch>
          <Swatch label="기본">
            <FeedPostCard
              name="정품 에르메스 켈리 데페슈 36"
              image={MAIN_RECOMMENDED_PRODUCTS[1].image}
              price={1_500_000}
              timeAgo="30분 전"
            />
          </Swatch>
        </div>
      </Section>

      <Section
        title="Dialog"
        description="Figma 공통 모달 — 닫기 · 본문 · 모달 버튼 1~2개"
        code={`
<AlertDialog
  open={open}
  onOpenChange={setOpen}
  primaryLabel="확인"
  onPrimary={confirm}
  secondaryLabel="취소"
  onSecondary={close}
>
  아이디 중복확인을 해주세요.
</AlertDialog>

<LoginLimitDialog open={open} initialSeconds={119} />
<PasswordResetDialog open={open} />
`}
      >
        <div className="flex flex-wrap gap-3">
          {(
            [
              ["id", "아이디 중복"],
              ["email", "이메일 중복"],
              ["nickname", "닉네임 중복"],
              ["lock", "로그인 제한"],
              ["findId", "아이디 찾기"],
              ["reset", "비밀번호 재설정"],
            ] as const
          ).map(([id, label]) => (
            <Button
              key={id}
              variant="brand-solid"
              size="sm"
              onClick={() => setDialogDemo(id)}
            >
              {label}
            </Button>
          ))}
        </div>

        <AlertDialog
          open={dialogDemo === "id"}
          onOpenChange={(open) => !open && setDialogDemo(null)}
          primaryLabel="확인"
          onPrimary={() => setDialogDemo(null)}
          secondaryLabel="취소"
          onSecondary={() => setDialogDemo(null)}
        >
          아이디 중복확인을 해주세요.
        </AlertDialog>
        <AlertDialog
          open={dialogDemo === "email"}
          onOpenChange={(open) => !open && setDialogDemo(null)}
          primaryLabel="확인"
          onPrimary={() => setDialogDemo(null)}
          secondaryLabel="취소"
          onSecondary={() => setDialogDemo(null)}
        >
          이메일 중복확인을 해주세요.
        </AlertDialog>
        <AlertDialog
          open={dialogDemo === "nickname"}
          onOpenChange={(open) => !open && setDialogDemo(null)}
          primaryLabel="확인"
          onPrimary={() => setDialogDemo(null)}
          secondaryLabel="취소"
          onSecondary={() => setDialogDemo(null)}
        >
          닉네임 중복확인을 해주세요.
        </AlertDialog>
        <LoginLimitDialog
          open={dialogDemo === "lock"}
          key={dialogDemo === "lock" ? "lock" : "lock-closed"}
          initialSeconds={119}
          onOpenChange={(open) => !open && setDialogDemo(null)}
        />
        <AlertDialog
          open={dialogDemo === "findId"}
          onOpenChange={(open) => !open && setDialogDemo(null)}
          title="아이디 찾기"
          primaryLabel="로그인하기"
          onPrimary={() => setDialogDemo(null)}
          secondaryLabel="비밀번호 찾기"
          onSecondary={() => setDialogDemo("reset")}
        >
          <DialogMaskedValue prefix="회원님의 아이디는" value="abcd****" />
        </AlertDialog>
        <PasswordResetDialog
          open={dialogDemo === "reset"}
          onOpenChange={(open) => !open && setDialogDemo(null)}
        />
      </Section>

      <Section
        title="Card + Skeleton"
        code={`
<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
    <CardDescription>설명</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>

<Skeleton className="h-32 w-full" />
`}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>shadow-vh 적용 카드</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">카드 본문 콘텐츠 영역입니다.</p>
            </CardContent>
            <CardFooter>
              <Button variant="brand-solid" size="sm">
                Action
              </Button>
            </CardFooter>
          </Card>

          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </Section>

      <Section
        title="Empty"
        code={`
<Empty
  icon={<Inbox className="size-10" />}
  title="등록된 상품이 없습니다"
  description="다른 카테고리를 확인해 보세요."
  action={<Button variant="brand-solid" size="sm">상품 등록</Button>}
/>
`}
      >
        <Empty
          icon={<Inbox className="size-10" strokeWidth={1.25} />}
          title="등록된 상품이 없습니다"
          description="새 상품을 등록하거나 다른 카테고리를 확인해 보세요."
          action={
            <Button variant="brand-solid" size="sm">
              상품 등록
            </Button>
          }
        />
      </Section>

      <Section
        title="PC Header"
        description="guest · login · search — rgba(50,50,50,0.7) 반투명 고정 헤더 미리보기"
        code={`
<BrandWordmark size="lg" />
<HeaderUtilityIcons isAuthenticated showSearch showInboxIcons />
<HeaderCategoryNav activeId="all" />
<HeaderAuthLinks isAuthenticated />
<HeaderSearchPanel onClose={close} />  // search 변형
`}
      >
        <div className="flex flex-col gap-8">
          <div>
            <PreviewLabel>guest</PreviewLabel>
            <PcHeaderPreview variant="guest" />
          </div>
          <div>
            <PreviewLabel>login</PreviewLabel>
            <PcHeaderPreview variant="login" />
          </div>
          <div>
            <PreviewLabel>search</PreviewLabel>
            <PcHeaderPreview variant="search" />
          </div>
        </div>
      </Section>

      <Section
        title="Mobile Header"
        description="기본(햄버거 + 카테고리) · 상품상세/글작성(뒤로가기, 카테고리 숨김)"
        code={`
<Icon name="menu" />
<BrandWordmark size="sm" />
<Icon name="search" />
<HeaderCategoryNav size="sm" />

// 상품상세, 글작성
<Icon name="chevron-left" />
`}
      >
        <div className="flex flex-wrap items-start gap-8">
          <div>
            <PreviewLabel>default</PreviewLabel>
            <MobileHeaderPreview variant="default" />
          </div>
          <div>
            <PreviewLabel>상품상세 · 글작성</PreviewLabel>
            <MobileHeaderPreview variant="back" />
          </div>
        </div>
      </Section>

      <Section title="PC Footer" code={`<Footer layout="pc" />`}>
        <div className="overflow-x-auto">
          <Footer layout="pc" className="min-w-[960px] px-10" />
        </div>
      </Section>

      <Section
        title="Mobile Footer"
        description="로고 아래 가로 링크 · 사업자번호 단독 행 · 카피라이트 좌측"
        code={`<Footer layout="mobile" />`}
      >
        <div className="w-[375px] overflow-hidden">
          <Footer layout="mobile" />
        </div>
      </Section>

      <Section
        title="Mobile bottom dockbar"
        description="홈 활성 시 흰 원 배경 — MainBottomNav"
        code={`<MainBottomNav floating={false} activeId="home" />`}
      >
        <div className="flex justify-center bg-[#1d1d1d] py-8">
          <MainBottomNav floating={false} activeId="home" />
        </div>
      </Section>

      <Section
        title="Links · Divider · Spinner"
        code={`
<TextUnderlineLink href="/luxury" variant="category">상품 보러가기</TextUnderlineLink>
<VerticalDivider size="md" />
<Spinner size="sm" label="로딩" inline />
`}
      >
        <SwatchRow>
          <TextUnderlineLink href="#" variant="category">
            상품 보러가기
          </TextUnderlineLink>
          <div className="flex items-center gap-2 text-sm text-[#e0e0e0]">
            <span>회원가입</span>
            <VerticalDivider size="md" className="bg-[#e0e0e0]/40" />
            <span>로그인</span>
          </div>
          <Spinner size="sm" label="로딩" inline />
        </SwatchRow>
      </Section>

      <Section
        title="Shadow"
        description="0 2px 15px rgba(0,0,0,0.15)"
        code={`<Card className="shadow-vh">...</Card>  // 또는 className="shadow-vh"`}
      >
        <div className="flex items-center gap-6 rounded-sm bg-[#f5f5f5] p-8">
          <div className="rounded-[4px] bg-white px-5 py-3 shadow-vh">
            <p className="font-sans text-base text-[#323232]">shadow</p>
          </div>
          <p className="font-sans text-sm text-[#606060]">
            x:0, y:2, blur:15, color: #000000, opacity: 15%
          </p>
        </div>
      </Section>

      <Section
        title="Icons"
        description="public/icons/system/{category}/ — essentials · arrows · navigation · messages · safety · menus · emojis · software · furniture"
        code={`
import { Icon } from "@/components/atoms/icons";

<Icon name="edit" size={24} />
<Icon name="chat" />
<Icon name="chevron-down" />
// name: edit | calendar | chat | search | close | trash | ...
`}
      >
        <div className="grid grid-cols-6 gap-4 rounded-sm bg-white p-5 sm:grid-cols-8 md:grid-cols-10">
          {SYSTEM_ICON_NAMES.map((name) => (
            <div
              key={name}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <Icon name={name} size={28} />
              <span className="w-full truncate font-sans text-[9px] text-[#868686]">
                {name}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="모달 버튼"
        code={`<Button variant="modal" className="h-[57px] w-[253px]">버튼</Button>`}
      >
        <div className="rounded-sm bg-white p-5">
          <Button variant="modal" className="h-[57px] w-[253px]">
            버튼
          </Button>
        </div>
      </Section>

      <Section
        title="채팅 필터 버튼"
        code={`
import { ChatFilterChip } from "@/components/molecules/chat/ChatFilterChip";

<ChatFilterChip selected={filter === "all"} onClick={() => setFilter("all")}>
  전체채팅
</ChatFilterChip>
<ChatFilterChip selected={filter === "unread"} onClick={() => setFilter("unread")}>
  안읽음
</ChatFilterChip>
`}
      >
        <div className="flex gap-[23px] rounded-sm bg-white p-5">
          <ChatFilterChip
            selected={chatFilter === "all"}
            onClick={() => setChatFilter("all")}
          >
            전체채팅
          </ChatFilterChip>
          <ChatFilterChip
            selected={chatFilter === "unread"}
            onClick={() => setChatFilter("unread")}
          >
            안읽음
          </ChatFilterChip>
        </div>
      </Section>

      <Section
        title="토글"
        code={`
<Toggle checked={on} onCheckedChange={setOn} label="알림" />
<Toggle defaultChecked={false} />
`}
      >
        <div className="flex items-center gap-10 rounded-sm bg-white p-5">
          <div className="flex flex-col items-center gap-3">
            <p className="font-sans text-sm text-[#323232]">on</p>
            <Toggle
              checked={toggleOn}
              onCheckedChange={setToggleOn}
              label="토글"
            />
          </div>
          <div className="flex flex-col items-center gap-3">
            <p className="font-sans text-sm text-[#323232]">off</p>
            <Toggle defaultChecked={false} label="토글 꺼짐" />
          </div>
        </div>
      </Section>
    </div>
  );
}
