// Google OAuth 설정
// TODO: Google Cloud Console에서 발급받은 Client ID로 변경하세요
const GOOGLE_CONFIG = {
    CLIENT_ID: '82645759352-2ujn9rbnson1dhldl9if6qfl9hvorl6j.apps.googleusercontent.com',
    REDIRECT_URI: window.location.origin + '/callback.html',
    SCOPE: 'openid profile email',
    RESPONSE_TYPE: 'code',
    ACCESS_TYPE: 'offline',
    PROMPT: 'consent'
};

// 백엔드 API 엔드포인트
const API_CONFIG = {
    // TODO: 실제 백엔드 API 엔드포인트로 변경하세요
    BASE_URL: window.location.origin,
    AUTH_ENDPOINT: '/api/auth/google',
    USER_INFO_ENDPOINT: '/api/user/me'
};

// Google OAuth URL 생성
function getGoogleAuthUrl() {
    const params = new URLSearchParams({
        client_id: GOOGLE_CONFIG.CLIENT_ID,
        redirect_uri: GOOGLE_CONFIG.REDIRECT_URI,
        response_type: GOOGLE_CONFIG.RESPONSE_TYPE,
        scope: GOOGLE_CONFIG.SCOPE,
        access_type: GOOGLE_CONFIG.ACCESS_TYPE,
        prompt: GOOGLE_CONFIG.PROMPT
    });
    
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
