// 인증 헤더 생성
function authHeaders() {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// 인증 확인
function checkAuth() {
    const token = localStorage.getItem('access_token');
    if (!token) {
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
function openModal(id) {
    document.getElementById(id).classList.add('show');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
}

// ────────────────────────────────────────
// API 함수
// ────────────────────────────────────────

async function fetchMyGroups() {
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/groups/my`, {
        method: 'GET',
        headers: authHeaders()
    });
    if (!response.ok) throw new Error('그룹 목록을 불러오지 못했습니다.');
    return response.json();
}

async function createGroup(name, imageUrl) {
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/groups`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name, imageUrl: imageUrl || null })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || '그룹 생성에 실패했습니다.');
    }
    return response.json();
}

async function joinGroup(inviteCode) {
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/groups/join/code?inviteCode=${encodeURIComponent(inviteCode)}`, {
        method: 'POST',
        headers: authHeaders()
    });
    if (response.status === 409) throw new Error('이미 가입된 그룹입니다.');
    if (response.status === 404) throw new Error('존재하지 않는 초대 코드입니다.');
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || '그룹 가입에 실패했습니다.');
    }
    return response.json();
}

async function updateGroup(groupId, name, imageUrl) {
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/groups/${groupId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ name, imageUrl: imageUrl || null })
    });
    if (response.status === 403) throw new Error('수정 권한이 없습니다.');
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || '그룹 수정에 실패했습니다.');
    }
    return response.json();
}

async function leaveGroup(groupId) {
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || '그룹 나가기에 실패했습니다.');
    }
}

// ────────────────────────────────────────
// 렌더링
// ────────────────────────────────────────

function renderGroupList(groups) {
    const container = document.getElementById('group-list');

    if (!groups || groups.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">${ICONS.usersLg}</div>
                <p>아직 참가한 그룹이 없습니다.</p>
            </div>`;
        return;
    }

    container.innerHTML = groups.map(group => `
        <div class="item-card clickable" onclick="openDetailModal(${group.id}, '${escapeAttr(group.name)}', '${escapeAttr(group.inviteCode)}', ${group.memberCount}, '${escapeAttr(group.imageUrl || '')}')">
            ${group.imageUrl
            ? `<img class="item-avatar square" src="${escapeAttr(group.imageUrl)}" alt="${escapeAttr(group.name)}" onerror="this.outerHTML='<div class=\\'item-avatar square\\'>${escapeHtml(group.name.charAt(0))}</div>'" />`
            : `<div class="item-avatar square">${escapeHtml(group.name.charAt(0))}</div>`
        }
            <div class="item-info">
                <h3>${escapeHtml(group.name)}</h3>
                <div class="meta">
                    <span>멤버 ${group.memberCount}명</span>
                    <span class="invite-code">${escapeHtml(group.inviteCode)}</span>
                </div>
            </div>
            <span class="item-arrow">${ICONS.chevronRight}</span>
        </div>
    `).join('');
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
    return String(str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ────────────────────────────────────────
// 그룹 목록 로드
// ────────────────────────────────────────

async function loadGroups() {
    try {
        const groups = await fetchMyGroups();
        renderGroupList(groups);
    } catch (error) {
        showError('error-message', error.message);
    }
}

// ────────────────────────────────────────
// 그룹 생성 모달
// ────────────────────────────────────────

document.getElementById('create-group-btn').addEventListener('click', () => {
    document.getElementById('create-name').value = '';
    document.getElementById('create-image').value = '';
    hideError('create-error');
    openModal('create-modal');
});

document.getElementById('create-cancel-btn').addEventListener('click', () => closeModal('create-modal'));

document.getElementById('create-submit-btn').addEventListener('click', async () => {
    hideError('create-error');
    const name = document.getElementById('create-name').value.trim();
    const imageUrl = document.getElementById('create-image').value.trim();

    if (!name) {
        showError('create-error', '그룹 이름을 입력해주세요.');
        return;
    }

    const btn = document.getElementById('create-submit-btn');
    btn.disabled = true;
    btn.textContent = '생성 중...';

    try {
        const group = await createGroup(name, imageUrl);
        closeModal('create-modal');
        toast.success(`'${group.name}' 그룹이 생성되었습니다.`);
        await loadGroups();
    } catch (error) {
        showError('create-error', error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = '생성';
    }
});

document.getElementById('create-name').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('create-submit-btn').click();
});

// ────────────────────────────────────────
// 그룹 참가 모달
// ────────────────────────────────────────

document.getElementById('join-group-btn').addEventListener('click', () => {
    document.getElementById('invite-code').value = '';
    hideError('join-error');
    openModal('join-modal');
});

