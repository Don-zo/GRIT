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

export const useLiveKit = ({ serverUrl, token }: UseLiveKitProps) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<
    Map<string, ParticipantData>
  >(new Map());
  const [localParticipant, setLocalParticipant] =
    useState<LocalParticipant | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const roomRef = useRef<Room | null>(null);

  // 참가자 데이터 업데이트
  const updateParticipant = useCallback(
    (participant: RemoteParticipant | LocalParticipant) => {
      const videoPublication = participant.getTrackPublication(
        Track.Source.Camera
      );
      const audioPublication = participant.getTrackPublication(
        Track.Source.Microphone
      );

      const participantData: ParticipantData = {
        identity: participant.identity,
        name: participant.name || participant.identity,
        videoTrack: videoPublication?.track as RemoteTrack,
        audioTrack: audioPublication?.track as RemoteTrack,
        isMuted: audioPublication?.isMuted ?? true,
        isVideoEnabled: !(videoPublication?.isMuted ?? true),
      };

      setParticipants((prev) => {
        const next = new Map(prev);
        next.set(participant.identity, participantData);
        return next;
      });
    },
    []
  );

  // LiveKit Room 연결
  const connectToRoom = useCallback(async () => {
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

      // 이벤트 리스너 설정
      newRoom
        .on(RoomEvent.Connected, () => {
          console.log("LiveKit Room에 연결됨");
          setIsConnected(true);
          setLocalParticipant(newRoom.localParticipant);
        })
        .on(RoomEvent.Disconnected, () => {
          console.log("LiveKit Room 연결 해제됨");
          setIsConnected(false);
        })
        .on(
          RoomEvent.ParticipantConnected,
          (participant: RemoteParticipant) => {
            console.log("참가자 입장:", participant.identity);
            updateParticipant(participant);
          }
        )
        .on(
          RoomEvent.ParticipantDisconnected,
          (participant: RemoteParticipant) => {
            console.log("참가자 퇴장:", participant.identity);
            setParticipants((prev) => {
              const next = new Map(prev);
              next.delete(participant.identity);
              return next;
            });
          }
        )
        .on(
          RoomEvent.TrackSubscribed,
          (
            track: RemoteTrack,
            _publication: RemoteTrackPublication,
            participant: RemoteParticipant
          ) => {
            console.log("트랙 구독:", participant.identity, track.kind);
            updateParticipant(participant);
          }
        )
        .on(
          RoomEvent.TrackUnsubscribed,
          (
            track: RemoteTrack,
            _publication: RemoteTrackPublication,
            participant: RemoteParticipant
          ) => {
            console.log("트랙 구독 해제:", participant.identity, track.kind);
            updateParticipant(participant);
          }
        )
        .on(
          RoomEvent.TrackMuted,
          (_publication: TrackPublication, participant: Participant) => {
            console.log("트랙 음소거:", participant.identity);
            updateParticipant(
              participant as RemoteParticipant | LocalParticipant
            );
          }
        )
        .on(
          RoomEvent.TrackUnmuted,
          (_publication: TrackPublication, participant: Participant) => {
            console.log("트랙 음소거 해제:", participant.identity);
            updateParticipant(
              participant as RemoteParticipant | LocalParticipant
            );
          }
        );

      // Room에 연결
      await newRoom.connect(serverUrl, token);

      // 기존 참가자 업데이트
      newRoom.remoteParticipants.forEach((participant) => {
        updateParticipant(participant);
      });

      setRoom(newRoom);
      roomRef.current = newRoom;
    } catch (err) {
      console.error("LiveKit 연결 실패:", err);
      setError(err as Error);
    }
  }, [serverUrl, token, updateParticipant]);

  // 마이크 토글
  const toggleMicrophone = useCallback(async () => {
    if (!roomRef.current) return;
    const enabled = roomRef.current.localParticipant.isMicrophoneEnabled;
    await roomRef.current.localParticipant.setMicrophoneEnabled(!enabled);
  }, []);

  // 카메라 토글
  const toggleCamera = useCallback(async () => {
    if (!roomRef.current) return;
    const enabled = roomRef.current.localParticipant.isCameraEnabled;
    await roomRef.current.localParticipant.setCameraEnabled(!enabled);
  }, []);

  // 화면 공유 토글
  const toggleScreenShare = useCallback(async () => {
    if (!roomRef.current) return;
    const enabled = roomRef.current.localParticipant.isScreenShareEnabled;
    await roomRef.current.localParticipant.setScreenShareEnabled(!enabled);
  }, []);

  // 로컬 비디오/오디오 활성화
  const enableCameraAndMicrophone = useCallback(async () => {
    if (!roomRef.current) return;

    try {
      await roomRef.current.localParticipant.setCameraEnabled(true);
      await roomRef.current.localParticipant.setMicrophoneEnabled(true);
    } catch (err) {
      console.error("카메라/마이크 활성화 실패:", err);
      setError(err as Error);
    }
  }, []);

  // 초기 연결
  useEffect(() => {
    if (serverUrl && token) {
      connectToRoom();
    }

    // cleanup 함수
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
        setRoom(null);
        setParticipants(new Map());
        setIsConnected(false);
      }
    };
  }, [serverUrl, token, connectToRoom]);

  return {
    room,
    participants: Array.from(participants.values()),
    localParticipant,
    isConnected,
    error,
    connectToRoom,
    enableCameraAndMicrophone,
    toggleMicrophone,
    toggleCamera,
    toggleScreenShare,
  };
};
