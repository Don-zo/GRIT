import { type ReactNode } from "react";

interface ButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}

const Button = ({ icon, label, onClick, className = "" }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`
                flex w-full items-center justify-center gap-6 rounded-2xl px-6 py-3 shadow-xl/20
                bg-green-semidark hover:bg-green-dark transition-colors text-white font-medium ${className}
            `}
    >
      <div className="flex items-center justify-center">{icon}</div>

      <span className="text-base">{label}</span>
    </button>
  );
};

export default Button;
