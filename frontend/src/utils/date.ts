import dayjs from "dayjs";

export function formatDisplayDate(iso: string | null): string {
  if (!iso) return "-";
  const d = dayjs(iso);
  return d.isValid() ? d.format("YYYY년 M월 D일") : iso;
}

export function getDaysUntilDDay(iso: string | null): number | null {
  if (!iso) return null;
  const target = dayjs(iso).startOf("day");
  if (!target.isValid()) return null;
  return target.diff(dayjs().startOf("day"), "day");
}
