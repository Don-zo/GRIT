// ────────────────────────────────────────
// Todo JS — /api/users/{userId}/todos
// ────────────────────────────────────────

function getMemberId() {
    return localStorage.getItem('member_id');
}

// 인증 확인
function checkAuth() {
    if (!localStorage.getItem('access_token')) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

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
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ────────────────────────────────────────
// API
// ────────────────────────────────────────

async function fetchTodos() {
    const userId = getMemberId();
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/users/${userId}/todos`);
    if (!response.ok) throw new Error('투두 목록을 불러오지 못했습니다.');
    return response.json();
}

async function fetchAchievement() {
    const userId = getMemberId();
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/users/${userId}/todos/achievement/last-7-days`);
    if (!response.ok) throw new Error('달성도를 불러오지 못했습니다.');
    return response.json();
}

async function createTodo(content, subjectCategory, dueDate) {
    const userId = getMemberId();
    const body = { content };
    if (subjectCategory) body.subjectCategory = subjectCategory;
    if (dueDate) body.dueDate = dueDate;

    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/users/${userId}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || '투두 생성에 실패했습니다.');
    }
    return response.json();
}

async function updateTodo(todoId, patch) {
    const userId = getMemberId();
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/todos/${todoId}?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
    });
    if (response.status === 403) throw new Error('본인의 투두만 수정할 수 있습니다.');
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || '투두 수정에 실패했습니다.');
    }
    return response.json();
}

async function deleteTodo(todoId) {
    const userId = getMemberId();
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/todos/${todoId}?userId=${userId}`, {
        method: 'DELETE'
    });
    if (response.status === 403) throw new Error('본인의 투두만 삭제할 수 있습니다.');
    if (!response.ok) throw new Error('투두 삭제에 실패했습니다.');
}

// ────────────────────────────────────────
// 상태
// ────────────────────────────────────────

let allTodos = [];
let activeFilter = 'all';
let activeCategoryFilter = '';

// ────────────────────────────────────────
// 달성도 렌더링
// ────────────────────────────────────────

const CATEGORY_LABELS = {
    SCHOOL: '학교 과제',
    PROJECT: '프로젝트',
    CERT: '자격증',
    ETC: '기타'
};

function renderAchievement(data) {
    const container = document.getElementById('achievement-bars');
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">최근 7일 데이터가 없습니다.</p>';
        return;
    }

    const days = ['일', '월', '화', '수', '목', '금', '토'];
    container.innerHTML = data.map(d => {
        const date = new Date(d.date);
        const dayLabel = days[date.getDay()];
        const rate = d.achievementRate || 0;
        const barColor = rate >= 80 ? 'var(--accent)' : rate >= 50 ? '#a78bfa' : 'rgba(99,102,241,0.35)';
        return `
            <div class="achievement-bar-item">
                <div class="achievement-bar-wrap">
                    <div class="achievement-bar-fill" style="height:${rate}%;background:${barColor};"></div>
                </div>
                <div class="achievement-rate">${rate}%</div>
                <div class="achievement-day">${dayLabel}</div>
            </div>`;
    }).join('');
}

// ────────────────────────────────────────
// 투두 목록 렌더링
// ────────────────────────────────────────

function getFilteredTodos() {
    return allTodos.filter(todo => {
        const filterOk = activeFilter === 'all'
            ? true
            : activeFilter === 'done'
                ? todo.isDone
                : !todo.isDone;
        const categoryOk = !activeCategoryFilter || todo.subjectCategory === activeCategoryFilter;
        return filterOk && categoryOk;
    });
}

function renderTodoList() {
    const container = document.getElementById('todo-list');
    const filtered = getFilteredTodos();

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 12 2 2 4-4"/></svg></div>
                <p>투두가 없습니다. 새로운 할일을 추가해보세요!</p>
            </div>`;
        return;
    }

    // Sort: 미완료 먼저, 마감일 오름차순
    const sorted = [...filtered].sort((a, b) => {
        if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
        if (a.dueDate && b.dueDate) return a.dueDate < b.dueDate ? -1 : 1;
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return 0;
    });

    container.innerHTML = sorted.map(todo => {
        const isOverdue = !todo.isDone && todo.dueDate && new Date(todo.dueDate) < new Date();
        const categoryLabel = todo.subjectCategory ? CATEGORY_LABELS[todo.subjectCategory] || todo.subjectCategory : '';
        const dueDateStr = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) : '';

        return `
            <div class="todo-item ${todo.isDone ? 'todo-done' : ''}" id="todo-${todo.id}">
                <button class="todo-check ${todo.isDone ? 'checked' : ''}" onclick="handleToggleDone(${todo.id}, ${!todo.isDone})" title="${todo.isDone ? '완료 취소' : '완료 처리'}">
                    ${todo.isDone ? ICONS.check : ''}
                </button>
                <div class="todo-body">
                    <div class="todo-content">${escapeHtml(todo.content)}</div>
                    <div class="todo-meta">
                        ${categoryLabel ? `<span class="todo-badge">${categoryLabel}</span>` : ''}
                        ${dueDateStr ? `<span class="todo-due ${isOverdue ? 'overdue' : ''}">${dueDateStr}${isOverdue ? ' 지남' : ''}</span>` : ''}
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="icon-btn" onclick="openEditModal(${todo.id})" title="수정">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                    <button class="icon-btn danger" onclick="handleDeleteTodo(${todo.id})" title="삭제">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>`;
    }).join('');
}

