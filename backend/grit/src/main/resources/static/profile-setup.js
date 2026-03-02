// DOM 요소
const profileForm = document.getElementById('profile-form');
const userEmailDisplay = document.getElementById('user-email');
const nicknameInput = document.getElementById('nickname');
const introductionInput = document.getElementById('introduction');
const submitBtn = document.getElementById('submit-btn');
const errorMessage = document.getElementById('error-message');

// 에러 메시지 표시
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

// 에러 메시지 숨기기
function hideError() {
    errorMessage.classList.remove('show');
}

// 글자수 카운터 업데이트
function updateCounter(inputEl, counterId, maxLen) {
    const counter = document.getElementById(counterId);
    const len = inputEl.value.length;
    counter.textContent = len;
    const parent = counter.closest('.char-counter');
    parent.classList.remove('near-limit', 'at-limit');
    if (len >= maxLen) parent.classList.add('at-limit');
    else if (len >= maxLen * 0.8) parent.classList.add('near-limit');
}

// 사용자 정보 로드
function loadMemberInfo() {
    const email = localStorage.getItem('member_email');
    if (!email) {
        showError('로그인 정보를 찾을 수 없습니다.');
        setTimeout(() => { window.location.href = '/index.html'; }, 2000);
        return;
    }

    userEmailDisplay.textContent = email;

    const nickname = localStorage.getItem('member_nickname');
    const introduction = localStorage.getItem('member_introduction');

    if (nickname) {
        nicknameInput.value = nickname;
        updateCounter(nicknameInput, 'nickname-counter', 20);
    }
    if (introduction) {
        introductionInput.value = introduction;
        updateCounter(introductionInput, 'intro-counter', 200);
    }
}

// 실시간 글자수 카운터 이벤트
nicknameInput.addEventListener('input', () => updateCounter(nicknameInput, 'nickname-counter', 20));
introductionInput.addEventListener('input', () => updateCounter(introductionInput, 'intro-counter', 200));

// 프로필 저장 — 최초 가입이면 POST (초기화), 수정이면 PATCH
async function updateProfile(nickname, introduction) {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('인증 정보를 찾을 수 없습니다.');

        const DEFAULT_IMAGE = `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(localStorage.getItem('member_email') || 'grit')}`;

        const isFirstTime = localStorage.getItem('is_first_time_user') !== 'false';
        const method = isFirstTime ? 'POST' : 'PATCH';

        const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/members/me/profile`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nickname,
                introduction: introduction || '-',  // Member.validateAndGet이 null/blank 거부
                image: localStorage.getItem('member_image') || DEFAULT_IMAGE
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || '프로필 저장에 실패했습니다.');
        }

        const updated = await response.json();
        localStorage.setItem('member_id', updated.id);
        localStorage.setItem('member_email', updated.email);
        if (updated.nickname) localStorage.setItem('member_nickname', updated.nickname);
        else localStorage.removeItem('member_nickname');
        if (updated.introduction) localStorage.setItem('member_introduction', updated.introduction);
        else localStorage.removeItem('member_introduction');

        // 초기화 완료 후 플래그 해제
        localStorage.setItem('is_first_time_user', 'false');

        return updated;
    } catch (error) {
        console.error('프로필 저장 오류:', error);
        throw error;
    }
}

// 폼 제출 처리
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const nickname = nicknameInput.value.trim();
    const introduction = introductionInput.value.trim();

    if (!nickname) {
        showError('닉네임을 입력해주세요.');
        nicknameInput.focus();
        return;
    }

    // 버튼 비활성화
    submitBtn.disabled = true;
    submitBtn.textContent = '처리 중...';

    try {
        await updateProfile(nickname, introduction);
        toast.success('프로필이 저장되었습니다.');
        setTimeout(() => { window.location.href = '/main.html'; }, 800);
    } catch (error) {
        showError(error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = '완료';
    }
});

// 페이지 로드 시 사용자 정보 표시
document.addEventListener('DOMContentLoaded', loadMemberInfo);
