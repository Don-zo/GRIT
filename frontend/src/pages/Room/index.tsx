import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { PATHS } from "@/routes/path";
import BottomBar from "@/pages/Room/components/BottomBar/BottomBar";
import TopBar from "@/pages/Room/components/TopBar/TopBar";
import Pomodoro from "@/pages/Room/components/Cam/Pomodoro";
import CamLayout from "@/pages/Room/components/Cam/CamLayout";
import TodoCamCard from "@/pages/Room/components/todo/TodoCamCard";
import VideoTile from "@/pages/Room/components/Cam/VideoTile";

import {
  getLiveKitToken,
  getReactions,
  sendReaction,
} from "@/apis/domains/livekit/api";
import type { Reaction, LiveKitReactionMessage } from "@/apis/domains/livekit/type";
import ReactionFloater from "@/pages/Room/components/ReactionFloater";
import type { ReactionItem } from "@/pages/Room/components/ReactionFloater";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { useLiveKit } from "@/hooks/useLiveKit";
import { LIVEKIT_URL } from "@/apis/constants/endpoints";
import { groupApi } from "@/apis/domains/group/api";
import { usePomodoroStatus } from "@/hooks/usePomodoroStatus";
import { useStartPomodoro } from "@/hooks/useStartPomodoro";
import { usePausePomodoro } from "@/hooks/usePausePomodoro";
import { useResumePomodoro } from "@/hooks/useResumePomodoro";

const isLiveKitReactionMessage = (
  value: unknown,
): value is LiveKitReactionMessage => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<LiveKitReactionMessage>;
  return (
    typeof candidate.emoji === "string" &&
    typeof candidate.emojiChar === "string" &&
    typeof candidate.senderNickname === "string"
  );
};

