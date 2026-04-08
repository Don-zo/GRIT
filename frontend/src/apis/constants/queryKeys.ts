export const QUERY_KEYS = {
  member: {
    me: ["member", "me"] as const,
  },
  groups: {
    all: ["groups"] as const,
    my: ["groups", "my"] as const,
    detail: (groupCode: string) => ["groups", "detail", groupCode] as const,
  },
  friend: {
    all: ["friends"] as const,
  },
  todos: {
    all: ["todos"] as const,
    byUser: (userId: number) => ["todos", "user", userId] as const,
  },
  todoCategories: {
    all: ["todoCategories"] as const,
    byUser: (userId: number) => ["todoCategories", "user", userId] as const,
  },
} as const;