export function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatTimeLabel(hour: number, minute: number) {
  return `${pad(hour)}:${pad(minute)}`;
}

export function buildDateTime(dateKey: string, hour: number, minute: number) {
  const date = parseDateKey(dateKey);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function getLastDateKeys(days: number, endDate = new Date()) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - (days - index - 1));
    return formatDateKey(date);
  });
}

export function formatDayLabel(dateKey: string) {
  return parseDateKey(dateKey).getDate().toString();
}

export function formatWeekday(dateKey: string) {
  return ["日", "一", "二", "三", "四", "五", "六"][parseDateKey(dateKey).getDay()];
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
