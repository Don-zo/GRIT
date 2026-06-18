import type { EmojiModalProps } from "@/types/bottomBar";

export default function EmojiModal({
  open,
  reactions = [],
  onSelect,
}: EmojiModalProps) {
  if (!open) return null;

  return (
    <div className="absolute bottom-25 left-1/2 -translate-x-1/2">
      <div
        className="
                relative z-10
                w-auto
                bg-gray-dark/100
                rounded-xl 
                px-6 py-3
                shadow-xl 
                text-[28px]
                grid grid-rows-2 grid-flow-col auto-cols-max
                gap-x-3 gap-y-1 justify-center
            "
      >
        <div
          className="
                    absolute left-1/2 -bottom-1.5 -translate-x-1/2
                    w-8 h-8
                    bg-inherit
                    backdrop-inherit
                    rotate-45
                    rounded-md
                    -z-10
                "
        />

        {reactions.map((reaction) => (
          <button
            key={reaction.name}
            type="button"
            className="hover:scale-125 transition-transform"
            onClick={() => onSelect?.(reaction)}
          >
            {reaction.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
