# ValueHub-FO

ValueHub 프론트엔드(Next.js) 애플리케이션입니다.

Git 컨벤션은 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참고하세요.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Git / Husky / 코드 스타일

- 브랜치·커밋·PR 규칙: [CONTRIBUTING.md](./CONTRIBUTING.md)
- 로컬 개발·스크립트·Husky pre-commit: [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)
- **pre-commit:** staged 파일에 ESLint(`--fix`) + Prettier 자동 적용 (`lint-staged`). 실패 시 커밋 중단.
- 패키지 매니저는 **pnpm**만 사용합니다.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
