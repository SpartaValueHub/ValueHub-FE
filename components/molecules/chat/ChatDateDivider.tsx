interface ChatDateDividerProps {
  label: string;
}

/** 대화 날짜 구분 */
export function ChatDateDivider({ label }: ChatDateDividerProps) {
  return (
    <p className="text-center font-sans text-xs tracking-[-0.24px] text-[#868686] lg:text-sm lg:tracking-[-0.28px]">
      {label}
    </p>
  );
}
