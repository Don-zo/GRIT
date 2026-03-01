// DOM 요소
const googleLoginBtn = document.getElementById('google-login-btn');
const errorMessage = document.getElementById('error-message');
const loading = document.getElementById('loading');

// 에러 메시지 표시
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    loading.classList.remove('show');
}

// 에러 메시지 숨기기
function hideError() {
    errorMessage.classList.remove('show');
}

// 로딩 상태 표시
function showLoading() {
    loading.classList.add('show');
    hideError();
}

// 로딩 상태 숨기기
function hideLoading() {
    loading.classList.remove('show');
}

// Google 로그인 시작
function initiateGoogleLogin() {
    try {
        // Client ID 확인
        if (GOOGLE_CONFIG.CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
            showError('Google Client ID가 설정되지 않았습니다. config.js 파일을 확인해주세요.');
            return;
        }

        hideError();
        showLoading();

        // Google OAuth 페이지로 리다이렉트
        const authUrl = getGoogleAuthUrl();
        window.location.href = authUrl;
    } catch (error) {
        console.error('Google 로그인 시작 중 오류:', error);
        showError('로그인을 시작할 수 없습니다. 다시 시도해주세요.');
    }
}

// 로그인 상태 확인
function checkLoginStatus() {
    const token = localStorage.getItem('access_token');
    if (token) {
        // 이미 로그인된 경우 메인 페이지로 리다이렉트
        window.location.href = '/main.html';
    }
}

// 저장된 사용자 정보 가져오기
function getMemberInfo() {
    const memberId = localStorage.getItem('member_id');
    if (!memberId) {
        return null;
    }

    return {
        id: parseInt(memberId),
        email: localStorage.getItem('member_email'),
        nickname: localStorage.getItem('member_nickname'),
        introduction: localStorage.getItem('member_introduction')
    };
}

// 로그아웃 (모든 정보 삭제)
async function logout() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (e) { /* ignore */ }
    localStorage.removeItem('access_token');
    localStorage.removeItem('member_id');
    localStorage.removeItem('member_email');
    localStorage.removeItem('member_nickname');
    localStorage.removeItem('member_introduction');
    window.location.href = '/index.html';
}

// 이벤트 리스너
googleLoginBtn.addEventListener('click', initiateGoogleLogin);

// 페이지 로드 시 로그인 상태 확인
document.addEventListener('DOMContentLoaded', checkLoginStatus);

// URL에 에러 파라미터가 있는지 확인
const urlParams = new URLSearchParams(window.location.search);
const error = urlParams.get('error');
if (error) {
    let errorMsg = '로그인 중 오류가 발생했습니다.';
    if (error === 'access_denied') {
        errorMsg = '로그인이 취소되었습니다.';
    } else if (error === 'invalid_client') {
        errorMsg = '잘못된 클라이언트 설정입니다.';
    }
    showError(errorMsg);
}
