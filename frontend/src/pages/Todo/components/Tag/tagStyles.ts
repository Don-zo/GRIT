export const tagTokens = {
  text: "text-white/75",
  bg: "bg-green-normal/12",
  bgDone: "bg-green-normal/8",
  placeholderRing: "ring-1 ring-inset ring-white/10",
  inputPlaceholder: "placeholder:text-white/50",
} as const;

const tagFilledSurface = [tagTokens.bg, tagTokens.text].join(" ");

const tagDoneSurface = [tagTokens.bgDone, tagTokens.text].join(" ");

const tagPickerRowLabelBase =
  "min-w-0 max-w-full whitespace-normal break-words rounded px-1.5 py-px text-left text-caption transition";

export function tagListChipClass(done: boolean): string {
  return [
    "inline-block min-w-0 max-w-full break-words rounded px-1.5 py-px text-caption",
    done ? tagDoneSurface : tagFilledSurface,
  ].join(" ");
}

const tagEmptyDisplayChipClass = [
  "inline-flex max-w-full shrink-0 items-center rounded px-1.5 py-px text-left text-caption",
  tagTokens.text,
  tagTokens.placeholderRing,
].join(" ");

export const tagEmptyLabel = "태그 없음";

export const tagPickerTriggerPlaceholderClass = tagEmptyDisplayChipClass;

export function tagListEmptyChipClass(done: boolean): string {
  return [tagEmptyDisplayChipClass, done ? "opacity-55" : ""]
    .filter(Boolean)
    .join(" ");
}

export const tagPickerSelectedChipClass = [
  "inline-flex max-w-full shrink-0 items-center gap-0.5 rounded px-1.5 py-px text-caption",
  tagFilledSurface,
].join(" ");

export const tagPickerChipClearBtnClass =
  "inline-flex shrink-0 rounded p-0 text-white/60 outline-none transition hover:text-white focus-visible:ring-1 focus-visible:ring-white/35";

export const tagPickerListRowSelectedClass = [tagTokens.bg, "rounded-md"].join(
  " ",
);

export const tagPickerRowLabelInListClass = [
  tagPickerRowLabelBase,
  "flex-1 min-w-0 text-left",
  tagTokens.text,
].join(" ");

export const tagPickerRegisterInputClass = [
  "w-full min-w-0 bg-transparent border-0 leading-snug outline-none text-bodySm",
  tagTokens.text,
  tagTokens.inputPlaceholder,
].join(" ");

export const tagPickerHintClass = [
  "px-3 py-1.5 text-[9px] font-medium",
  tagTokens.text,
].join(" ");
