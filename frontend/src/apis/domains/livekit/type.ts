import type { PomodoroStatusResponse } from "@/apis/domains/pomodoro/type";

export interface TokenResponse {
  token: string;
}

export interface OtherRoomResponse {
  isInOtherRoom: boolean;
}

export interface Reaction {
  name: string;
  emoji: string;
}

export interface SendReactionRequest {
  emoji: string;
}

export interface LiveKitReactionMessage {
  emoji: string;
  emojiChar: string;
  senderNickname: string;
}

export interface LiveKitPomodoroSyncMessage {
  type: "pomodoro.sync";
  senderNickname: string;
  timer: PomodoroStatusResponse;
}
