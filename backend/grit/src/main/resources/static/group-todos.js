let groups = [];
let members = [];
let selectedGroupCode = null;
let selectedMemberId = null;

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showError(message) {
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = message;
    errorEl.classList.add('show');
}

function hideError() {
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = '';
    errorEl.classList.remove('show');
}

function checkAuth() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

async function fetchMyGroups() {
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/groups/my`);
    if (!response.ok) throw new Error('그룹 목록을 불러오지 못했습니다.');
    return response.json();
}

async function fetchGroupMembers(groupCode) {
    const response = await apiFetch(`${API_CONFIG.BASE_URL}/api/groups/${encodeURIComponent(groupCode)}/members`);
    if (!response.ok) throw new Error('그룹 멤버를 불러오지 못했습니다.');
    return response.json();
}

async function fetchMemberTodos(groupCode, memberId, view) {
    const url = `${API_CONFIG.BASE_URL}/api/groups/${encodeURIComponent(groupCode)}/members/${encodeURIComponent(memberId)}/todos?view=${encodeURIComponent(view)}`;
    const response = await apiFetch(url);
    if (!response.ok) throw new Error('멤버 투두를 불러오지 못했습니다.');
    return response.json();
}

function renderGroupList() {
    const container = document.getElementById('group-list');
    if (!groups.length) {
        container.innerHTML = '<p class="group-todo-empty">참여한 그룹이 없습니다.</p>';
        return;
    }
    container.innerHTML = groups.map(group => `
        <button class="group-todo-item-btn ${group.groupCode === selectedGroupCode ? 'active' : ''}" data-group-code="${escapeHtml(group.groupCode)}">
            <strong>${escapeHtml(group.name)}</strong>
            <span>${escapeHtml(group.groupCode)}</span>
        </button>
    `).join('');
}

function renderMemberList() {
    const container = document.getElementById('member-list');
    if (!selectedGroupCode) {
        container.innerHTML = '<p class="group-todo-empty">그룹을 먼저 선택하세요.</p>';
        return;
    }
    if (!members.length) {
        container.innerHTML = '<p class="group-todo-empty">멤버가 없습니다.</p>';
        return;
    }
    container.innerHTML = members.map(member => `
        <button class="group-todo-item-btn ${member.id === selectedMemberId ? 'active' : ''}" data-member-id="${member.id}">
            <strong>${escapeHtml(member.nickname)}</strong>
            <span>${member.me ? '나' : '멤버'}</span>
        </button>
    `).join('');
}

function renderTodoSections(payload) {
    const rangeEl = document.getElementById('todo-range');
    const sectionsEl = document.getElementById('todo-sections');
    if (!payload) {
        rangeEl.textContent = '';
        sectionsEl.innerHTML = '<p class="group-todo-empty">멤버를 선택하면 투두가 표시됩니다.</p>';
        return;
    }

    rangeEl.textContent = `${payload.startDate} ~ ${payload.endDate}`;
    sectionsEl.innerHTML = payload.sections.map(section => {
        const todoItems = (section.todos || []).map(todo => `
            <li class="group-todo-todo-item ${todo.isDone ? 'done' : ''}">
                <div class="group-todo-todo-main">
                    <span class="group-todo-status">${todo.isDone ? '완료' : '미완료'}</span>
                    <span>${escapeHtml(todo.content)}</span>
                </div>
                <div class="group-todo-todo-meta">
                    <span>${escapeHtml(todo.dueDate || '-')}</span>
                    <span>${escapeHtml(todo.categoryName || '미분류')}</span>
                </div>
            </li>
        `).join('');

        return `
            <div class="group-todo-section">
                <h3>${escapeHtml(section.label)}</h3>
                ${todoItems
                    ? `<ul class="group-todo-todo-list">${todoItems}</ul>`
                    : '<p class="group-todo-empty">투두가 없습니다.</p>'}
            </div>
        `;
    }).join('');
}

async function loadMembersAndTodos(groupCode) {
    hideError();
    selectedGroupCode = groupCode;
    selectedMemberId = null;
    members = [];
    renderGroupList();
    renderMemberList();
    renderTodoSections(null);

    members = await fetchGroupMembers(groupCode);
    selectedMemberId = members[0]?.id ?? null;
    renderMemberList();

    if (selectedMemberId != null) {
        const view = document.getElementById('view-select').value;
        const payload = await fetchMemberTodos(selectedGroupCode, selectedMemberId, view);
        renderTodoSections(payload);
    }
}

async function loadTodosForSelectedMember() {
    if (!selectedGroupCode || !selectedMemberId) {
        renderTodoSections(null);
        return;
    }
    hideError();
    const view = document.getElementById('view-select').value;
    const payload = await fetchMemberTodos(selectedGroupCode, selectedMemberId, view);
    renderTodoSections(payload);
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;

    document.getElementById('logout-link').addEventListener('click', () => {
        if (confirm('로그아웃 하시겠습니까?')) logout();
    });

    document.getElementById('group-list').addEventListener('click', async e => {
        const button = e.target.closest('[data-group-code]');
        if (!button) return;
        try {
            await loadMembersAndTodos(button.getAttribute('data-group-code'));
        } catch (error) {
            showError(error.message);
        }
    });

    document.getElementById('member-list').addEventListener('click', async e => {
        const button = e.target.closest('[data-member-id]');
        if (!button) return;
        selectedMemberId = Number(button.getAttribute('data-member-id'));
        renderMemberList();
        try {
            await loadTodosForSelectedMember();
        } catch (error) {
            showError(error.message);
        }
    });

    document.getElementById('view-select').addEventListener('change', async () => {
        try {
            await loadTodosForSelectedMember();
        } catch (error) {
            showError(error.message);
        }
    });

    try {
        groups = await fetchMyGroups();
        selectedGroupCode = groups[0]?.groupCode ?? null;
        renderGroupList();
        if (selectedGroupCode) {
            await loadMembersAndTodos(selectedGroupCode);
        } else {
            renderMemberList();
            renderTodoSections(null);
        }
    } catch (error) {
        showError(error.message);
    }
});
