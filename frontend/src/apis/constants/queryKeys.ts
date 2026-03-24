export const QUERY_KEYS = {
  groups: {
    all: ["groups"] as const,
    my: ["groups", "my"] as const,
    detail: (groupCode: string) => ["groups", "detail", groupCode] as const,
  },
} as const;
