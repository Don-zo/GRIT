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
    IMAGE_UPLOAD: `/api/members/me/profile-image/upload-url`,
  },
  GROUP: {
    CREATE: "/api/groups",
    MY: "/api/groups/my",
    INFO: (groupCode: string) => `/api/groups/${groupCode}`,
    JOIN: (groupCode: string) => `/api/groups/${groupCode}/join`,
    IMAGE_UPLOAD: "/api/groups/image-upload-url",
  },
  LIVEKIT: {
    TOKEN: "/livekit/token",
  },
  TODO: {
    BY_ID: (todoId: number) => `/api/todos/${todoId}`,
    BY_USER: (userId: number) => `/api/users/${userId}/todos`,
    CATEGORIES_BY_USER: (userId: number) =>
      `/api/users/${userId}/todo-categories`,
    CATEGORIES_BY_USER_CATEGORY: (userId: number, categoryId: number) =>
      `/api/users/${userId}/todo-categories/${categoryId}`,
  },
} as const;
