// DOM 요소
const profileForm = document.getElementById('profile-form');
const userEmailDisplay = document.getElementById('user-email');
const nicknameInput = document.getElementById('nickname');
const introductionInput = document.getElementById('introduction');
const dDayDateInput = document.getElementById('d-day-date');
const dDayTitleInput = document.getElementById('d-day-title');
const goalHoursSelect = document.getElementById('goal-hours');
const goalMinutesSelect = document.getElementById('goal-minutes');
const submitBtn = document.getElementById('submit-btn');
const errorMessage = document.getElementById('error-message');

// 이미지 업로드 관련 DOM
const imagePreview = document.getElementById('image-preview');
const imagePreviewImg = document.getElementById('image-preview-img');
const imagePlaceholder = document.getElementById('image-placeholder');
const imageOverlay = document.getElementById('image-overlay');
const imageInput = document.getElementById('image-input');
const imageUploadArea = document.getElementById('image-upload-area');

// 이미지 상태
let uploadedFileName = null;  // S3에 업로드된 파일명

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

// ── 이미지 업로드 ──

// 이미지 클릭 → 파일 선택
imagePreview.addEventListener('click', () => {
    if (imageUploadArea.classList.contains('uploading')) return;
    imageInput.click();
});

// 파일 선택 시 → 즉시 S3 업로드
imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('이미지 파일은 5MB 이하만 업로드할 수 있습니다.');
        return;
    }

    hideError();

    // 미리보기 표시
    const reader = new FileReader();
    reader.onload = (ev) => {
        imagePreviewImg.src = ev.target.result;
        imagePreviewImg.style.display = 'block';
        imagePlaceholder.style.display = 'none';
    };
    reader.readAsDataURL(file);

    // 즉시 S3 업로드
    try {
        imageUploadArea.classList.add('uploading');
        imageOverlay.innerHTML = '<div class="upload-spinner"></div>';

        uploadedFileName = await uploadImageToS3(file);
        toast.success('이미지가 업로드되었습니다.');
    } catch (error) {
        showError(error.message);
        uploadedFileName = null;
        // 미리보기 롤백
        imagePreviewImg.style.display = 'none';
        imagePlaceholder.style.display = '';
    } finally {
        imageUploadArea.classList.remove('uploading');
        imageOverlay.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
            </svg>`;
    }
});

// presigned URL 가져오기 + S3에 업로드
async function uploadImageToS3(file) {
    // 1. presigned URL 요청
    const urlResponse = await apiFetch(`${API_CONFIG.BASE_URL}/api/members/me/profile-image/upload-url`, {
        method: 'POST'
    });

    if (!urlResponse.ok) {
        throw new Error('이미지 업로드 URL 생성에 실패했습니다.');
    }

    const { fileName, uploadUrl } = await urlResponse.json();

    // 2. S3에 직접 업로드 (presigned PUT)
    const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
    });

    if (!uploadResponse.ok) {
        throw new Error('이미지 업로드에 실패했습니다.');
    }

    return fileName;
}

// ── 사용자 정보 로드 ──

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

    // D-Day / 주간 목표 로드
    const dDayDate = localStorage.getItem('member_dDayDate');
    const dDayTitle = localStorage.getItem('member_dDayTitle');
    const weeklyGoal = localStorage.getItem('member_weeklyStudyTimeGoal');

    if (dDayDate) dDayDateInput.value = dDayDate;
    if (dDayTitle) dDayTitleInput.value = dDayTitle;
    if (weeklyGoal) {
        const parts = weeklyGoal.split(':');
        if (parts.length === 2) {
            goalHoursSelect.value = parseInt(parts[0], 10).toString(); // remove leading zeros if any
            goalMinutesSelect.value = parts[1];
        }
    }

    // 기존 프로필 이미지가 있으면 placeholder에 이니셜 표시
    const memberNickname = nickname || email;
    imagePlaceholder.textContent = memberNickname.charAt(0).toUpperCase();

    // 기존 프로필 이미지 표시
    const memberImage = localStorage.getItem('member_image');
    if (memberImage) {
        imagePreviewImg.src = memberImage;
        imagePreviewImg.style.display = 'block';
        imagePlaceholder.style.display = 'none';
        // uploadedFileName은 설정하지 않음 — 이미 저장된 이미지이므로
    }
}

// 실시간 글자수 카운터 이벤트
nicknameInput.addEventListener('input', () => updateCounter(nicknameInput, 'nickname-counter', 20));
introductionInput.addEventListener('input', () => updateCounter(introductionInput, 'intro-counter', 200));

// ── 프로필 저장 ──

async function updateProfile(nickname, introduction, imageFileName, dDayDate, dDayTitle, weeklyGoal) {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('인증 정보를 찾을 수 없습니다.');

        const isFirstTime = localStorage.getItem('is_first_time_user') !== 'false';
        const method = isFirstTime ? 'POST' : 'PATCH';

        const body = { nickname, introduction };

        // 이미지 파일명이 있으면 포함 (UUID)
        if (imageFileName) {
            body.imageName = imageFileName;
        }

        // D-Day
        if (dDayDate) body.dDayDate = dDayDate;
        if (dDayTitle) body.dDayTitle = dDayTitle;

        // 주간 공부 목표
        if (weeklyGoal) body.weeklyStudyTimeGoal = weeklyGoal;

        const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/members/me/profile`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || '프로필 저장에 실패했습니다.');
        }

        const updated = await response.json();
        localStorage.setItem('member_email', updated.email);
        if (updated.nickname) localStorage.setItem('member_nickname', updated.nickname);
        else localStorage.removeItem('member_nickname');
        if (updated.introduction) localStorage.setItem('member_introduction', updated.introduction);
        else localStorage.removeItem('member_introduction');
        if (updated.imageUrl) localStorage.setItem('member_image', updated.imageUrl);
        else localStorage.removeItem('member_image');
        if (updated.dDayDate) localStorage.setItem('member_dDayDate', updated.dDayDate);
        else localStorage.removeItem('member_dDayDate');
        if (updated.dDayTitle) localStorage.setItem('member_dDayTitle', updated.dDayTitle);
        else localStorage.removeItem('member_dDayTitle');
        if (updated.weeklyStudyTimeGoal) localStorage.setItem('member_weeklyStudyTimeGoal', updated.weeklyStudyTimeGoal);
        else localStorage.removeItem('member_weeklyStudyTimeGoal');

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
    const dDayDate = dDayDateInput.value || null;
    const dDayTitle = dDayTitleInput.value.trim() || null;
    
    // 시간/분 합쳐서 HH:mm 포맷 생성
    const hours = goalHoursSelect.value;
    const minutes = goalMinutesSelect.value;
    let weeklyGoal = null;
    
    if (hours && minutes) {
        weeklyGoal = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    } else if (hours || minutes) {
        showError('주간 공부 목표의 시간과 분을 모두 선택해주세요.');
        return;
    }

    if (!nickname) {
        showError('닉네임을 입력해주세요.');
        nicknameInput.focus();
        return;
    }

    // D-Day 일관성 체크
    if ((dDayDate && !dDayTitle) || (!dDayDate && dDayTitle)) {
        showError('D-Day 날짜와 제목을 함께 입력하거나, 둘 다 비워두세요.');
        return;
    }

    // 버튼 비활성화
    submitBtn.disabled = true;
    submitBtn.textContent = '처리 중...';

    try {
        await updateProfile(nickname, introduction, uploadedFileName, dDayDate, dDayTitle, weeklyGoal);
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
