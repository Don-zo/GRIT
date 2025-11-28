import type { EmojiModalProps } from "@/types/bottomBar";

const EMOJIS = [
    "👍", "👎", "👏", "🤚", "❤️", "🫶", "🖕", "🙏", "👊", "🫨",
    "😪", "😭", "🤬", "🥵", "😱", "🙄", "😴", "🤮", "🤯", "️️☠️"
];
  
export default function EmojiModal({ open, onSelect, onClose }: EmojiModalProps) {
    if (!open) return null;
  
    return (
        <div className="absolute bottom-25 left-1/2 -translate-x-1/2">
            <div className="
                w-auto
                bg-gray-dark/100
                rounded-xl 
                px-11 py-4
                shadow-xl 
                text-[40px]
                grid grid-rows-2 grid-flow-col auto-cols-max
                gap-x-6 gap-y-1.5 justify-center
            ">

                <div className="
                    absolute left-1/2 -bottom-1.5 -translate-x-1/2
                    w-8 h-8
                    bg-inherit
                    backdrop-inherit
                    rotate-45
                    rounded-md
                " />

                {EMOJIS.map((emoji) => (
                    <button
                    key={emoji}
                    className="hover:scale-125 transition-transform"
                    onClick={() => {
                        onSelect?.(emoji);
                    }}
                    >
                        {emoji}
                    </button>
                    ))}
            </div>
        </div>
    );
}
  