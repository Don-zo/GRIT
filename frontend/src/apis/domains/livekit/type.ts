export interface TokenResponse {
  token: string;
}

export interface Reaction {
  name: string;
  emoji: string;
}

/** POST body: 필드명 emoji, 값은 ReactionEmoji enum 문자열 (예: THUMBS_UP) */
export interface SendReactionRequest {
  emoji: string;
}

export interface LiveKitReactionMessage {
  emoji: string;
  emojiChar: string;
  senderNickname: string;
}
