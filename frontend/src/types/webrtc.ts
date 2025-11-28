export interface MediaStreamConfig {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
}

export interface PeerConnection {
  id: string;
  name: string;
  stream: MediaStream | null;
  connection: RTCPeerConnection;
}

export interface SignalingMessage {
  type: "offer" | "answer" | "ice-candidate" | "user-joined" | "user-left";
  from: string;
  to?: string;
  payload: any;
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}
