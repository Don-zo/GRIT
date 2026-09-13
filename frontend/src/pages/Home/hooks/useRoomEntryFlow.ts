import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { checkIsInOtherRoom } from "@/apis/domains/livekit/api";
import { useToastContext } from "@/contexts/ToastContext";
import {
  forceClearActiveLiveKitRoom,
  getActiveLiveKitGroupCode,
  isActiveInLiveKitRoom,
  isActiveInOtherLiveKitRoom,
  reconcileActiveLiveKitRoomOutsideRoom,
  requestLeaveOtherLiveKitRooms,
  waitForLiveKitLeaveAck,
} from "@/utils/livekitRoomSync";

const MODAL_HISTORY_STATE_KEY = "gritOtherRoomModal";

type OtherRoomModalHistoryState = {
  [MODAL_HISTORY_STATE_KEY]: true;
  targetGroupCode: string;
};

export type RoomEntryLocationState = {
  forceEnterAfterLeave?: boolean;
  openOtherRoomModalFor?: string;
};

const hasOtherRoomModalState = (
  state: unknown,
): state is OtherRoomModalHistoryState => {
  if (!state || typeof state !== "object") return false;
  const candidate = state as Partial<OtherRoomModalHistoryState>;
  return (
    candidate[MODAL_HISTORY_STATE_KEY] === true &&
    typeof candidate.targetGroupCode === "string"
  );
};

export function useRoomEntryFlow(options?: {
  initialModalGroupCode?: string | null;
}) {
  const navigate = useNavigate();
  const { notify } = useToastContext();
  const [pendingGroupCode, setPendingGroupCode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const entryLockRef = useRef(false);
  const modalHistoryPushedRef = useRef(false);
  const initialModalOpenedRef = useRef(false);

  useEffect(() => {
    reconcileActiveLiveKitRoomOutsideRoom();
  }, []);

  const closeModal = useCallback((options?: { skipHistoryBack?: boolean }) => {
    setIsModalOpen(false);
    setPendingGroupCode(null);

    if (
      !options?.skipHistoryBack &&
      modalHistoryPushedRef.current &&
      hasOtherRoomModalState(window.history.state)
    ) {
      modalHistoryPushedRef.current = false;
      window.history.back();
      return;
    }

    modalHistoryPushedRef.current = false;
  }, []);

  const openModal = useCallback((groupCode: string) => {
    setPendingGroupCode(groupCode);
    setIsModalOpen(true);

    if (!hasOtherRoomModalState(window.history.state)) {
      const nextState: OtherRoomModalHistoryState = {
        ...(typeof window.history.state === "object" && window.history.state
          ? window.history.state
          : {}),
        [MODAL_HISTORY_STATE_KEY]: true,
        targetGroupCode: groupCode,
      };
      window.history.pushState(nextState, "");
      modalHistoryPushedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!options?.initialModalGroupCode) return;
    if (initialModalOpenedRef.current) return;
    initialModalOpenedRef.current = true;
    openModal(options.initialModalGroupCode);
  }, [openModal, options?.initialModalGroupCode]);

  useEffect(() => {
    const handlePopState = () => {
      if (!isModalOpen) return;
      modalHistoryPushedRef.current = false;
      setIsModalOpen(false);
      setPendingGroupCode(null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isModalOpen]);

  const goToRoom = useCallback(
    (groupCode: string, state?: RoomEntryLocationState) => {
      navigate(`/room/${groupCode}`, { state });
    },
    [navigate],
  );

  const resolveConflict = useCallback(
    async (groupCode: string): Promise<"allow" | "confirm" | "block"> => {
      if (isActiveInLiveKitRoom(groupCode)) {
        notify("이미 참여 중인 방입니다.", "error");
        return "block";
      }

      if (isActiveInOtherLiveKitRoom(groupCode)) {
        return "confirm";
      }

      try {
        const isInOtherRoom = await checkIsInOtherRoom(groupCode);
        if (isInOtherRoom) return "confirm";
        return "allow";
      } catch (error) {
        console.error("다른 방 참여 여부 조회 실패", error);

        if (isAxiosError(error) && error.response?.status === 403) {
          notify("해당 그룹에 참여하지 않은 사용자입니다.", "error");
          return "block";
        }

        if (isAxiosError(error) && error.response?.status === 404) {
          notify("존재하지 않는 그룹입니다.", "error");
          return "block";
        }

        notify(
          "방 참여 상태를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.",
          "error",
        );
        return "block";
      }
    },
    [notify],
  );

  const requestEnterRoom = useCallback(
    async (groupCode: string) => {
      if (entryLockRef.current || isPending) return;
      if (isModalOpen) return;

      entryLockRef.current = true;
      setIsPending(true);

      try {
        const decision = await resolveConflict(groupCode);

        if (decision === "block") return;
        if (decision === "confirm") {
          openModal(groupCode);
          return;
        }

        goToRoom(groupCode);
      } finally {
        entryLockRef.current = false;
        setIsPending(false);
      }
    },
    [goToRoom, isModalOpen, isPending, openModal, resolveConflict],
  );

  const confirmLeaveAndEnter = useCallback(async () => {
    if (!pendingGroupCode || entryLockRef.current) return;

    entryLockRef.current = true;
    setIsPending(true);

    const targetGroupCode = pendingGroupCode;

    try {
      if (isActiveInLiveKitRoom(targetGroupCode)) {
        notify("이미 참여 중인 방입니다.", "error");
        closeModal();
        return;
      }

      const requestId = requestLeaveOtherLiveKitRooms(targetGroupCode);
      await waitForLiveKitLeaveAck(requestId, 2000);

      const active = getActiveLiveKitGroupCode();
      if (active && active !== targetGroupCode) {
        forceClearActiveLiveKitRoom();
      }

      await new Promise((resolve) => window.setTimeout(resolve, 250));

      // 확인 직 후에도 같은 방 중복만 강하게 막고, 서버 지연은 forceEnter로 통과
      if (isActiveInLiveKitRoom(targetGroupCode)) {
        notify("이미 참여 중인 방입니다.", "error");
        return;
      }

      if (
        modalHistoryPushedRef.current &&
        hasOtherRoomModalState(window.history.state)
      ) {
        modalHistoryPushedRef.current = false;
        window.history.replaceState(null, "");
      }

      setIsModalOpen(false);
      setPendingGroupCode(null);
      goToRoom(targetGroupCode, { forceEnterAfterLeave: true });
    } catch (error) {
      console.error("기존 방 나가기 후 입장 실패", error);
      notify("방 이동에 실패했습니다. 다시 시도해주세요.", "error");
    } finally {
      entryLockRef.current = false;
      setIsPending(false);
    }
  }, [closeModal, goToRoom, notify, pendingGroupCode]);

  const cancelLeaveAndEnter = useCallback(() => {
    closeModal();
  }, [closeModal]);

  return {
    isOtherRoomModalOpen: isModalOpen,
    isRoomEntryPending: isPending,
    pendingGroupCode,
    requestEnterRoom,
    confirmLeaveAndEnter,
    cancelLeaveAndEnter,
  };
}