document.getElementById('join-cancel-btn').addEventListener('click', () => closeModal('join-modal'));

document.getElementById('join-submit-btn').addEventListener('click', async () => {
    hideError('join-error');
    const code = document.getElementById('invite-code').value.trim();

    if (!code) {
        showError('join-error', '초대 코드를 입력해주세요.');
        return;
    }

    const btn = document.getElementById('join-submit-btn');
    btn.disabled = true;
    btn.textContent = '참가 중...';

    try {
        const group = await joinGroup(code);
        closeModal('join-modal');
        toast.success(`'${group.name}' 그룹에 참가했습니다.`);
        await loadGroups();
    } catch (error) {
        showError('join-error', error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = '참가';
    }
});

document.getElementById('invite-code').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('join-submit-btn').click();
});

// ────────────────────────────────────────
// 그룹 상세 모달
// ────────────────────────────────────────

let currentGroupId = null;

function openDetailModal(id, name, inviteCode, memberCount, imageUrl) {
    currentGroupId = id;
    hideError('detail-error');

    document.getElementById('detail-name').textContent = name;
    document.getElementById('detail-member-count').textContent = `멤버 ${memberCount}명`;
    document.getElementById('detail-invite-code').textContent = inviteCode;

    const imageEl = document.getElementById('detail-image');
    if (imageUrl) {
        imageEl.outerHTML = `<img class="group-detail-image" id="detail-image" src="${escapeAttr(imageUrl)}" alt="${escapeAttr(name)}" onerror="this.outerHTML='<div class=\\'group-detail-image\\' id=\\'detail-image\\'>${escapeHtml(name.charAt(0))}</div>'" />`;
    } else {
        imageEl.textContent = name.charAt(0);
        imageEl.tagName === 'IMG' && (imageEl.outerHTML = `<div class="group-detail-image" id="detail-image">${escapeHtml(name.charAt(0))}</div>`);
    }

    openModal('detail-modal');
}

document.getElementById('detail-close-btn').addEventListener('click', () => closeModal('detail-modal'));

document.getElementById('detail-leave-btn').addEventListener('click', async () => {
    if (!confirm('정말 이 그룹에서 나가시겠습니까?')) return;
    hideError('detail-error');

    const btn = document.getElementById('detail-leave-btn');
    btn.disabled = true;
    btn.textContent = '처리 중...';

    try {
        await leaveGroup(currentGroupId);
        closeModal('detail-modal');
        toast.info('그룹에서 나갔습니다.');
        await loadGroups();
    } catch (error) {
        showError('detail-error', error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = '나가기';
    }
});

// 초대 코드 복사
document.getElementById('copy-code-btn').addEventListener('click', () => {
    const code = document.getElementById('detail-invite-code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        toast.success('초대 코드가 복사되었습니다.');
    }).catch(() => {
        toast.error('복사에 실패했습니다.');
    });
});

document.getElementById('detail-video-btn').addEventListener('click', () => {
    const groupName = document.getElementById('detail-name').textContent;
    window.location.href = `/livekit.html?groupId=${currentGroupId}&groupName=${encodeURIComponent(groupName)}`;
});

document.getElementById('detail-edit-btn').addEventListener('click', () => {
    const name = document.getElementById('detail-name').textContent;
    document.getElementById('edit-group-id').value = currentGroupId;
    document.getElementById('edit-name').value = name;
    document.getElementById('edit-image').value = '';
    hideError('edit-error');
    closeModal('detail-modal');
    openModal('edit-modal');
});

// ────────────────────────────────────────
// 그룹 수정 모달
// ────────────────────────────────────────

document.getElementById('edit-cancel-btn').addEventListener('click', () => closeModal('edit-modal'));

document.getElementById('edit-submit-btn').addEventListener('click', async () => {
    hideError('edit-error');
    const groupId = document.getElementById('edit-group-id').value;
    const name = document.getElementById('edit-name').value.trim();
    const imageUrl = document.getElementById('edit-image').value.trim();

    if (!name) {
        showError('edit-error', '그룹 이름을 입력해주세요.');
        return;
    }

    const btn = document.getElementById('edit-submit-btn');
    btn.disabled = true;
    btn.textContent = '저장 중...';

    try {
        await updateGroup(groupId, name, imageUrl);
        closeModal('edit-modal');
        toast.success('그룹 정보가 수정되었습니다.');
        await loadGroups();
    } catch (error) {
        showError('edit-error', error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = '저장';
    }
});

document.getElementById('edit-name').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('edit-submit-btn').click();
});

// 모달 배경 클릭 시 닫기
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('show');
        }
    });
});

// ────────────────────────────────────────
// 초기 로드
// ────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    loadGroups();
});
