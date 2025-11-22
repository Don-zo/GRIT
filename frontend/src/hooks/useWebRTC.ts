/**
 * useWebRTC
 *
 * WebRTC를 사용한 P2P(Peer-to-Peer) 화상 통화 연결을 관리하는 훅
 *
 * 주요 기능:
 * - SimplePeer 라이브러리를 사용한 WebRTC 피어 연결 생성/관리
 * - 시그널링 서버(Socket.io)를 통한 연결 정보 교환 (SDP, ICE candidates)
 * - 방 입장/퇴장 시 자동으로 다른 사용자들과 연결/해제
 * - 로컬 스트림을 원격 피어들에게 전송
 * - 원격 피어들로부터 스트림 수신
 * - 동적 트랙 교체 (카메라/마이크 변경 시 자동 업데이트)
 *
 * 작동 방식:
 * 1. 방에 입장하면 기존 사용자들과 P2P 연결 시작 (initiator=true)
 * 2. 새 사용자가 입장하면 해당 사용자와 연결 생성 (initiator=true)
 * 3. 연결 요청을 받으면 응답으로 연결 수락 (initiator=false)
 * 4. 시그널링을 통해 SDP 및 ICE candidates 교환
 * 5. P2P 연결 수립 후 미디어 스트림 송수신
 *
 * @param props - WebRTC 설정
 * @param props.stream - 공유할 로컬 미디어 스트림
 * @param props.roomId - 접속할 방 ID
 * @param props.userId - 현재 사용자 ID
 * @param props.socket - 시그널링에 사용할 Socket.io 객체
 * @returns {Object} 피어 연결 상태 및 제어 함수들
 *
 * @example
 * const { peers, isConnected } = useWebRTC({
 *   stream,
 *   roomId: "room123",
 *   userId: "user456",
 *   socket
 * });
 */

import { useState, useCallback, useEffect, useRef } from "react";
import SimplePeer from "simple-peer";

interface UseWebRTCProps {
  stream: MediaStream | null;
  roomId: string;
  userId: string;
  // 시그널링 서버와의 통신을 위한 소켓 객체
  socket: any;
}

interface PeerData {
  peerId: string;
  peer: SimplePeer.Instance;
  stream: MediaStream | null;
}

