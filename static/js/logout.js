// SalonEase Logout Utility
function logout() {
    // Clear localStorage
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    
    // Redirect user to login page
    window.location.href = '/auth/login';
}

// Add click handlers for logout links
document.addEventListener('DOMContentLoaded', function() {
    // Handle elements with class 'logout'
    const logoutLinks = document.querySelectorAll('.logout');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
    
    // Handle elements with href="#logout"
    const logoutHrefLinks = document.querySelectorAll('a[href="#logout"]');
    logoutHrefLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
});
