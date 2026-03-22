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

async function createGroup(name, imageName) {
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/groups`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name, imageName: imageName || null })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || '그룹 생성에 실패했습니다.');
    }
    return response.json();
}

async function joinGroup(groupCode) {
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/groups/${encodeURIComponent(groupCode)}/join`, {
        method: 'POST',
        headers: authHeaders()
    });
    if (response.status === 409) throw new Error('이미 가입된 그룹입니다.');
    if (response.status === 404) throw new Error('존재하지 않는 그룹 코드입니다.');
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || '그룹 가입에 실패했습니다.');
    }
    return response.json();
}

async function updateGroup(groupCode, name, imageName) {
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/groups/${encodeURIComponent(groupCode)}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ name, imageName: imageName || null })
    });
    if (response.status === 403) throw new Error('수정 권한이 없습니다.');
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || '그룹 수정에 실패했습니다.');
    }
    return response.json();
}

async function leaveGroup(groupCode) {
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/groups/${encodeURIComponent(groupCode)}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || '그룹 나가기에 실패했습니다.');
    }
}

// ────────────────────────────────────────
// 이미지 업로드 공통
// ────────────────────────────────────────

function setupImageUpload(inputId, previewId, containerId, hiddenInputId) {
    const inputEl = document.getElementById(inputId);
    const containerEl = document.getElementById(containerId);
    
    // 프리뷰 클릭 시 파일 선택
    containerEl.addEventListener('click', () => inputEl.click());

    // 파일 선택 시 프리뷰 변경
    inputEl.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 5MB 제한
        if (file.size > 5 * 1024 * 1024) {
            toast.error('이미지 크기는 5MB 이하여야 합니다.');
            inputEl.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => setPreviewImage(previewId, e.target.result);
        reader.readAsDataURL(file);
        
        // 새로운 파일이 선택되었음을 표시 (UUID 초기화)
        document.getElementById(hiddenInputId).value = '';
    });
}

function setPreviewImage(previewId, imageUrl) {
    const previewEl = document.getElementById(previewId);
    if (!previewEl) return;
    
    // 모달용 .banner-image-placeholder
    const placeholder = previewEl.querySelector('.banner-image-placeholder');
    let img = previewEl.querySelector('img');

    if (imageUrl) {
        if (!img) {
            img = document.createElement('img');
            previewEl.insertBefore(img, previewEl.firstChild);
        }
        img.src = imageUrl;
        if (placeholder) placeholder.style.display = 'none';
        
        // Remove old onerror to prevent loop
        img.onerror = function() {
            this.remove();
            if (placeholder) placeholder.style.display = 'flex';
        };
    } else {
        if (img) img.remove();
        if (placeholder) placeholder.style.display = 'flex';
    }
}

async function uploadGroupImage(file, wrapperId) {
    const wrapper = document.getElementById(wrapperId);
    wrapper.classList.add('uploading');

    try {
        const urlRes = await apiFetch('/api/groups/image-upload-url');
        if (!urlRes.ok) throw new Error('업로드 URL 발급 실패');
        
        const { fileName, uploadUrl } = await urlRes.json();

        const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type }
        });

        if (!uploadRes.ok) throw new Error('S3 업로드 실패');

        return fileName;
    } finally {
        wrapper.classList.remove('uploading');
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
        <div class="group-card" onclick="openDetailModal('${escapeAttr(group.groupCode)}', '${escapeAttr(group.name)}', ${group.memberCount}, '${escapeAttr(group.imageUrl || '')}')">
            <div class="group-card-image">
                ${group.imageUrl
                    ? `<img src="${escapeAttr(group.imageUrl)}" alt="${escapeAttr(group.name)}" onerror="this.outerHTML='<div class=\\'group-card-placeholder\\'>${escapeHtml(group.name.charAt(0))}</div>'" />`
                    : `<div class="group-card-placeholder">${escapeHtml(group.name.charAt(0))}</div>`
                }
            </div>
            <div class="group-card-content">
                <h3 class="group-card-title">${escapeHtml(group.name)}</h3>
                <div class="group-card-meta">
                    <div class="group-card-meta-left">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span>${group.memberCount}명</span>
                    </div>
                    <span class="invite-code">${escapeHtml(group.groupCode)}</span>
                </div>
            </div>
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
    document.getElementById('create-image-input').value = '';
    document.getElementById('create-image-name').value = '';
    setPreviewImage('create-image-preview', null);
    hideError('create-error');
    openModal('create-modal');
});

