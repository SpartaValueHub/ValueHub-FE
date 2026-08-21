import Image from "next/image";

type SignupIllustrationProps = {
  variant: "identity" | "complete";
};

const illustrations = {
  identity: {
    src: "/images/signup/identity-verification.png",
    alt: "휴대전화와 신분증을 이용한 본인인증 안내",
  },
  complete: {
    src: "/images/signup/signup-complete.png",
    alt: "회원가입 완료 안내",
  },
} as const;

export function SignupIllustration({ variant }: SignupIllustrationProps) {
  const illustration = illustrations[variant];

  return (
    <div className="relative h-36 w-56 overflow-hidden">
      <Image
        src={illustration.src}
        alt={illustration.alt}
        fill
        sizes="224px"
        className="object-contain mix-blend-screen"
        priority={variant === "identity"}
      />
    </div>
  );
}
