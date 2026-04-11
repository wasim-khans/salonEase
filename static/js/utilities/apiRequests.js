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