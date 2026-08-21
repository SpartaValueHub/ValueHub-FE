export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-dvh min-h-0 flex-1 flex-col overflow-hidden bg-[#fbefd8]">
      {children}
    </div>
  );
}
