import { type InputHTMLAttributes } from "react";

type FormInputProps = {
  className?: string;
  label: string;
  /** sm: 짧은 높이·작은 글자 (예: 날짜) */
  inputSize?: "md" | "sm";
} & InputHTMLAttributes<HTMLInputElement>;

export function FormInput({
  className,
  label = "",
  inputSize = "md",
  ...props
}: FormInputProps) {
  const sizeClass =
    inputSize === "sm"
      ? "h-9 px-3 text-xs leading-normal"
      : "h-12 px-4";

  return (
    <div>
      <label
        className={`mb-2 block font-medium text-[#D6FDE5] ${
          inputSize === "sm" ? "text-xs" : "text-sm"
        }`}
      >
        {label}
      </label>
      <input
        className={`w-full rounded-lg bg-white text-gray-900 outline-none ${sizeClass} ${className ?? ""}`}
        {...props}
      />
    </div>
  );
}
