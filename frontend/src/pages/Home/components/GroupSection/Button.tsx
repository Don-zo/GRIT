import { type ReactNode } from 'react';

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
                flex w-full items-center justify-center gap-7 rounded-3xl pr-1 py-3 shadow-xl/20
                bg-green-semidark hover:bg-green-dark transition-colors text-green-light font-medium ${className}
            `}
        >
            <div className="flex items-center justify-center w-auto">
                {icon}
            </div>

            <span className="text-xl">
                {label}
            </span>
        </button>
    );
};

export default Button;