export const useWebRTC = ({
  stream,
  roomId,
  userId,
  socket,
}: UseWebRTCProps) => {
  const [peers, setPeers] = useState<Map<string, PeerData>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const peersRef = useRef<Map<string, PeerData>>(new Map());

  // Peer 생성 함수
  const createPeer = useCallback(
    (peerId: string, initiator: boolean): SimplePeer.Instance => {
      const peer = new SimplePeer({
        initiator,
        trickle: true,
        stream: stream || undefined,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        },
      });

      // 시그널 데이터 전송
      peer.on("signal", (signal) => {
        console.log(`시그널 전송 ${peerId}`, signal);
        socket.emit("signal", {
          to: peerId,
          from: userId,
          signal,
          roomId,
        });
      });

      // 연결 성공
      peer.on("connect", () => {
        console.log(`peer에 연결 : ${peerId}`);
        setIsConnected(true);
      });

      // 원격 스트림 수신
      peer.on("stream", (remoteStream: MediaStream) => {
        console.log(`stream 수신 : ${peerId}`);
        setPeers((prev) => {
          const newPeers = new Map(prev);
          const peerData = newPeers.get(peerId);
          if (peerData) {
            peerData.stream = remoteStream;
          }
          return newPeers;
        });

        peersRef.current.set(peerId, {
          peerId,
          peer,
          stream: remoteStream,
        });
      });

      // 에러 처리
      peer.on("error", (err) => {
        console.error(`에러 : ${peerId}:`, err);
      });

      // 연결 종료
      peer.on("close", () => {
        console.log(`연결 종료 : ${peerId}`);
        removePeer(peerId);
      });

      return peer;
    },
    [stream, userId, roomId, socket]
  );

  // Peer 추가
  const addPeer = useCallback(
    (peerId: string, initiator: boolean) => {
      if (peersRef.current.has(peerId)) {
        console.log(`${peerId} 이미 존재`);
        return;
      }

      console.log(`peer 추가 : ${peerId}, initiator: ${initiator}`);
      const peer = createPeer(peerId, initiator);

      const peerData: PeerData = {
        peerId,
        peer,
        stream: null,
      };

      peersRef.current.set(peerId, peerData);
      setPeers(new Map(peersRef.current));
    },
    [createPeer]
  );

  // Peer 제거
  const removePeer = useCallback((peerId: string) => {
    const peerData = peersRef.current.get(peerId);
    if (peerData) {
      peerData.peer.destroy();
      peersRef.current.delete(peerId);
      setPeers(new Map(peersRef.current));
      console.log(`peer 삭제 : ${peerId}`);
    }
  }, []);

  // 시그널 처리
  const handleSignal = useCallback(
    (data: { from: string; signal: SimplePeer.SignalData }) => {
      const { from, signal } = data;
      console.log(`signal 수신 : ${from}`, signal);

      let peerData = peersRef.current.get(from);

      // Peer가 없으면 생성
      if (!peerData) {
        addPeer(from, false);
        peerData = peersRef.current.get(from);
      }

      // 시그널 처리
      if (peerData) {
        try {
          peerData.peer.signal(signal);
        } catch (err) {
          console.error(`peer signal 도중 에러: ${from}:`, err);
        }
      }
    },
    [addPeer]
  );

  // 소켓 이벤트 리스너 설정
  useEffect(() => {
    if (!socket) return;

    // 새로운 사용자 입장
    const handleUserJoined = (data: { userId: string }) => {
      console.log(`사용자 추가 : ${data.userId}`);
      if (data.userId !== userId) {
        addPeer(data.userId, true); // initiator로 연결 시작
      }
    };

    // 사용자 퇴장
    const handleUserLeft = (data: { userId: string }) => {
      console.log(`사용자 제거 : ${data.userId}`);
      removePeer(data.userId);
    };

    // 기존 사용자 목록 수신
    const handleRoomUsers = (data: { users: string[] }) => {
      console.log("기존 사용자 목록: ", data.users);
      data.users.forEach((peerId) => {
        if (peerId !== userId && !peersRef.current.has(peerId)) {
          addPeer(peerId, true);
        }
      });
    };

    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);
    socket.on("signal", handleSignal);
    socket.on("room-users", handleRoomUsers);

    // 방 입장
    socket.emit("join-room", { roomId, userId });

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
      socket.off("signal", handleSignal);
      socket.off("room-users", handleRoomUsers);
    };
  }, [socket, roomId, userId, addPeer, removePeer, handleSignal]);

  // 컴포넌트 언마운트 시 모든 연결 종료
  useEffect(() => {
    return () => {
      peersRef.current.forEach((peerData) => {
        peerData.peer.destroy();
      });
      peersRef.current.clear();
    };
  }, []);

  // 스트림 업데이트 시 모든 peer에 전달
  useEffect(() => {
    if (stream) {
      peersRef.current.forEach((peerData) => {
        if (peerData.peer && (peerData.peer as any)._pc) {
          const pc = (peerData.peer as any)._pc as RTCPeerConnection;
          const senders = pc.getSenders();

          // 비디오 트랙 교체
          const videoTrack = stream.getVideoTracks()[0];
          const videoSender = senders.find((s) => s.track?.kind === "video");
          if (videoSender && videoTrack) {
            videoSender.replaceTrack(videoTrack);
          } else if (videoTrack) {
            peerData.peer.addTrack(videoTrack, stream);
          }

          // 오디오 트랙 교체
          const audioTrack = stream.getAudioTracks()[0];
          const audioSender = senders.find((s) => s.track?.kind === "audio");
          if (audioSender && audioTrack) {
            audioSender.replaceTrack(audioTrack);
          } else if (audioTrack) {
            peerData.peer.addTrack(audioTrack, stream);
          }
        }
      });
    }
  }, [stream]);

  /**
   * 반환값:
   * @property {PeerData[]} peers - 연결된 모든 피어들의 배열
   *   - peerId: 피어의 고유 ID
   *   - peer: SimplePeer 인스턴스
   *   - stream: 원격 피어로부터 받은 MediaStream
   * @property {boolean} isConnected - 하나 이상의 피어와 연결되었는지 여부
   * @property {Function} addPeer - 새로운 피어를 추가하는 함수 (수동 제어용)
   * @property {Function} removePeer - 피어를 제거하는 함수 (수동 제어용)
   *
   * 사용 시 주의사항:
   * - socket은 반드시 연결된 상태여야 합니다
   * - roomId와 userId는 고유해야 합니다
   * - stream이 변경되면 자동으로 모든 피어에게 업데이트됩니다
   * - 컴포넌트 언마운트 시 자동으로 모든 연결이 정리됩니다
   */

  return {
    peers: Array.from(peers.values()),
    isConnected,
    addPeer,
    removePeer,
  };
};
