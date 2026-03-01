// ────────────────────────────────────────
// 액세스 토큰 자동 재발급 fetch 래퍼
// ────────────────────────────────────────

(function () {
    let isRefreshing = false;
    let pendingRequests = [];

    async function doRefresh() {
        // refresh_token은 HttpOnly 쿠키로 관리 — 브라우저가 자동 전송
        const res = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include'
        });

        if (!res.ok) throw new Error('토큰 갱신 실패');

        const data = await res.json();
        const newToken = data.accessToken;
        localStorage.setItem('access_token', newToken);
        return newToken;
    }

    /**
     * fetch를 래핑한 함수.
     * 응답이 401이면 refresh 토큰으로 액세스 토큰을 재발급 후 원래 요청을 재시도.
     * refresh 실패 시 localStorage를 모두 비우고 로그인 페이지로 이동.
     */
    async function apiFetch(url, options = {}) {
        // 최신 토큰을 항상 헤더에 반영
        function withAuth(opts) {
            const token = localStorage.getItem('access_token');
            return {
                ...opts,
                credentials: 'include',
                headers: {
                    ...(opts.headers || {}),
                    'Authorization': `Bearer ${token}`
                }
            };
        }

        let response = await fetch(url, withAuth(options));

        if (response.status !== 401) return response;

        // ── 401: 토큰 만료 → refresh ──
        if (!isRefreshing) {
            isRefreshing = true;
            try {
                await doRefresh();
                // 대기 중이던 요청들 재시도 허용
                pendingRequests.forEach(resolve => resolve());
            } catch (e) {
                pendingRequests.forEach(resolve => resolve());
                // refresh 실패 → 로그아웃
                ['access_token', 'member_id',
                    'member_email', 'member_nickname', 'member_introduction']
                    .forEach(k => localStorage.removeItem(k));
                window.location.href = '/index.html';
                throw e;
            } finally {
                isRefreshing = false;
                pendingRequests = [];
            }
        } else {
            // 이미 refresh 중이면 완료될 때까지 대기
            await new Promise(resolve => pendingRequests.push(resolve));
        }

        // 새 토큰으로 원래 요청 재시도
        return fetch(url, withAuth(options));
    }

    window.apiFetch = apiFetch;
})();

// ────────────────────────────────────────
// Toast 알림 시스템
// ────────────────────────────────────────

(function () {
    function getContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    function show(message, type = 'info', duration = 3000) {
        const container = getContainer();

        const toastIcons = {
            success: (window.ICONS && ICONS.check) || '✓',
            error: (window.ICONS && ICONS.x) || '✕',
            info: (window.ICONS && ICONS.info) || 'ℹ'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<span class="toast-icon">${toastIcons[type] || toastIcons.info}</span><span>${message}</span>`;

        container.appendChild(toast);

        // 자동 제거
        setTimeout(() => {
            toast.classList.add('toast-hide');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    window.toast = {
        success: (msg, duration) => show(msg, 'success', duration),
        error: (msg, duration) => show(msg, 'error', duration),
        info: (msg, duration) => show(msg, 'info', duration),
    };
})();
