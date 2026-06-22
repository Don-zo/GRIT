import type { LiveKitReactionMessage } from "@/apis/domains/livekit/type";

export type ReactionItem = LiveKitReactionMessage & { id: number; left: number };

interface Props {
  reactions: ReactionItem[];
}

const ReactionFloater = ({ reactions }: Props) => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0);      opacity: 1; }
          80%  { transform: translateY(-180px); opacity: 1; }
          100% { transform: translateY(-220px); opacity: 0; }
        }
      `}</style>
      {reactions.map((r) => (
        <div
          key={r.id}
          className="absolute bottom-24 flex flex-col items-center"
          style={{
            left: `${r.left}%`,
            animation: "floatUp 3s ease-out forwards",
          }}
        >
          <span className="text-3xl drop-shadow">{r.emojiChar}</span>
          <span className="mt-0.5 rounded-full bg-black/40 px-2 py-0.5 text-xs text-white/80">
            {r.senderNickname}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ReactionFloater;
