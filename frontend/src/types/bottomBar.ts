import type { Reaction } from "@/apis/domains/livekit/type";

export interface EmojiModalProps {
  open: boolean;
  reactions?: Reaction[];
  onSelect?: (reaction: Reaction) => void;
  onClose?: () => void;
}