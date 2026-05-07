// DOM 요소
const statusMessage = document.getElementById('status-message');
const errorMessage = document.getElementById('error-message');

// 상태 메시지 업데이트
function updateStatus(message) {
    statusMessage.textContent = message;
}

// 에러 표시
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    statusMessage.textContent = '';

    // 3초 후 로그인 페이지로 리다이렉트
    setTimeout(() => {
        window.location.href = '/index.html';
    }, 3000);
}

// 토큰 저장 (access_token만 — refresh_token은 HttpOnly 쿠키로 관리)
function saveTokens(accessToken) {
    localStorage.setItem('access_token', accessToken);
}

// 사용자 정보 저장
function saveMemberInfo(member) {
    localStorage.setItem('member_id', member.id);
    localStorage.setItem('member_email', member.email);
    if (member.nickname) localStorage.setItem('member_nickname', member.nickname);
    else localStorage.removeItem('member_nickname');
    if (member.introduction) localStorage.setItem('member_introduction', member.introduction);
    else localStorage.removeItem('member_introduction');
    if (member.imageName) localStorage.setItem('member_imageName', member.imageName);
    else localStorage.removeItem('member_imageName');
    if (member.imageUrl) localStorage.setItem('member_image', member.imageUrl);
    else localStorage.removeItem('member_image');
    if (member.dDayDate) localStorage.setItem('member_dDayDate', member.dDayDate);
    else localStorage.removeItem('member_dDayDate');
    if (member.dDayTitle) localStorage.setItem('member_dDayTitle', member.dDayTitle);
    else localStorage.removeItem('member_dDayTitle');
    if (member.weeklyStudyTimeGoal) localStorage.setItem('member_weeklyStudyTimeGoal', member.weeklyStudyTimeGoal);
    else localStorage.removeItem('member_weeklyStudyTimeGoal');
}

// 백엔드로 인가 코드 전송
async function sendCodeToBackend(code) {
    try {
        updateStatus('서버와 통신 중...');

        const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.AUTH_ENDPOINT, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: code,
                redirectUri: GOOGLE_CONFIG.REDIRECT_URI
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || '서버 오류가 발생했습니다.');
        }

        const data = await response.json();

        // 응답 구조 확인
        if (!data.accessToken) {
            throw new Error('토큰을 받지 못했습니다.');
        }

        // 토큰 저장 (Access Token만 저장)
        saveTokens(data.accessToken);

        // 사용자 정보 저장
        if (data.member) {
            saveMemberInfo(data.member);
        }

        // 최초 가입 여부 저장 — profile-setup.js에서 POST/PUT 분기에 사용
        localStorage.setItem('is_first_time_user', data.firstTimeUser ? 'true' : 'false');

        updateStatus('로그인 성공! 이동 중...');

        // firstTimeUser 여부에 따라 다른 페이지로 리다이렉트
        setTimeout(() => {
            if (data.firstTimeUser) {
                // 최초 사용자는 프로필 설정 페이지로
                window.location.href = '/profile-setup.html';
            } else {
                // 기존 사용자는 메인 페이지로
                window.location.href = '/main.html';
            }
        }, 1000);
    } catch (error) {
        console.error('백엔드 통신 오류:', error);
        showError(error.message || '로그인 처리 중 오류가 발생했습니다.');
    }
}

// URL에서 인가 코드 추출 및 처리
function handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    // 에러 처리
    if (error) {
        let errorMsg = '로그인 중 오류가 발생했습니다.';
        if (error === 'access_denied') {
            errorMsg = '로그인이 취소되었습니다.';
        }
        showError(errorMsg);
        return;
    }

    // 인가 코드가 없는 경우
    if (!code) {
        showError('인증 코드를 받지 못했습니다.');
        return;
    }

    // 백엔드로 코드 전송
    updateStatus('인증 정보를 확인하는 중...');
    sendCodeToBackend(code);
}

// 페이지 로드 시 콜백 처리
document.addEventListener('DOMContentLoaded', handleCallback);
