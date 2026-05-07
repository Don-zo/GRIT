import { Track } from "livekit-client";

export interface UseLiveKitProps {
  serverUrl: string;
  token: string;
}

export interface ParticipantData {
  identity: string;
  name: string;
  videoTrack?: Track | null;
  audioTrack?: Track | null;
  isMuted: boolean;
  isVideoEnabled: boolean;
}