// ────────────────────────────────────────
// 액션 핸들러
// ────────────────────────────────────────

async function handleToggleDone(todoId, isDone) {
    try {
        const updated = await updateTodo(todoId, { isDone });
        const idx = allTodos.findIndex(t => t.id === todoId);
        if (idx !== -1) allTodos[idx] = updated;
        renderTodoList();
        await loadAchievement();
    } catch (error) {
        toast.error(error.message);
    }
}

async function handleDeleteTodo(todoId) {
    if (!confirm('이 투두를 삭제하시겠습니까?')) return;
    try {
        await deleteTodo(todoId);
        allTodos = allTodos.filter(t => t.id !== todoId);
        renderTodoList();
        await loadAchievement();
        toast.info('투두를 삭제했습니다.');
    } catch (error) {
        toast.error(error.message);
    }
}

// ────────────────────────────────────────
// 모달 — 추가
// ────────────────────────────────────────

document.getElementById('add-todo-btn').addEventListener('click', () => {
    document.getElementById('modal-title').textContent = '투두 추가';
    document.getElementById('edit-todo-id').value = '';
    document.getElementById('todo-content').value = '';
    document.getElementById('todo-category').value = '';
    document.getElementById('todo-duedate').value = '';
    document.getElementById('todo-submit-btn').textContent = '추가';
    hideError('todo-error');
    openModal('todo-modal');
    setTimeout(() => document.getElementById('todo-content').focus(), 100);
});

// 수정 모달
function openEditModal(todoId) {
    const todo = allTodos.find(t => t.id === todoId);
    if (!todo) return;

    document.getElementById('modal-title').textContent = '투두 수정';
    document.getElementById('edit-todo-id').value = todoId;
    document.getElementById('todo-content').value = todo.content;
    document.getElementById('todo-category').value = todo.subjectCategory || '';
    document.getElementById('todo-duedate').value = todo.dueDate || '';
    document.getElementById('todo-submit-btn').textContent = '저장';
    hideError('todo-error');
    openModal('todo-modal');
    setTimeout(() => document.getElementById('todo-content').focus(), 100);
}

document.getElementById('todo-cancel-btn').addEventListener('click', () => closeModal('todo-modal'));

document.getElementById('todo-submit-btn').addEventListener('click', async () => {
    hideError('todo-error');
    const content = document.getElementById('todo-content').value.trim();
    const category = document.getElementById('todo-category').value;
    const dueDate = document.getElementById('todo-duedate').value;
    const editId = document.getElementById('edit-todo-id').value;

    if (!content) {
        showError('todo-error', '내용을 입력해주세요.');
        return;
    }

    const btn = document.getElementById('todo-submit-btn');
    btn.disabled = true;
    const origText = btn.textContent;
    btn.textContent = '처리 중...';

    try {
        if (editId) {
            // 수정
            const patch = { content };
            if (category) patch.subjectCategory = category;
            if (dueDate) patch.dueDate = dueDate;
            const updated = await updateTodo(Number(editId), patch);
            const idx = allTodos.findIndex(t => t.id === Number(editId));
            if (idx !== -1) allTodos[idx] = updated;
            toast.success('투두가 수정되었습니다.');
        } else {
            // 추가
            const created = await createTodo(content, category || null, dueDate || null);
            allTodos.unshift(created);
            toast.success('투두가 추가되었습니다.');
        }
        closeModal('todo-modal');
        renderTodoList();
        await loadAchievement();
    } catch (error) {
        showError('todo-error', error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = origText;
    }
});

document.getElementById('todo-content').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('todo-submit-btn').click();
});

// ────────────────────────────────────────
// 필터
// ────────────────────────────────────────

document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeFilter = tab.dataset.filter;
        renderTodoList();
    });
});

document.getElementById('category-filter').addEventListener('change', e => {
    activeCategoryFilter = e.target.value;
    renderTodoList();
});

// 모달 배경 클릭 닫기
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('show');
    });
});

// ────────────────────────────────────────
// 로드
// ────────────────────────────────────────

async function loadAchievement() {
    try {
        const data = await fetchAchievement();
        renderAchievement(data);
    } catch (e) {
        document.getElementById('achievement-bars').innerHTML =
            '<p style="color:var(--text-muted);font-size:13px;">달성도를 불러올 수 없습니다.</p>';
    }
}

async function loadTodos() {
    try {
        allTodos = await fetchTodos();
        renderTodoList();
    } catch (error) {
        showError('error-message', error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    loadTodos();
    loadAchievement();
});

// 로그아웃
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) { /* ignore */ }
    ['access_token', 'member_id', 'member_email', 'member_nickname', 'member_introduction']
        .forEach(k => localStorage.removeItem(k));
    window.location.href = '/index.html';
}

document.getElementById('logout-link').addEventListener('click', () => {
    if (confirm('로그아웃 하시겠습니까?')) logout();
});
