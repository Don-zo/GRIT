// DOM 요소
const welcomeMessage = document.getElementById('welcome-message');
const profileNickname = document.getElementById('profile-nickname');
const profileEmail = document.getElementById('profile-email');
const profileIntroduction = document.getElementById('profile-introduction');
const profileAvatar = document.getElementById('profile-avatar');
const deleteAccountBtn = document.getElementById('delete-account-btn');
const editProfileBtn = document.getElementById('edit-profile-btn');
const errorMessage = document.getElementById('error-message');

// 에러 메시지 표시
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

// 프로필 섹션 스켈레톤 제거
function clearProfileSkeleton() {
    const nickname = document.getElementById('profile-nickname');
    const email = document.getElementById('profile-email');
    const avatar = document.getElementById('profile-avatar');
    nickname.classList.remove('skeleton');
    nickname.style.cssText = '';
    email.classList.remove('skeleton');
    email.style.cssText = '';
    avatar.classList.remove('skeleton');
    avatar.style.cssText = '';
    document.getElementById('edit-profile-btn').style.display = '';
}

// 백앤드에서 사용자 정보 조회
async function fetchUserInfo() {
    try {
        const token = localStorage.getItem('access_token');
        const memberId = localStorage.getItem('member_id');

        if (!token || !memberId) throw new Error('인증 정보가 없습니다.');

        const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/members/me`);

        if (!response.ok) throw new Error('사용자 정보를 불러올 수 없습니다.');

        const memberInfo = await response.json();
        localStorage.setItem('member_id', memberInfo.id);
        localStorage.setItem('member_email', memberInfo.email);
        if (memberInfo.nickname) localStorage.setItem('member_nickname', memberInfo.nickname);
        else localStorage.removeItem('member_nickname');
        if (memberInfo.introduction) localStorage.setItem('member_introduction', memberInfo.introduction);
        else localStorage.removeItem('member_introduction');
        if (memberInfo.imageUrl) localStorage.setItem('member_image', memberInfo.imageUrl);
        else localStorage.removeItem('member_image');
        if (memberInfo.dDayDate) localStorage.setItem('member_dDayDate', memberInfo.dDayDate);
        else localStorage.removeItem('member_dDayDate');
        if (memberInfo.dDayTitle) localStorage.setItem('member_dDayTitle', memberInfo.dDayTitle);
        else localStorage.removeItem('member_dDayTitle');
        if (memberInfo.weeklyStudyTimeGoal) localStorage.setItem('member_weeklyStudyTimeGoal', memberInfo.weeklyStudyTimeGoal);
        else localStorage.removeItem('member_weeklyStudyTimeGoal');

        return memberInfo;
    } catch (error) {
        console.error('사용자 정보 조회 오류:', error);
        throw error;
    }
}

// 사용자 정보를 화면에 표시
function displayUserInfo(memberInfo) {
    clearProfileSkeleton();

    const nickname = memberInfo.nickname || '사용자';
    welcomeMessage.textContent = `${nickname}님, 환영합니다!`;

    profileNickname.textContent = memberInfo.nickname || '닉네임 없음';
    profileEmail.textContent = memberInfo.email || '';

    // 프로필 아바타 표시
    const initial = nickname.charAt(0).toUpperCase();
    if (memberInfo.imageUrl) {
        profileAvatar.className = '';
        profileAvatar.innerHTML = `<img class="profile-card-avatar" src="${memberInfo.imageUrl}" alt="프로필" onerror="this.parentElement.className='profile-card-avatar-placeholder';this.parentElement.textContent='${initial}';"/>`;
    } else {
        profileAvatar.className = 'profile-card-avatar-placeholder';
        profileAvatar.textContent = initial;
    }

    if (memberInfo.introduction) {
        profileIntroduction.textContent = memberInfo.introduction;
        profileIntroduction.style.opacity = '1';
        profileIntroduction.style.fontStyle = 'normal';
    } else {
        profileIntroduction.textContent = '자기소개가 없습니다.';
        profileIntroduction.style.opacity = '0.7';
        profileIntroduction.style.fontStyle = 'italic';
    }

    // D-Day & 주간 목표 표시
    const profileMeta = document.getElementById('profile-meta');
    let showMeta = false;

    if (memberInfo.dDayDate && memberInfo.dDayTitle) {
        const ddaySection = document.getElementById('dday-section');
        const profileDday = document.getElementById('profile-dday');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(memberInfo.dDayDate + 'T00:00:00');
        const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
        let ddayText;
        if (diff > 0) ddayText = `D-${diff}`;
        else if (diff === 0) ddayText = 'D-Day';
        else ddayText = `D+${Math.abs(diff)}`;
        profileDday.textContent = `${memberInfo.dDayTitle} (${ddayText})`;
        ddaySection.style.display = '';
        showMeta = true;
    }

    if (memberInfo.weeklyStudyTimeGoal) {
        const goalSection = document.getElementById('weekly-goal-section');
        const profileGoal = document.getElementById('profile-weekly-goal');
        const [h, m] = memberInfo.weeklyStudyTimeGoal.split(':');
        profileGoal.textContent = `${parseInt(h)}시간 ${parseInt(m)}분`;
        goalSection.style.display = '';
        showMeta = true;
    }

    if (showMeta) profileMeta.style.display = '';
}

// 로그인 확인 및 사용자 정보 로드
async function loadUserInfo() {
    const token = localStorage.getItem('access_token');

    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    try {
        const memberInfo = await fetchUserInfo();
        displayUserInfo(memberInfo);
    } catch (error) {
        clearProfileSkeleton();
        toast.error(error.message);
        showError(error.message);

        if (error.message.includes('인증')) {
            setTimeout(() => logout(), 2000);
        }
    }
}

// 회원 탈퇴 → DELETE /api/members/me
async function deleteAccount() {
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/members/me`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || '탈퇴에 실패했습니다.');
    }
}

// 사이드바 로그아웃 링크
document.getElementById('logout-link').addEventListener('click', () => {
    if (confirm('로그아웃 하시겠습니까?')) logout();
});

// 회원 탈퇴
deleteAccountBtn.addEventListener('click', async () => {
    if (!confirm('정말 탈퇴하시겠습니까?\n모든 데이터가 삭제됩니다.')) return;

    deleteAccountBtn.disabled = true;
    deleteAccountBtn.textContent = '처리 중...';

    try {
        await deleteAccount();
        toast.success('탈퇴가 완료되었습니다.');
        setTimeout(() => logout(), 1000);
    } catch (error) {
        toast.error(error.message);
        deleteAccountBtn.disabled = false;
        deleteAccountBtn.textContent = '탈퇴';
    }
});

// 프로필 수정
editProfileBtn.addEventListener('click', () => {
    window.location.href = '/profile-setup.html';
});

// 페이지 로드 시 사용자 정보 표시
document.addEventListener('DOMContentLoaded', loadUserInfo);
