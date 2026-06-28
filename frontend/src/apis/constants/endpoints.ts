export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

export const ENDPOINTS = {
  AUTH: {
    GOOGLE: "/api/auth/google",
    REFRESH: "/api/auth/refresh",
    LOGOUT: "/api/auth/logout",
  },
  MY: {
    INFO: "/api/members/me",
    PROFILE: "/api/members/me/profile",
    NICKNAME_CHECK: "/api/members/nickname-availability",
    IMAGE_UPLOAD: `/api/members/me/profile-image/upload-url`,
  },
  GROUP: {
    CREATE: "/api/groups",
    MY: "/api/groups/my",
    INFO: (groupCode: string) => `/api/groups/${groupCode}`,
    MEMBERS: (groupCode: string) => `/api/groups/${groupCode}/members`,
    MEMBER_TODOS: (groupCode: string, memberId: number) =>
      `/api/groups/${groupCode}/members/${memberId}/todos`,
    JOIN: (groupCode: string) => `/api/groups/${groupCode}/join`,
    IMAGE_UPLOAD: "/api/groups/image-upload-url",
  },
  FRIEND: {
    LIST: "/api/friends",
    DETAIL: (nickname: string) => `/api/friends/${nickname}`,
  },
  LIVEKIT: {
    TOKEN: (groupCode: string) => `/api/group/${groupCode}/livekit/token`,
    REACTIONS: (groupCode: string) =>
      `/api/group/${groupCode}/livekit/reactions`,
    REACTION: (groupCode: string) => `/api/group/${groupCode}/livekit/reaction`,
  },
  POMODORO: {
    STATUS: (groupCode: string) => `/api/group/${groupCode}/livekit/pomodoro`,
    START: (groupCode: string) =>
      `/api/group/${groupCode}/livekit/pomodoro/start`,
    PAUSE: (groupCode: string) =>
      `/api/group/${groupCode}/livekit/pomodoro/pause`,
  },
  TODO: {
    BY_ID: (todoId: number) => `/api/members/me/todos/${todoId}`,
    DONE: (todoId: number) => `/api/members/me/todos/${todoId}/done`,
    DUE_DATE: (todoId: number) => `/api/members/me/todos/${todoId}/due-date`,
    LIST: `/api/members/me/todos`,
    ACHIEVEMENT: `/api/members/me/todos/achievement`,
    CATEGORIES: `/api/members/me/todo-categories`,
    CATEGORY_BY_ID: (categoryId: number) =>
      `/api/members/me/todo-categories/${categoryId}`,
    CATEGORIES_REORDER: `/api/members/me/todo-categories/reorder`,
  },
} as const;
