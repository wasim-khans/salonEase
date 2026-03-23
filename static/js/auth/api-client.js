// Modern API Authentication Client
class ApiAuthClient {
    constructor() {
        this.baseURL = '/api';
        this.token = localStorage.getItem('salonease_token');
    }
    
    // Login using API
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store token and user data
                localStorage.setItem('salonease_token', data.token);
                localStorage.setItem('salonease_user', JSON.stringify(data.user));
                
                // Show success message
                this.showMessage('Login successful!', 'success');
                
                // Redirect to dashboard or home
                setTimeout(() => {
                    window.location.href = data.user.role === 'admin' ? '/admin/dashboard' : '/services';
                }, 1000);
            } else {
                this.showMessage(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
        }
    }
    
    // Register using API
    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store token and user data
                localStorage.setItem('salonease_token', data.token);
                localStorage.setItem('salonease_user', JSON.stringify(data.user));
                
                // Show success message
                this.showMessage('Registration successful!', 'success');
                
                // Redirect to appropriate page
                setTimeout(() => {
                    window.location.href = data.user.role === 'admin' ? '/admin/dashboard' : '/services';
                }, 1000);
            } else {
                this.showMessage(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
        }
    }
    
    // Logout
    logout() {
        localStorage.removeItem('salonease_token');
        localStorage.removeItem('salonease_user');
        window.location.href = '/auth/login';
    }
    
    // Get current user
    getCurrentUser() {
        const userStr = localStorage.getItem('salonease_user');
        return userStr ? JSON.parse(userStr) : null;
    }
    
    // Check if user is logged in
    isLoggedIn() {
        return !!this.getToken();
    }
    
    // Get current token
    getToken() {
        return localStorage.getItem('salonease_token');
    }
    
    // Show message
    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // Create new alert
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        // Insert at top of main content
        const main = document.querySelector('main .container');
        if (main) {
            main.insertBefore(alert, main.firstChild);
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 5000);
    }
    
    // Update UI based on authentication state
    updateAuthUI() {
        const user = this.getCurrentUser();
        const loginLinks = document.querySelectorAll('.auth-required');
        const logoutLink = document.querySelector('.auth-logout');
        const userInfo = document.querySelector('.user-info');
        
        if (user) {
            // User is logged in
            loginLinks.forEach(link => link.style.display = 'none');
            if (logoutLink) logoutLink.style.display = 'block';
            if (userInfo) {
                userInfo.textContent = user.name;
                userInfo.style.display = 'block';
            }
        } else {
            // User is not logged in
            loginLinks.forEach(link => link.style.display = 'block');
            if (logoutLink) logoutLink.style.display = 'none';
            if (userInfo) userInfo.style.display = 'none';
        }
    }
}

// Export for use in pages
window.ApiAuthClient = ApiAuthClient;
