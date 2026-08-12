import { Header } from "@/components/templates/Header";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-vh-surface-charcoal">
      <Header />
      {children}
    </div>
  );
}
