export const OAUTH_CONFIG = {
    GOOGLE: {
        AUTH_URL: "https://accounts.google.com/o/oauth2/v2/auth",
        CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        REDIRECT_URI: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
        RESPONSE_TYPE: "code",
        SCOPE: "email profile",
    },
} as const;