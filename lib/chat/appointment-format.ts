import { APPOINTMENT_WEEKDAYS } from "@/constants/chat-appointment";
import type { AppointmentTime } from "@/types/chat/appointment";

export function formatAppointmentDate(date: Date | null): string {
  if (!date) return "날짜를 선택해주세요";

  const weekday = APPOINTMENT_WEEKDAYS[date.getDay()];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${weekday}요일`;
}

export function formatAppointmentTime(time: AppointmentTime | null): string {
  if (!time) return "시간을 선택해주세요";

  const periodLabel = time.period === "AM" ? "오전" : "오후";
  if (time.minute === 0) {
    return `${periodLabel} ${time.hour}시`;
  }

  return `${periodLabel} ${time.hour}시 ${time.minute}분`;
}

export function formatAppointmentMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}.${month}`;
}
