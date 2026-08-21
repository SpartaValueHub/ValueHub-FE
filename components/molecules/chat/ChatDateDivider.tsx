interface ChatDateDividerProps {
  label: string;
}

/** 대화 날짜 구분 */
export function ChatDateDivider({ label }: ChatDateDividerProps) {
  return (
    <p className="text-center font-sans text-sm tracking-[-0.28px] text-[#868686]">
      {label}
    </p>
  );
}
