import type { RemoteParticipant, DataPacket_Kind } from "livekit-client";
import { Track } from "livekit-client";

export interface UseLiveKitProps {
  serverUrl: string;
  token: string;
  onDataReceived?: (
    payload: Uint8Array,
    participant: RemoteParticipant | undefined,
    kind: DataPacket_Kind,
    topic: string | undefined,
  ) => void;
}

export interface ParticipantData {
  identity: string;
  name: string;
  videoTrack?: Track | null;
  audioTrack?: Track | null;
  isMuted: boolean;
  isVideoEnabled: boolean;
}
