/**
 * BE bump 400 message → Figma 실패 모달용 분류.
 * 예: "끌올 쿨다운 중입니다. 123분 후 다시 시도해주세요."
 */

export type BumpFailKind = "cooldown" | "daily_limit" | "generic";

export type BumpFailView = {
  kind: BumpFailKind;
  title: string;
  /** AlertDialog children용 React 없이 조합할 본문 줄 */
  lines: string[];
  /** 쿨다운 남은 시간 강조 (있으면) */
  remainingLabel?: string;
};

function formatRemainingMinutes(totalMinutes: number): string {
  const minutes = Math.max(0, Math.floor(totalMinutes));
  if (minutes < 60) return `${minutes}분 후`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return `${hours}시간 후`;
  return `${hours}시간 ${rest}분 후`;
}

export function classifyBumpFailMessage(message: string): BumpFailView {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  const daily =
    /일일|하루|횟수|한도|모두 사용|내일/.test(trimmed) || /daily/i.test(lower);
  if (daily) {
    return {
      kind: "daily_limit",
      title: "게시글 끌어올리기를 실패했습니다.",
      lines: [
        "사유 : 끌어올리기 가능 횟수를 모두 사용했습니다.",
        "내일 오전 0:00 이후 다시 이용할 수 있습니다.",
      ],
    };
  }

  const cooldown =
    /쿨다운|가능한 시간|분 후|시간 후/.test(trimmed) || /cooldown/i.test(lower);
  if (cooldown) {
    const minuteMatch = trimmed.match(/(\d+)\s*분/);
    const hourMatch = trimmed.match(/(\d+)\s*시간/);
    let remainingLabel: string | undefined;
    if (minuteMatch) {
      remainingLabel = formatRemainingMinutes(Number(minuteMatch[1]));
    } else if (hourMatch) {
      remainingLabel = formatRemainingMinutes(Number(hourMatch[1]) * 60);
    }

    return {
      kind: "cooldown",
      title: "게시글 끌어올리기를 실패했습니다.",
      lines: ["사유 : 아직 끌어올리기가 가능한 시간이 아닙니다."],
      remainingLabel,
    };
  }

  return {
    kind: "generic",
    title: "게시글 끌어올리기를 실패했습니다.",
    lines: [trimmed || "끌어올리기에 실패했습니다."],
  };
}
