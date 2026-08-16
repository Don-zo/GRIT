import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLiveKitToken } from "@/apis/domains/livekit/api";
import { LIVEKIT_URL } from "@/apis/constants/endpoints";
import { useLiveKit } from "@/hooks/useLiveKit";
import { PATHS } from "@/routes/path";

export function useRoomLiveKit(
  groupCode: string | undefined,
  onDataReceived: (payload: Uint8Array) => void,
) {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);

  const {
    participants: remoteParticipants,
    room,
    error,
    isConnected,
    isMicrophoneEnabled,
    isCameraEnabled,
    isMediaTogglePending,
    toggleMicrophone,
    toggleCamera,
  } = useLiveKit({
    serverUrl: token ? LIVEKIT_URL : "",
    token: token || "",
    onDataReceived,
  });

  useEffect(() => {
    if (!groupCode) return;

    const fetchToken = async () => {
      try {
        const newToken = await getLiveKitToken(groupCode);
        setToken(newToken);
      } catch (err) {
        console.error("LiveKit 토큰 발급 실패", err);
      }
    };

    fetchToken();
  }, [groupCode]);

  useEffect(() => {
    if (error) {
      console.error("livekit 에러", error);
    }
  }, [error]);

  const handleLeaveRoom = useCallback(() => {
    room?.disconnect();
    navigate(PATHS.HOME);
  }, [navigate, room]);

  return {
    remoteParticipants,
    isConnected,
    isMicrophoneEnabled,
    isCameraEnabled,
    isMediaTogglePending,
    toggleMicrophone,
    toggleCamera,
    handleLeaveRoom,
  };
}
