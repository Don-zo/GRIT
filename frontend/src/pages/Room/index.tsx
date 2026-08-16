import { useState } from "react";
import { useParams } from "react-router-dom";
import BottomBar from "@/pages/Room/components/BottomBar/BottomBar";
import TopBar from "@/pages/Room/components/TopBar/TopBar";
import CamLayout from "@/pages/Room/components/Cam/CamLayout";
import TodoCamCard from "@/pages/Room/components/todo/TodoCamCard";
import ReactionFloater from "@/pages/Room/components/ReactionFloater";
import RoomPomodoro from "@/pages/Room/components/RoomPomodoro";
import Modal from "@/components/Modal";
import {
  useRoomLiveKit,
  useRoomLiveKitData,
  useRoomParticipants,
} from "@/pages/Room/hooks";

const RoomPage = () => {
  const { groupCode } = useParams();
  const [todoOpen, setTodoOpen] = useState(false);

  const { pomodoro, reactions, studyTime, handleDataReceived } =
    useRoomLiveKitData(groupCode);

  const {
    remoteParticipants,
    isConnected,
    isMicrophoneEnabled,
    isCameraEnabled,
    isMediaTogglePending,
    toggleMicrophone,
    toggleCamera,
    handleLeaveRoom,
  } = useRoomLiveKit(groupCode, handleDataReceived);

  const { groupMembers, participants } = useRoomParticipants(
    groupCode,
    remoteParticipants,
  );

  return (
    <div className="relative flex flex-col w-full h-screen bg-gray-darkest">
      <Modal isOpen={!isConnected} onClose={handleLeaveRoom}>
        <Modal.Overlay />
        <Modal.Content className="flex flex-col items-center justify-center gap-4 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--color-green-semidark)] border-r-transparent" />
          <div className="text-lg font-bold text-white">
            방에 연결하는 중이에요
          </div>
          <div className="text-sm text-[#6b8a7a]">잠시만 기다려주세요</div>
        </Modal.Content>
      </Modal>

      <TopBar
        isTodoOpen={todoOpen}
        onToggleTodo={() => setTodoOpen((prev) => !prev)}
        displayedStudySeconds={studyTime.displayedSeconds}
        isStudyTimerRunning={studyTime.isRunning}
        isStudyTimerPending={studyTime.isTogglePending}
        onToggleStudyTimer={studyTime.handleToggle}
        weeklyStudyTimeGoalSeconds={
          studyTime.studyTime?.weeklyStudyTimeGoalSeconds
        }
      />

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex items-center justify-center flex-1 min-w-0 transition-all duration-300 ease-out ${
            todoOpen ? "ml-20 mr-4" : "mx-20"
          }`}
        >
          <CamLayout
            participants={participants}
            pomodoro={<RoomPomodoro pomodoroStatus={pomodoro.pomodoroStatus} />}
          />
        </div>

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

      <ReactionFloater reactions={reactions.receivedReactions} />

      <BottomBar
        reactions={reactions.reactions}
        onSendReaction={reactions.handleSendReaction}
        pomodoroStatus={pomodoro.pomodoroStatus?.status}
        isStartingPomodoro={pomodoro.isStartingPomodoro}
        isPausingPomodoro={pomodoro.isPausingPomodoro}
        isResumingPomodoro={pomodoro.isResumingPomodoro}
        isStoppingPomodoro={pomodoro.isStoppingPomodoro}
        onPomodoroStart={pomodoro.handleStart}
        onPomodoroPause={pomodoro.handlePause}
        onPomodoroResume={pomodoro.handleResume}
        onPomodoroStop={pomodoro.handleStop}
        onToggleMic={toggleMicrophone}
        onToggleCam={toggleCamera}
        isMicOn={isMicrophoneEnabled}
        isCamOn={isCameraEnabled}
        isMediaTogglePending={isMediaTogglePending}
        onLeaveRoom={handleLeaveRoom}
      />
    </div>
  );
};

export default RoomPage;
