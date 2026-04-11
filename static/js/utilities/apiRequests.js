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