const RoomPage = () => {
  const navigate = useNavigate();
  const { groupCode } = useParams();

  const { data: reactions = [] } = useQuery({
    queryKey: QUERY_KEYS.livekit.reactions(groupCode ?? ""),
    queryFn: () => getReactions(groupCode!),
    enabled: !!groupCode,
  });

  const { mutate: sendEmojiReaction } = useMutation({
    mutationFn: (reaction: Reaction) =>
      sendReaction(groupCode!, { emoji: reaction.name }),
    onError: (error) => {
      console.error("이모지 전송 실패", error);
    },
  });

  const handleSendReaction = (reaction: Reaction) => {
    if (!groupCode) return;
    sendEmojiReaction(reaction);
  };
  const { data: groupMembers = [] } = useQuery({
    queryKey: QUERY_KEYS.groups.members(groupCode ?? ""),
    queryFn: () => groupApi.getGroupMembers(groupCode!),
    enabled: !!groupCode,
  });
  const { data: pomodoroStatus } = usePomodoroStatus({
    groupCode,
    enabled: !!groupCode,
  });
  const { mutate: startPomodoro, isPending: isStartingPomodoro } =
    useStartPomodoro(groupCode);
  const { mutate: pausePomodoro, isPending: isPausingPomodoro } =
    usePausePomodoro(groupCode);
  const { mutate: resumePomodoro, isPending: isResumingPomodoro } =
    useResumePomodoro(groupCode);
  const [token, setToken] = useState<string | null>(null); //livekit 토큰
  const [, setLivekitTestStatus] = useState(""); //테스트 상태메세지
  const [receivedReactions, setReceivedReactions] = useState<ReactionItem[]>([]);
  const reactionTimeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      reactionTimeoutsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      reactionTimeoutsRef.current = [];
    };
  }, []);

  const handleDataReceived = useCallback((payload: Uint8Array) => {
    try {
      const text = new TextDecoder().decode(payload);
      const data = JSON.parse(text);
      if (!isLiveKitReactionMessage(data)) return;

      const id = Date.now() + Math.random();
      const left = 10 + Math.random() * 70; // 10% ~ 80% 사이 랜덤 X
      setReceivedReactions((prev) => [...prev, { ...data, id, left }]);

      const timeoutId = window.setTimeout(() => {
        setReceivedReactions((prev) => prev.filter((r) => r.id !== id));
        reactionTimeoutsRef.current = reactionTimeoutsRef.current.filter(
          (savedId) => savedId !== timeoutId,
        );
      }, 3000);
      reactionTimeoutsRef.current.push(timeoutId);
    } catch {
      // 파싱 불가한 메시지는 무시
    }
  }, []);

  //token && serverUrl 있을 때만 연결
  const {
    isConnected,
    participants: remoteParticipants,
    room,
    error,
    toggleMicrophone,
    toggleCamera,
    enableCameraAndMicrophone,
  } = useLiveKit({
    serverUrl: token ? LIVEKIT_URL : "",
    token: token || "",
    onDataReceived: handleDataReceived,
  });

  //나가기 핸들러
  const handleLeaveRoom = () => {
    if (room) {
      room.disconnect();
    }
    navigate(PATHS.HOME);
  };

  //방 진입 시 즉시 연결
  useEffect(() => {
    if (!groupCode) return;
    const run = async () => {
      setLivekitTestStatus("토큰 요청하는 중");
      try {
        const newToken = await getLiveKitToken(groupCode);
        setToken(newToken);
        setLivekitTestStatus("토큰 발급 성공");
      } catch (err) {
        setLivekitTestStatus(`토큰 발급 에러: ${String(err)}`);
      }
    };
    run();
  }, [groupCode]);

  //연결 상태 출력
  useEffect(() => {
    if (isConnected) {
      setLivekitTestStatus("livekit 연결 성공");
    }
  }, [isConnected, remoteParticipants]);

  useEffect(() => {
    if (isConnected) {
      enableCameraAndMicrophone();
    }
  }, [isConnected, enableCameraAndMicrophone]);

  //에러
  useEffect(() => {
    if (error) {
      setLivekitTestStatus(`livekit 연결 실패: ${error.message}`);
      console.error("livekit 에러", error);
    }
  }, [error]);

  // participants 참가자 목록
  const allParticipants = [
    ...remoteParticipants.map((p) => ({
      id: p.identity,
      name: p.name,
      isMuted: p.isMuted,
      video: (
        <VideoTile
          videoTrack={p.videoTrack ?? undefined}
          audioTrack={p.audioTrack ?? undefined}
        />
      ),
    })),
  ];

  const [todoOpen, setTodoOpen] = useState(false);

  const DEFAULT_FOCUS_MINUTES = 45;
  const DEFAULT_BREAK_MINUTES = 15;
  const DEFAULT_TOTAL_ROUNDS = 1;

  const isPomodoroRunning =
    pomodoroStatus?.status === "RUNNING" ||
    pomodoroStatus?.status === "BREAK" ||
    pomodoroStatus?.status === "PAUSED";

  const pomodoroNode = (
    <Pomodoro
      studyMinutes={
        isPomodoroRunning
          ? (pomodoroStatus?.focusMinutes ?? DEFAULT_FOCUS_MINUTES)
          : DEFAULT_FOCUS_MINUTES
      }
      breakMinutes={
        isPomodoroRunning
          ? (pomodoroStatus?.breakMinutes ?? DEFAULT_BREAK_MINUTES)
          : DEFAULT_BREAK_MINUTES
      }
      repeat={
        isPomodoroRunning
          ? (pomodoroStatus?.totalRounds ?? DEFAULT_TOTAL_ROUNDS)
          : DEFAULT_TOTAL_ROUNDS
      }
      autoStart={isPomodoroRunning && pomodoroStatus?.status !== "PAUSED"}
      serverNow={isPomodoroRunning ? pomodoroStatus?.serverNow : undefined}
      phase={isPomodoroRunning ? pomodoroStatus?.phase : undefined}
      focusEndsAt={isPomodoroRunning ? pomodoroStatus?.focusEndsAt : undefined}
      breakEndsAt={isPomodoroRunning ? pomodoroStatus?.breakEndsAt : undefined}
      currentRound={
        isPomodoroRunning ? (pomodoroStatus?.currentRound ?? 1) : 1
      }
    />
  );

  return (
    <div className="relative flex flex-col w-full h-screen bg-gray-darkest">
      <TopBar
        isTodoOpen={todoOpen}
        onToggleTodo={() => setTodoOpen((prev) => !prev)}
      />
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex items-center justify-center flex-1 min-w-0 transition-all duration-300 ease-out ${
            todoOpen ? "ml-20 mr-4" : "mx-20"
          }`}
        >
          <CamLayout participants={allParticipants} pomodoro={pomodoroNode} />
        </div>

        {/* 투두 패널 */}
        <div
          className={`shrink-0 overflow-hidden transition-[width] duration-300 ease-out ${
            todoOpen ? "w-[480px]" : "w-0"
          }`}
        >
          <div className="w-[480px] h-full py-6 pl-4 pr-20">
            <TodoCamCard
              variant="panel"
              groupCode={groupCode}
              members={groupMembers}
            />
          </div>
        </div>
      </div>
      <ReactionFloater reactions={receivedReactions} />

      <BottomBar
        reactions={reactions}
        onSendReaction={handleSendReaction}
        pomodoroStatus={pomodoroStatus?.status}
        isStartingPomodoro={isStartingPomodoro}
        isPausingPomodoro={isPausingPomodoro}
        isResumingPomodoro={isResumingPomodoro}
        onPomodoroStart={(body) => {
          if (!groupCode) return;
          startPomodoro(body);
        }}
        onPomodoroPause={() => {
          if (!groupCode) return;
          pausePomodoro();
        }}
        onPomodoroResume={() => {
          if (!groupCode) return;
          resumePomodoro();
        }}
        onToggleMic={toggleMicrophone}
        onToggleCam={toggleCamera}
        onLeaveRoom={handleLeaveRoom}
      />
    </div>
  );
};

export default RoomPage;
