import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { PATHS } from "@/routes/path";
import BottomBar from "@/pages/Room/components/BottomBar/BottomBar";
import TopBar from "@/pages/Room/components/TopBar/TopBar";
import Pomodoro from "@/pages/Room/components/Cam/Pomodoro";
import CamLayout from "@/pages/Room/components/Cam/CamLayout";
import TodoCamCard from "@/pages/Room/components/todo/TodoCamCard";
import VideoTile from "@/pages/Room/components/Cam/VideoTile";

import { getLiveKitToken, getReactions } from "@/apis/domains/livekit/api";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { useLiveKit } from "@/hooks/useLiveKit";
import { LIVEKIT_URL } from "@/apis/constants/endpoints";

type PomodoroConfig = {
  studyMinutes: number;
  breakMinutes: number;
  repeat: number;
  enabled: boolean;
};

const RoomPage = () => {
  const navigate = useNavigate();
  const { groupCode } = useParams();

  const { data: reactions = [] } = useQuery({
    queryKey: QUERY_KEYS.livekit.reactions(groupCode ?? ""),
    queryFn: () => getReactions(groupCode!),
    enabled: !!groupCode,
  });

  const [token, setToken] = useState<string | null>(null); //livekit 토큰
  const [, setLivekitTestStatus] = useState(""); //테스트 상태메세지

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
      console.log("livekit 연결");
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
  const [pomodoroConfig, setPomodoroConfig] = useState<PomodoroConfig>({
    studyMinutes: 45,
    breakMinutes: 15,
    repeat: 1,
    enabled: false,
  });

  const handlePomodoroFinish = () => {
    setPomodoroConfig((prev) => ({
      ...prev,
      enabled: false,
    }));
  };

  const pomodoroNode = (
    <Pomodoro
      studyMinutes={pomodoroConfig.studyMinutes}
      breakMinutes={pomodoroConfig.breakMinutes}
      repeat={pomodoroConfig.repeat}
      autoStart={pomodoroConfig.enabled}
      onFinish={handlePomodoroFinish}
    />
  );

  return (
    <div className="flex flex-col w-full h-screen bg-gray-darkest">
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
            <TodoCamCard variant="panel" />
          </div>
        </div>
      </div>
      <BottomBar
        reactions={reactions}
        onPomodoroStart={(config) => {
          setPomodoroConfig(config);
        }}
        onToggleMic={toggleMicrophone}
        onToggleCam={toggleCamera}
        onLeaveRoom={handleLeaveRoom}
      />
    </div>
  );
};

export default RoomPage;
