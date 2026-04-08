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
    JOIN: (groupCode: string) => `/api/groups/${groupCode}/join`,
    IMAGE_UPLOAD: "/api/groups/image-upload-url",
  },
  FRIEND: {
    LIST: "/api/friends",
    DETAIL: (nickname: string) => `/api/friends/${nickname}`,
  },
  LIVEKIT: {
    TOKEN: "/livekit/token",
  },
  TODO: {
    BY_ID: (todoId: number) => `/api/todos/${todoId}`,
    DONE: (todoId: number) => `/api/todos/${todoId}/done`,
    DUE_DATE: (todoId: number) => `/api/todos/${todoId}/due-date`,
    BY_USER: (userId: number) => `/api/users/${userId}/todos`,
    CATEGORIES_BY_USER: (userId: number) =>
      `/api/users/${userId}/todo-categories`,
    CATEGORIES_BY_USER_CATEGORY: (userId: number, categoryId: number) =>
      `/api/users/${userId}/todo-categories/${categoryId}`,
    CATEGORIES_REORDER: (userId: number) =>
      `/api/users/${userId}/todo-categories/reorder`,
  },
} as const;
