import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getReactions, sendReaction } from "@/apis/domains/livekit/api";
import { isLiveKitReactionMessage } from "@/apis/domains/livekit/reactionSync";
import type { Reaction } from "@/apis/domains/livekit/type";
import type { ReactionItem } from "@/pages/Room/components/ReactionFloater";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";

const REACTION_DISPLAY_MS = 3000;
const REACTION_LEFT_MIN_PERCENT = 10;
const REACTION_LEFT_MAX_PERCENT = 80;

export function useRoomReactions(groupCode: string | undefined) {
  const { data: reactions = [] } = useQuery({
    queryKey: QUERY_KEYS.livekit.reactions(groupCode ?? ""),
    queryFn: () => getReactions(groupCode!),
    enabled: !!groupCode,
  });

  const { mutate: sendEmojiReaction } = useMutation({
    mutationFn: (reaction: Reaction) =>
      sendReaction(groupCode!, { emoji: reaction.name }),
    onError: (error) => {
      console.error("이모지 전송 실패", error);
    },
  });

  const [receivedReactions, setReceivedReactions] = useState<ReactionItem[]>(
    [],
  );
  const reactionTimeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      reactionTimeoutsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      reactionTimeoutsRef.current = [];
    };
  }, []);

  const handleSendReaction = useCallback(
    (reaction: Reaction) => {
      if (!groupCode) return;
      sendEmojiReaction(reaction);
    },
    [groupCode, sendEmojiReaction],
  );

  const applyLiveKitReaction = useCallback((data: unknown) => {
    if (!isLiveKitReactionMessage(data)) return;

    const id = Date.now() + Math.random();
    const left =
      REACTION_LEFT_MIN_PERCENT +
      Math.random() * (REACTION_LEFT_MAX_PERCENT - REACTION_LEFT_MIN_PERCENT);

    setReceivedReactions((prev) => [...prev, { ...data, id, left }]);

    const timeoutId = window.setTimeout(() => {
      setReceivedReactions((prev) => prev.filter((r) => r.id !== id));
      reactionTimeoutsRef.current = reactionTimeoutsRef.current.filter(
        (savedId) => savedId !== timeoutId,
      );
    }, REACTION_DISPLAY_MS);
    reactionTimeoutsRef.current.push(timeoutId);
  }, []);

  return {
    reactions,
    receivedReactions,
    handleSendReaction,
    applyLiveKitReaction,
  };
}
