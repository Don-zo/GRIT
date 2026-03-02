import { OAUTH_CONFIG } from "@/apis/constants/oauth";

export const getGoogleAuthUrl = () => {
    const params = new URLSearchParams({
        client_id: OAUTH_CONFIG.GOOGLE.CLIENT_ID,
        redirect_uri: OAUTH_CONFIG.GOOGLE.REDIRECT_URI,
        response_type: OAUTH_CONFIG.GOOGLE.RESPONSE_TYPE,
        scope: OAUTH_CONFIG.GOOGLE.SCOPE,  
    });
    return `${OAUTH_CONFIG.GOOGLE.AUTH_URL}?${params.toString()}`;
}

export const redirectToGoogleAuth = () => {
    window.location.href = getGoogleAuthUrl();
}