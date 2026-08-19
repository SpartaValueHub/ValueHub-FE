import type { Metadata } from "next";
import { Ephesis, Geist_Mono, Noto_Serif_KR } from "next/font/google";

import { Footer } from "@/components/templates/Footer";
import { getClientSessionUser } from "@/lib/session";
import { AuthSessionProvider } from "@/provider/AuthSessionProvider";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clientUser = await getClientSessionUser();
  const initialSession = {
    isAuthenticated: !!clientUser,
    user: clientUser,
  };

  return (
    <html
      lang="ko"
      className={`${notoSerifKr.variable} ${ephesis.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AuthSessionProvider>
          <SessionContextProvider initialSession={initialSession}>
            {children}
            <Footer />
          </SessionContextProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
