import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { checkIsInOtherRoom, getLiveKitToken } from "@/apis/domains/livekit/api";
import { LIVEKIT_URL } from "@/apis/constants/endpoints";
import { useLiveKit } from "@/hooks/useLiveKit";
import { useToastContext } from "@/contexts/ToastContext";
import { PATHS } from "@/routes/path";
import type { RoomEntryLocationState } from "@/pages/Home/hooks/useRoomEntryFlow";
import {
  acknowledgeLiveKitLeave,
  isActiveInOtherLiveKitRoom,
  markLiveKitRoomJoined,
  markLiveKitRoomLeft,
  subscribeLiveKitRoomSync,
} from "@/utils/livekitRoomSync";

export function useRoomLiveKit(
  groupCode: string | undefined,
  onDataReceived: (payload: Uint8Array) => void,
) {
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useToastContext();
  const [token, setToken] = useState<string | null>(null);
  const joinRequestIdRef = useRef(0);
  const hasMarkedJoinedRef = useRef(false);
  const forceEnterConsumedRef = useRef(false);
  const roomRef = useRef<ReturnType<typeof useLiveKit>["room"]>(null);

  const locationState = location.state as RoomEntryLocationState | null;
  const shouldForceEnter =
    locationState?.forceEnterAfterLeave === true &&
    !forceEnterConsumedRef.current;

  if (shouldForceEnter) {
    forceEnterConsumedRef.current = true;
  }

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

  roomRef.current = room;

  const leaveToHome = useCallback(
    (options?: { replace?: boolean; openModalFor?: string }) => {
      markLiveKitRoomLeft();
      roomRef.current?.disconnect();

      const state: RoomEntryLocationState | undefined = options?.openModalFor
        ? { openOtherRoomModalFor: options.openModalFor }
        : undefined;

      navigate(PATHS.HOME, {
        replace: options?.replace,
        state,
      });
    },
    [navigate],
  );

  useEffect(() => {
    if (!groupCode) return;

    let cancelled = false;
    const requestId = ++joinRequestIdRef.current;
    const allowForceEnter = shouldForceEnter;
    hasMarkedJoinedRef.current = false;
    setToken(null);

    const prepareEntry = async () => {
      try {
        if (!allowForceEnter) {
          if (isActiveInOtherLiveKitRoom(groupCode)) {
            if (!cancelled && requestId === joinRequestIdRef.current) {
              notify(
                "이미 다른 방에 참여 중입니다. 기존 방에서 나간 뒤 입장해주세요.",
                "error",
              );
              leaveToHome({ replace: true, openModalFor: groupCode });
            }
            return;
          }

          const isInOtherRoom = await checkIsInOtherRoom(groupCode);
          if (cancelled || requestId !== joinRequestIdRef.current) return;

          if (isInOtherRoom) {
            notify(
              "이미 다른 방에 참여 중입니다. 기존 방에서 나간 뒤 입장해주세요.",
              "error",
            );
            leaveToHome({ replace: true, openModalFor: groupCode });
            return;
          }
        }

        const newToken = await getLiveKitToken(groupCode);
        if (cancelled || requestId !== joinRequestIdRef.current) return;

        setToken(newToken);
      } catch (err) {
        if (cancelled || requestId !== joinRequestIdRef.current) return;

        console.error("LiveKit 입장 준비 실패", err);

        if (isAxiosError(err) && err.response?.status === 403) {
          notify("해당 그룹에 참여하지 않은 사용자입니다.", "error");
        } else if (isAxiosError(err) && err.response?.status === 404) {
          notify("존재하지 않는 그룹입니다.", "error");
        } else {
          notify("방 입장에 실패했습니다. 다시 시도해주세요.", "error");
        }

        leaveToHome({ replace: true });
      }
    };

    void prepareEntry();

    return () => {
      cancelled = true;
    };
    // shouldForceEnter는 마운트/그룹 변경 시 1회만 소비
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupCode, leaveToHome, notify]);

  useEffect(() => {
    if (!groupCode || !isConnected || hasMarkedJoinedRef.current) return;
    markLiveKitRoomJoined(groupCode);
    hasMarkedJoinedRef.current = true;
  }, [groupCode, isConnected]);

  useEffect(() => {
    if (error) {
      console.error("livekit 에러", error);
    }
  }, [error]);

  const handleLeaveRoom = useCallback(() => {
    markLiveKitRoomLeft();
    roomRef.current?.disconnect();
    navigate(PATHS.HOME);
  }, [navigate]);

  useEffect(() => {
    return subscribeLiveKitRoomSync({
      onLeaveRequest: ({ requestId, exceptGroupCode }) => {
        if (exceptGroupCode && groupCode === exceptGroupCode) {
          acknowledgeLiveKitLeave(requestId);
          return;
        }

        markLiveKitRoomLeft();
        roomRef.current?.disconnect();
        acknowledgeLiveKitLeave(requestId);
        navigate(PATHS.HOME, { replace: true });
      },
    });
  }, [groupCode, navigate]);

  useEffect(() => {
    const handlePageHide = () => {
      markLiveKitRoomLeft();
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      markLiveKitRoomLeft();
    };
  }, []);

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
