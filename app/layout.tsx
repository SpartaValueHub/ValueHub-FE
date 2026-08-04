import type { Metadata } from "next";
import { Ephesis, Geist_Mono, Noto_Serif_KR } from "next/font/google";

import { Footer } from "@/components/templates/Footer";
import { SessionContextProvider } from "@/provider/SessionContextProvider";

import "./globals.css";

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ephesis = Ephesis({
  variable: "--font-ephesis",
  subsets: ["latin"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Value Hub",
  description: "Value Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSerifKr.variable} ${ephesis.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SessionContextProvider>
          {children}
          <Footer />
        </SessionContextProvider>
      </body>
    </html>
  );
}
