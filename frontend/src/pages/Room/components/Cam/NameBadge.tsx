import React from "react";
import { Mic, MicOff } from "lucide-react";
import type { NameBadgeProps } from "@/types/cam";

export const NameBadge: React.FC<NameBadgeProps> = ({
    name,
    isMuted,
    onToggleMute,
}) => {
    return (
        <div className="inline-flex items-center gap-1 bg-gray-dark text-white font-light px-3 py-1 rounded-full select-none">
            <button
                onClick={onToggleMute}
                className="flex items-center justify-center w-5 h-5"
            >
                {isMuted ? (
                <MicOff className="text-white w-5 h-5" strokeWidth={1.5}/>
                ) : (
                <Mic className="text-white w-5 h-5" strokeWidth={1.5}/>
                )}
            </button>

            <span className="text-base">{name}</span>
        </div>
    );
};