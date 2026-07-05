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

export type DDayDisplayParts = {
  sign: "-" | "+";
  days: string;
};

/** TopBar 등 D-23 / D+123 / D-? 분리 표시용 */
export function getDDayDisplayParts(
  iso: string | null | undefined,
): DDayDisplayParts {
  const daysLeft = getDaysUntilDDay(iso ?? null);
  if (daysLeft === null) return { sign: "-", days: "?" };
  if (daysLeft >= 0) return { sign: "-", days: String(daysLeft) };
  return { sign: "+", days: String(Math.abs(daysLeft)) };
}
