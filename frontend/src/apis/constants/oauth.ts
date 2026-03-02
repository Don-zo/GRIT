export const OAUTH_CONFIG = {
    GOOGLE: {
        AUTH_URL: import.meta.env.VITE_GOOGLE_AUTH_URL,
        CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        REDIRECT_URI: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
        RESPONSE_TYPE: "code",
        SCOPE: "email profile",
    },
} as const;