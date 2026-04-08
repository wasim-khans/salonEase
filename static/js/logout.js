// SalonEase Logout Utility
function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
}
