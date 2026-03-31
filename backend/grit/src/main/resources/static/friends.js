// 인증 헤더
function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    };
}

// 인증 확인
function checkAuth() {
    if (!localStorage.getItem('access_token')) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

// 에러 표시
function showError(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.classList.add('show');
}

function hideError(elementId) {
    const el = document.getElementById(elementId);
    el.textContent = '';
    el.classList.remove('show');
}

// 모달 열기/닫기
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

// ────────────────────────────────────────
// API
// ────────────────────────────────────────

async function fetchFriendList() {
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/friends`, {
        method: 'GET',
        headers: authHeaders()
    });
    if (!response.ok) throw new Error('친구 목록을 불러오지 못했습니다.');
    return response.json();
}

async function addFriend(nickname) {
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/friends/${encodeURIComponent(nickname)}`, {
        method: 'POST',
        headers: authHeaders()
    });
    if (response.status === 400) throw new Error('자기 자신은 친구로 추가할 수 없습니다.');
    if (response.status === 404) throw new Error('해당 닉네임의 사용자를 찾을 수 없습니다.');
    if (response.status === 409) throw new Error('이미 친구로 등록된 사용자입니다.');
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || '친구 추가에 실패했습니다.');
    }
    return response.json();
}

async function removeFriend(nickname) {
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/friends/${encodeURIComponent(nickname)}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    if (response.status === 404) throw new Error('친구 관계를 찾을 수 없습니다.');
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || '친구 삭제에 실패했습니다.');
    }
    return response.json();
}

// ────────────────────────────────────────
// 렌더링
// ────────────────────────────────────────

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderFriendList(friends) {
    const container = document.getElementById('friend-list');

    if (!friends || friends.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">${ICONS.heartLg}</div>
                <p>아직 친구가 없습니다. 친구를 추가해보세요!</p>
            </div>`;
        return;
    }

    container.innerHTML = friends.map(friend => {
        const initial = escapeHtml(friend.nickname.charAt(0));
        const avatar = friend.imageUrl
            ? `<img src="${escapeHtml(friend.imageUrl)}" alt="${initial}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.parentElement.textContent='${initial}'">`
            : initial;
        return `
        <div class="item-card">
            <div class="item-avatar">${avatar}</div>
            <div class="item-info">
                <h3>${escapeHtml(friend.nickname)}</h3>
                <p>${friend.introduction ? escapeHtml(friend.introduction) : '소개가 없습니다.'}</p>
            </div>
            <button class="btn btn-danger" onclick="handleRemoveFriend('${escapeHtml(friend.nickname)}')">삭제</button>
        </div>`;
    }).join('');
}

// ────────────────────────────────────────
// 친구 목록 로드
// ────────────────────────────────────────

async function loadFriends() {
    try {
        const friends = await fetchFriendList();
        renderFriendList(friends);
    } catch (error) {
        showError('error-message', error.message);
    }
}

// ────────────────────────────────────────
// 친구 추가 모달
// ────────────────────────────────────────

document.getElementById('add-friend-btn').addEventListener('click', () => {
    document.getElementById('friend-nickname').value = '';
    hideError('add-error');
    openModal('add-modal');
    setTimeout(() => document.getElementById('friend-nickname').focus(), 100);
});

document.getElementById('add-cancel-btn').addEventListener('click', () => closeModal('add-modal'));

document.getElementById('add-submit-btn').addEventListener('click', async () => {
    hideError('add-error');
    const nickname = document.getElementById('friend-nickname').value.trim();

    if (!nickname) {
        showError('add-error', '닉네임을 입력해주세요.');
        return;
    }

    const btn = document.getElementById('add-submit-btn');
    btn.disabled = true;
    btn.textContent = '추가 중...';

    try {
        const friend = await addFriend(nickname);
        closeModal('add-modal');
        toast.success(`'${friend.nickname}'님을 친구로 추가했습니다.`);
        await loadFriends();
    } catch (error) {
        showError('add-error', error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = '추가';
    }
});

// Enter 키로 제출
document.getElementById('friend-nickname').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('add-submit-btn').click();
});

// ────────────────────────────────────────
// 친구 삭제
// ────────────────────────────────────────

async function handleRemoveFriend(nickname) {
    if (!confirm(`'${nickname}'님을 친구 목록에서 삭제하시겠습니까?`)) return;

    try {
        await removeFriend(nickname);
        toast.info(`'${nickname}'님을 친구 목록에서 삭제했습니다.`);
        await loadFriends();
    } catch (error) {
        toast.error(error.message);
    }
}

// 모달 배경 클릭 시 닫기
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('show');
    });
});

// ────────────────────────────────────────
// 초기 로드
// ────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    loadFriends();
});

document.getElementById('logout-link').addEventListener('click', () => {
    if (confirm('로그아웃 하시겠습니까?')) logout();
});