document.getElementById('create-cancel-btn').addEventListener('click', () => closeModal('create-modal'));

document.getElementById('create-submit-btn').addEventListener('click', async () => {
    hideError('create-error');
    const name = document.getElementById('create-name').value.trim();
    const imageInput = document.getElementById('create-image-input');

    if (!name) {
        showError('create-error', '그룹 이름을 입력해주세요.');
        return;
    }

    const btn = document.getElementById('create-submit-btn');
    btn.disabled = true;
    btn.textContent = '생성 중...';

    try {
        let imageName = null;
        if (imageInput.files.length > 0) {
            imageName = await uploadGroupImage(imageInput.files[0], 'create-image-upload');
        }

        const group = await createGroup(name, imageName);
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

let currentGroupCode = null;

function openDetailModal(groupCode, name, memberCount, imageUrl) {
    currentGroupCode = groupCode;
    hideError('detail-error');

    document.getElementById('detail-name').textContent = name;
    document.getElementById('detail-member-count').textContent = `멤버 ${memberCount}명`;
    document.getElementById('detail-invite-code').textContent = groupCode;

    const imageEl = document.getElementById('detail-image');
    // Save raw image URL for Edit modal
    imageEl.dataset.rawUrl = imageUrl || '';

    if (imageUrl) {
        imageEl.outerHTML = `<img class="group-detail-image" id="detail-image" data-raw-url="${escapeAttr(imageUrl)}" src="${escapeAttr(imageUrl)}" alt="${escapeAttr(name)}" onerror="this.outerHTML='<div class=\\'group-detail-image\\' id=\\'detail-image\\' data-raw-url=\\'\\'>${escapeHtml(name.charAt(0))}</div>'" />`;
    } else {
        imageEl.outerHTML = `<div class="group-detail-image" id="detail-image" data-raw-url="">${escapeHtml(name.charAt(0))}</div>`;
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
        await leaveGroup(currentGroupCode);
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
    window.location.href = `/livekit.html?groupCode=${encodeURIComponent(currentGroupCode)}&groupName=${encodeURIComponent(groupName)}`;
});

document.getElementById('detail-edit-btn').addEventListener('click', () => {
    const name = document.getElementById('detail-name').textContent;
    const imageUrl = document.getElementById('detail-image').dataset.rawUrl;
    
    document.getElementById('edit-group-code').value = currentGroupCode;
    document.getElementById('edit-name').value = name;
    document.getElementById('edit-image-input').value = '';
    
    setPreviewImage('edit-image-preview', imageUrl || null);
    
    // Edit 시 기존 이미지를 유지하는 경우 UUID를 알 방법이 없으므로,
    // 새 이미지가 없을 경우 서버에 image 필드를 아예 안 보내거나 (null), 
    // 혹은 기존처럼 냅두도록 서버 API를 활용해야 함.
    // 백엔드는 null일 경우 기존 이미지를 덮어쓰지 않는 구조임이 확인되었기에,
    // 수정하지 않을 경우 imageName=null 을 보낸다.
    document.getElementById('edit-image-name').value = '';
    
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
    const groupCode = document.getElementById('edit-group-code').value;
    const name = document.getElementById('edit-name').value.trim();
    const imageInput = document.getElementById('edit-image-input');

    if (!name) {
        showError('edit-error', '그룹 이름을 입력해주세요.');
        return;
    }

    const btn = document.getElementById('edit-submit-btn');
    btn.disabled = true;
    btn.textContent = '저장 중...';

    try {
        let imageName = null;
        if (imageInput.files.length > 0) {
            imageName = await uploadGroupImage(imageInput.files[0], 'edit-image-upload');
        }

        await updateGroup(groupCode, name, imageName);
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
    
    // 이미지 업로드 UI 초기화
    setupImageUpload('create-image-input', 'create-image-preview', 'create-image-preview', 'create-image-name');
    setupImageUpload('edit-image-input', 'edit-image-preview', 'edit-image-preview', 'edit-image-name');
    
    loadGroups();
});

document.getElementById('logout-link').addEventListener('click', () => {
    if (confirm('로그아웃 하시겠습니까?')) logout();
});
