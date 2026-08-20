export type AppointmentTime = {
  period: "AM" | "PM";
  hour: number;
  minute: number;
};

export type AppointmentLocation = {
  label: string;
  placeName: string;
};

export type AppointmentDraft = {
  date: Date | null;
  time: AppointmentTime | null;
  location: AppointmentLocation | null;
  notificationEnabled: boolean;
  notificationMinutes: number;
};

export type AppointmentPickerView = "main" | "date" | "time" | "location";

export type AppointmentStackedPicker = "date" | "time" | "location" | null;

export const emptyAppointmentDraft = (): AppointmentDraft => ({
  date: null,
  time: null,
  location: null,
  notificationEnabled: true,
  notificationMinutes: 10,
});
