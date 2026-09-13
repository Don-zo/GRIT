const LIVEKIT_ROOM_CHANNEL = "grit-livekit-room";
const ACTIVE_ROOM_STORAGE_KEY = "grit-livekit-active-room";
const TAB_ID_KEY = "grit-livekit-tab-id";

type ActiveRoomRecord = {
  groupCode: string;
  tabId: string;
  updatedAt: number;
};

type RoomSyncMessage =
  | { type: "ROOM_JOINED"; groupCode: string; tabId: string }
  | { type: "ROOM_LEFT"; groupCode: string; tabId: string }
  | { type: "LEAVE_REQUEST"; requestId: string; exceptGroupCode?: string }
  | { type: "LEAVE_ACK"; requestId: string; tabId: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isRoomSyncMessage = (data: unknown): data is RoomSyncMessage => {
  if (!isRecord(data) || typeof data.type !== "string") return false;

  switch (data.type) {
    case "ROOM_JOINED":
    case "ROOM_LEFT":
      return (
        typeof data.groupCode === "string" && typeof data.tabId === "string"
      );
    case "LEAVE_REQUEST":
      return typeof data.requestId === "string";
    case "LEAVE_ACK":
      return (
        typeof data.requestId === "string" && typeof data.tabId === "string"
      );
    default:
      return false;
  }
};

function getTabId() {
  if (typeof window === "undefined") return "ssr";

  const existing = window.sessionStorage.getItem(TAB_ID_KEY);
  if (existing) return existing;

  const tabId = `tab-${crypto.randomUUID()}`;
  window.sessionStorage.setItem(TAB_ID_KEY, tabId);
  return tabId;
}

function readActiveRoom(): ActiveRoomRecord | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(ACTIVE_ROOM_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ActiveRoomRecord>;
    if (
      typeof parsed.groupCode !== "string" ||
      typeof parsed.tabId !== "string" ||
      typeof parsed.updatedAt !== "number"
    ) {
      return null;
    }

    return {
      groupCode: parsed.groupCode,
      tabId: parsed.tabId,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

function broadcast(message: RoomSyncMessage) {
  if (typeof BroadcastChannel === "undefined") return;

  const channel = new BroadcastChannel(LIVEKIT_ROOM_CHANNEL);
  channel.postMessage(message);
  channel.close();
}

export function getActiveLiveKitGroupCode(): string | null {
  return readActiveRoom()?.groupCode ?? null;
}

export function isActiveInLiveKitRoom(groupCode: string): boolean {
  return getActiveLiveKitGroupCode() === groupCode;
}

export function isActiveInOtherLiveKitRoom(groupCode: string): boolean {
  const active = getActiveLiveKitGroupCode();
  return active != null && active !== groupCode;
}

export function markLiveKitRoomJoined(groupCode: string) {
  if (typeof window === "undefined") return;

  const record: ActiveRoomRecord = {
    groupCode,
    tabId: getTabId(),
    updatedAt: Date.now(),
  };
  window.localStorage.setItem(ACTIVE_ROOM_STORAGE_KEY, JSON.stringify(record));
  broadcast({ type: "ROOM_JOINED", groupCode, tabId: record.tabId });
}

export function markLiveKitRoomLeft() {
  if (typeof window === "undefined") return;

  const current = readActiveRoom();
  if (!current || current.tabId !== getTabId()) return;

  window.localStorage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
  broadcast({
    type: "ROOM_LEFT",
    groupCode: current.groupCode,
    tabId: current.tabId,
  });
}

/** 홈 등 비-룸 화면에서 호출: 이 탭이 방에 없다고 확정되면 잔여 세션 정리 */
export function reconcileActiveLiveKitRoomOutsideRoom() {
  if (typeof window === "undefined") return;

  const current = readActiveRoom();
  if (!current) return;
  if (current.tabId !== getTabId()) return;

  window.localStorage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
  broadcast({
    type: "ROOM_LEFT",
    groupCode: current.groupCode,
    tabId: current.tabId,
  });
}

export function forceClearActiveLiveKitRoom() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
}

export function requestLeaveOtherLiveKitRooms(exceptGroupCode?: string) {
  const requestId = crypto.randomUUID();
  broadcast({
    type: "LEAVE_REQUEST",
    requestId,
    exceptGroupCode,
  });
  return requestId;
}

export function waitForLiveKitLeaveAck(
  requestId: string,
  timeoutMs = 1500,
): Promise<boolean> {
  if (typeof BroadcastChannel === "undefined") {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const channel = new BroadcastChannel(LIVEKIT_ROOM_CHANNEL);
    let settled = false;

    const finish = (received: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      channel.close();
      resolve(received);
    };

    const timer = window.setTimeout(() => finish(false), timeoutMs);

    channel.onmessage = (event: MessageEvent<unknown>) => {
      if (!isRoomSyncMessage(event.data)) return;
      if (event.data.type !== "LEAVE_ACK") return;
      if (event.data.requestId !== requestId) return;
      finish(true);
    };
  });
}

export function acknowledgeLiveKitLeave(requestId: string) {
  broadcast({
    type: "LEAVE_ACK",
    requestId,
    tabId: getTabId(),
  });
}

type LeaveSubscriptionHandlers = {
  onLeaveRequest: (payload: {
    requestId: string;
    exceptGroupCode?: string;
  }) => void;
};

export function subscribeLiveKitRoomSync(handlers: LeaveSubscriptionHandlers) {
  if (typeof BroadcastChannel === "undefined") {
    return () => undefined;
  }

  const channel = new BroadcastChannel(LIVEKIT_ROOM_CHANNEL);
  channel.onmessage = (event: MessageEvent<unknown>) => {
    if (!isRoomSyncMessage(event.data)) return;

    if (event.data.type === "LEAVE_REQUEST") {
      handlers.onLeaveRequest({
        requestId: event.data.requestId,
        exceptGroupCode: event.data.exceptGroupCode,
      });
    }
  };

  return () => {
    channel.close();
  };
}
