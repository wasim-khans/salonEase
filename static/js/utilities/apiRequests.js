// SalonEase Shared API & DOM Utilities

// Auth helpers

function getToken() {
    return localStorage.getItem('jwtToken');
}

function getUser() {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
}

function requireAuth(expectedType) {
    const token = getToken();
    const user = getUser();
    if (!token || !user || (expectedType && user.type !== expectedType)) {
        showError(expectedType === 'admin'
            ? 'Access denied. Admin login required.'
            : 'Please log in to continue.');
        window.location.href = '/auth/login';
        return false;
    }
    return true;
}

// Fetch wrapper

async function apiRequest(url, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers }
    });

    return response.json();
}

function apiGet(url) {
    return apiRequest(url, { method: 'GET' });
}

function apiPost(url, body) {
    return apiRequest(url, { method: 'POST', body: JSON.stringify(body) });
}

function apiPut(url, body) {
    return apiRequest(url, { method: 'PUT', body: JSON.stringify(body) });
}

function apiDelete(url) {
    return apiRequest(url, { method: 'DELETE' });
}

// DOM utilities

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// Modal helpers

function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
}

// Table loading state

function showTableLoading(tableBodyId, colspan, label) {
    const tbody = document.getElementById(tableBodyId);
    if (!tbody) return;
    tbody.innerHTML = `
        <tr class="loading-row">
            <td colspan="${colspan}" style="text-align:center; padding:20px; color:#999;">
                Loading ${label || 'data'}...
            </td>
        </tr>
    `;
}

function showTableEmpty(tableBodyId, colspan, label) {
    const tbody = document.getElementById(tableBodyId);
    if (!tbody) return;
    tbody.innerHTML = `
        <tr>
            <td colspan="${colspan}" style="text-align:center; color:#999;">
                No ${label || 'records'} found
            </td>
        </tr>
    `;
}