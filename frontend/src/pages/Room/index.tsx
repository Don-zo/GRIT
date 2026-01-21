import { useEffect, useState } from "react";
import BottomBar from "@/pages/Room/components/BottomBar/BottomBar";
import TopBar from "@/pages/Room/components/TopBar/TopBar";
import Pomodoro from "@/pages/Room/components/Cam/Pomodoro";
import CamLayout from "@/pages/Room/components/Cam/CamLayout";
//livekit api 연동
import { getLiveKitToken } from "@/apis/services/livekit";
import { useLiveKit } from "@/hooks/useLiveKit";
import { LIVEKIT_URL } from "@/apis/constants/endpoints";

type PomodoroConfig = {
  studyMinutes: number;
  breakMinutes: number;
  repeat: number;
  enabled: boolean;
};

const RoomPage = () => {
  const [token, setToken] = useState<string | null>(null); //livekit 토큰
  const [livekitTestStatus, setLivekitTestStatus] = useState(""); //테스트 상태메세지

  //token && serverUrl 있을 때만 연결
  const {
    isConnected,
    participants: liveKitParticipants,
    error,
  } = useLiveKit({
    serverUrl: token ? LIVEKIT_URL : "",
    token: token || "",
  });
  //테스트 버튼 클릭 핸들러
  const handleTestConnection = async () => {
    setLivekitTestStatus("토큰 요청하는 중");
    try {
      const newToken = await getLiveKitToken("test-room", "test-user");
      setToken(newToken);
      setLivekitTestStatus("토큰 발급 성공");
      console.log(newToken);
    } catch (err) {
      setLivekitTestStatus(`토큰 발급 에러",${err}`);
      console.log(err);
    }
  };
  //연결 상태 출력
  useEffect(() => {
    if (isConnected) {
      setLivekitTestStatus("livekit 연결 성공");
      console.log("livekit 연결");
    }
  }, [isConnected, liveKitParticipants]);
  //에러
  useEffect(() => {
    if (error) {
      setLivekitTestStatus(`livekit 연결 실패: ${error.message}`);
      console.error("livekit 에러", error);
    }
  }, [error]);

  const participants = [
    { id: "p1", name: "김윤영", isMuted: false },
    { id: "p2", name: "양준영", isMuted: true },
    { id: "p3", name: "이유민", isMuted: false },
    { id: "p4", name: "이차현", isMuted: false },
    { id: "p5", name: "김윤영김윤영", isMuted: true },
    { id: "p6", name: "양준영양준영", isMuted: false },
    { id: "p7", name: "이유민이유민", isMuted: true },
    { id: "p8", name: "이차현이차현", isMuted: false },
  ];
  const [muted, setMuted] = useState(false);
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
      {/* 여기서부터 livekit 연결 테스트 확인용*/}
      <div className="absolute top-20 right-4 z-50 flex flex-col gap-2">
        <button
          onClick={handleTestConnection}
          className="bg-blue-500 text-white text-xs px-3 py-2 rounded hover:bg-blue-600"
        >
          LiveKit 연결 테스트
        </button>

        {/* 상태 메시지 */}
        {livekitTestStatus && (
          <div className="bg-black/70 text-white text-xs p-2 rounded max-w-[250px]">
            {livekitTestStatus}
          </div>
        )}

        {/* 연결 성공 시 참가자 수 표시 */}
        {isConnected && (
          <div className="bg-green-500/70 text-white text-xs p-2 rounded">
            참가자: {liveKitParticipants.length}명
          </div>
        )}
      </div>
      {/*여기까지 livekit 테스트용*/}

      {/* 상단바 */}
      <TopBar />

      {/* 본 내용 */}
      <div className="flex items-center justify-center flex-1 mx-20">
        <CamLayout participants={participants} pomodoro={pomodoroNode} />
      </div>

      {/* 하단바 */}
      <BottomBar
        onPomodoroStart={(config) => {
          setPomodoroConfig(config);
        }}
      />
    </div>
  );
};

export default RoomPage;
