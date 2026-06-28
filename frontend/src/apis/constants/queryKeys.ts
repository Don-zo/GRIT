export const QUERY_KEYS = {
  member: {
    me: ["member", "me"] as const,
  },
  groups: {
    all: ["groups"] as const,
    my: ["groups", "my"] as const,
    detail: (groupCode: string) => ["groups", "detail", groupCode] as const,
    members: (groupCode: string) => ["groups", "members", groupCode] as const,
    memberTodos: (
      groupCode: string,
      memberId: number,
      view: "category" | "day",
    ) => ["groups", "memberTodos", groupCode, memberId, view] as const,
  },
  friend: {
    all: ["friends"] as const,
  },
  todos: {
    all: ["todos"] as const,
    byUser: (userId: number) => ["todos", "user", userId] as const,
    achievement: (userId: number | null) =>
      ["todos", "achievement", "user", userId ?? "guest"] as const,
    achievementByUser: (userId: number) =>
      ["todos", "achievement", "user", userId] as const,
    byUserRange: (
      userId: number,
      startDate: string,
      dayCount: number,
    ) => ["todos", "user", userId, startDate, dayCount] as const,
  },
  todoCategories: {
    all: ["todoCategories"] as const,
    byUser: (userId: number) => ["todoCategories", "user", userId] as const,
  },
  livekit: {
    reactions: (groupCode: string) =>
      ["livekit", "reactions", groupCode] as const,
  },
  pomodoro: {
    status: (groupCode: string) => ["pomodoro", "status", groupCode] as const,
  },
} as const;