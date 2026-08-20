import { Header } from "@/components/templates/layout/Header";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#323232]">
      <Header />
      {children}
    </div>
  );
}
