export const APPOINTMENT_NOTIFICATION_OPTIONS = [
  { label: "10분 전", minutes: 10 },
  { label: "15분 전", minutes: 15 },
  { label: "30분 전", minutes: 30 },
  { label: "1시간 전", minutes: 60 },
  { label: "2시간 전", minutes: 120 },
] as const;

export const APPOINTMENT_HOURS = Array.from(
  { length: 12 },
  (_, index) => index + 1
);
export const APPOINTMENT_MINUTES = ["00", "15", "30", "45"] as const;

export const APPOINTMENT_WEEKDAYS = [
  "일",
  "월",
  "화",
  "수",
  "목",
  "금",
  "토",
] as const;
