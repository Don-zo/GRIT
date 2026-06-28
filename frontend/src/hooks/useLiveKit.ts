import { useState, useEffect, useCallback, useRef } from "react";
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteParticipant,
  LocalParticipant,
  RemoteTrackPublication,
  TrackPublication,
  Participant,
} from "livekit-client";
import type { UseLiveKitProps, ParticipantData } from "@/types/livekit";

const getParticipantImageUrl = (metadata?: string): string | null => {
  if (!metadata) return null;

  try {
    const parsed = JSON.parse(metadata) as {
      imageUrl?: unknown;
      profileImageUrl?: unknown;
      avatarUrl?: unknown;
      picture?: unknown;
    };
    const imageUrl =
      parsed.imageUrl ??
      parsed.profileImageUrl ??
      parsed.avatarUrl ??
      parsed.picture;

    return typeof imageUrl === "string" && imageUrl.trim() ? imageUrl : null;
  } catch {
    return null;
  }
};

export const useLiveKit = ({ serverUrl, token, onDataReceived }: UseLiveKitProps) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<
    Map<string, ParticipantData>
  >(new Map());
  const [localParticipant, setLocalParticipant] =
    useState<LocalParticipant | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [isMediaTogglePending, setIsMediaTogglePending] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const pendingRoomRef = useRef<Room | null>(null);
  const onDataReceivedRef = useRef(onDataReceived);
  const isMediaTogglePendingRef = useRef(false);

  useEffect(() => {
    onDataReceivedRef.current = onDataReceived;
  }, [onDataReceived]);

  const syncLocalMediaState = useCallback((participant?: LocalParticipant | null) => {
    if (!participant) {
      setIsMicrophoneEnabled(false);
      setIsCameraEnabled(false);
      return;
    }

    setIsMicrophoneEnabled(participant.isMicrophoneEnabled);
    setIsCameraEnabled(participant.isCameraEnabled);
  }, []);

  const setMediaTogglePending = useCallback((pending: boolean) => {
    isMediaTogglePendingRef.current = pending;
    setIsMediaTogglePending(pending);
  }, []);

  // 참가자 데이터 업데이트
  const updateParticipant = useCallback(
    (participant: RemoteParticipant | LocalParticipant) => {
      const videoPublication = participant.getTrackPublication(
        Track.Source.Camera,
      );
      const audioPublication = participant.getTrackPublication(
        Track.Source.Microphone,
      );

      const participantData: ParticipantData = {
        identity: participant.identity,
        name: participant.name || participant.identity,
        imageUrl: getParticipantImageUrl(participant.metadata),
        videoTrack: videoPublication?.track,
        audioTrack: audioPublication?.track,
        isMuted: audioPublication?.isMuted ?? true,
        isVideoEnabled: !(videoPublication?.isMuted ?? true),
      };

      setParticipants((prev) => {
        const next = new Map(prev);
        next.set(participant.identity, participantData);
        return next;
      });
    },
    [],
  );

  const setupRoomListeners = useCallback(
    (newRoom: Room) => {
      newRoom
        .on(RoomEvent.DataReceived, (payload, participant, kind, topic) => {
          onDataReceivedRef.current?.(payload, participant, kind, topic);
        })
        .on(RoomEvent.Connected, () => {
          setIsConnected(true);
          setLocalParticipant(newRoom.localParticipant);
          syncLocalMediaState(newRoom.localParticipant);
        })
        .on(RoomEvent.Disconnected, () => {
          setIsConnected(false);
          syncLocalMediaState(null);
        })
        .on(
          RoomEvent.ParticipantConnected,
          (participant: RemoteParticipant) => {
            updateParticipant(participant);
          },
        )
        .on(
          RoomEvent.ParticipantDisconnected,
          (participant: RemoteParticipant) => {
            setParticipants((prev) => {
              const next = new Map(prev);
              next.delete(participant.identity);
              return next;
            });
          },
        )
        .on(
          RoomEvent.TrackSubscribed,
          (
            track: RemoteTrack,
            _publication: RemoteTrackPublication,
            participant: RemoteParticipant,
          ) => {
            updateParticipant(participant);
          },
        )
        .on(
          RoomEvent.TrackUnsubscribed,
          (
            track: RemoteTrack,
            _publication: RemoteTrackPublication,
            participant: RemoteParticipant,
          ) => {
            updateParticipant(participant);
          },
        )
        .on(
          RoomEvent.TrackMuted,
          (_publication: TrackPublication, participant: Participant) => {
            updateParticipant(
              participant as RemoteParticipant | LocalParticipant,
            );
            if (participant.identity === newRoom.localParticipant.identity) {
              syncLocalMediaState(newRoom.localParticipant);
            }
          },
        )
        .on(
          RoomEvent.TrackUnmuted,
          (_publication: TrackPublication, participant: Participant) => {
            updateParticipant(
              participant as RemoteParticipant | LocalParticipant,
            );
            if (participant.identity === newRoom.localParticipant.identity) {
              syncLocalMediaState(newRoom.localParticipant);
            }
          },
        )
        .on(RoomEvent.LocalTrackPublished, () => {
          setLocalParticipant(newRoom.localParticipant);
          syncLocalMediaState(newRoom.localParticipant);
        })
        .on(RoomEvent.LocalTrackUnpublished, () => {
          setLocalParticipant(newRoom.localParticipant);
          syncLocalMediaState(newRoom.localParticipant);
        });
    },
    [syncLocalMediaState, updateParticipant],
  );

  // LiveKit Room 연결
  const connectToRoom = useCallback(async () => {
    if (!serverUrl || !token) return;

    try {
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: {
            width: 1280,
            height: 720,
            frameRate: 30,
          },
        },
      });

      pendingRoomRef.current = newRoom;
      setupRoomListeners(newRoom);

      await newRoom.connect(serverUrl, token);

      if (pendingRoomRef.current !== newRoom) {
        newRoom.disconnect();
        return;
      }

      setRoom(newRoom);
      roomRef.current = newRoom;
      pendingRoomRef.current = null;
      setLocalParticipant(newRoom.localParticipant);
      syncLocalMediaState(newRoom.localParticipant);

      await newRoom.localParticipant.setCameraEnabled(true);
      await newRoom.localParticipant.setMicrophoneEnabled(true);
      syncLocalMediaState(newRoom.localParticipant);

      newRoom.remoteParticipants.forEach((participant) => {
        updateParticipant(participant);
      });
    } catch (err) {
      console.error("LiveKit 연결 실패:", err);
      setError(err as Error);
    }
  }, [serverUrl, token, setupRoomListeners, syncLocalMediaState, updateParticipant]);

  // 마이크 토글
  const toggleMicrophone = useCallback(async () => {
    if (!roomRef.current || isMediaTogglePendingRef.current) return;

    setMediaTogglePending(true);
    try {
      const participant = roomRef.current.localParticipant;
      await participant.setMicrophoneEnabled(!participant.isMicrophoneEnabled);
      syncLocalMediaState(participant);
    } catch (err) {
      console.error("마이크 토글 실패:", err);
      setError(err as Error);
      syncLocalMediaState(roomRef.current.localParticipant);
    } finally {
      setMediaTogglePending(false);
    }
  }, [setMediaTogglePending, syncLocalMediaState]);

  // 카메라 토글
  const toggleCamera = useCallback(async () => {
    if (!roomRef.current || isMediaTogglePendingRef.current) return;

    setMediaTogglePending(true);
    try {
      const participant = roomRef.current.localParticipant;
      await participant.setCameraEnabled(!participant.isCameraEnabled);
      syncLocalMediaState(participant);
    } catch (err) {
      console.error("카메라 토글 실패:", err);
      setError(err as Error);
      syncLocalMediaState(roomRef.current.localParticipant);
    } finally {
      setMediaTogglePending(false);
    }
  }, [setMediaTogglePending, syncLocalMediaState]);

  // 로컬 비디오/오디오 활성화
  const enableCameraAndMicrophone = useCallback(async () => {
    if (!roomRef.current) return;

    try {
      await roomRef.current.localParticipant.setCameraEnabled(true);
      await roomRef.current.localParticipant.setMicrophoneEnabled(true);
      syncLocalMediaState(roomRef.current.localParticipant);
    } catch (err) {
      console.error("카메라/마이크 활성화 실패:", err);
      setError(err as Error);
      syncLocalMediaState(roomRef.current.localParticipant);
    }
  }, [syncLocalMediaState]);

  // 초기 연결
  useEffect(() => {
    if (serverUrl && token) {
      connectToRoom();
    }

    return () => {
      const pendingRoom = pendingRoomRef.current;
      const activeRoom = roomRef.current;

      if (pendingRoom) {
        pendingRoom.disconnect();
      }
      if (activeRoom && activeRoom !== pendingRoom) {
        activeRoom.disconnect();
      }
      pendingRoomRef.current = null;
      roomRef.current = null;
      setRoom(null);
      setParticipants(new Map());
      setIsConnected(false);
      syncLocalMediaState(null);
    };
  }, [serverUrl, token, connectToRoom, syncLocalMediaState]);

  return {
    room,
    participants: Array.from(participants.values()),
    localParticipant,
    isConnected,
    isMicrophoneEnabled,
    isCameraEnabled,
    isMediaTogglePending,
    error,
    connectToRoom,
    enableCameraAndMicrophone,
    toggleMicrophone,
    toggleCamera,
  };
};
