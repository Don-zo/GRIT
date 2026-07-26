export type CamTodoThemeMode = "light" | "dark";

export const CAM_TODO_THEME: CamTodoThemeMode = "dark";

const themes = {
  light: {
    cardBg: "bg-gray-light",
    tabActive: "bg-gray-light text-green-dark font-semibold",
    headerBg: "bg-gray-normal rounded-xl",
    title: "text-green-darkest",
    subtitle: "text-gray-semidark",
    chevronBtn: "bg-[#A2ADA9]",
    listPanel: "bg-gray-light",
    itemBg: "bg-gray-normal",
    emptyText: "text-gray-semidark",
    checkboxLabel: "text-gray-darkest",
    progressTrack: "#C5C8C7",
    progressInner: "bg-[#CBCDCD]",
    statusText: "text-gray-semidark",
  },
  dark: {
    cardBg: "bg-[#2E3039]",
    tabActive: "bg-[#2E3039] text-[#EEEEEE] font-semibold",
    headerBg: "bg-[#696C6B]/20 rounded-2xl",
    title: "text-green-light",
    subtitle: "text-white",
    chevronBtn: "bg-[#A2ADA9]/20",
    listPanel: "",
    itemBg: "bg-[#696C6B]/20",
    emptyText: "text-white",
    checkboxLabel: "text-white",
    progressTrack: "#41474D",
    progressInner: "bg-[#41474D]/80",
    statusText: "text-gray-semidark",
  },
} as const;

export const camTodoTheme = themes[CAM_TODO_THEME];
