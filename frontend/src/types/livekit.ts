import { RemoteTrack } from "livekit-client";

export interface UseLiveKitProps {
  serverUrl: string;
  token: string;
}

export interface ParticipantData {
  identity: string;
  name: string;
  videoTrack?: RemoteTrack;
  audioTrack?: RemoteTrack;
  isMuted: boolean;
  isVideoEnabled: boolean;
}
