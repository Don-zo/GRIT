import { type InputHTMLAttributes } from "react";

type FormInputProps = {
  className?: string;
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function FormInput({ className, label = "", ...props }: FormInputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#D6FDE5]">
        {label}
      </label>
      <input
        className={`h-12 w-full rounded-lg bg-white px-4 text-gray-900 outline-none ${className}`}
        {...props}
      />
    </div>
  );
}
