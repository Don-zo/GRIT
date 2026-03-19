export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE: "/api/auth/google",
    REFRESH: "/api/auth/refresh",
    LOGOUT: "/api/auth/logout",
  },
  GROUP: {
    BASE: "/api/groups",
    DETAIL: (id: number) => `/api/groups/${id}`,
  },
  LIVEKIT: {
    URL: import.meta.env.VITE_LIVEKIT_URL,
    TOKEN: "/livekit/token",
  },
} as const;
