// Modern Login Form with API Integration
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (window.ApiAuthClient && window.ApiAuthClient.isLoggedIn()) {
        window.location.href = '/services';
        return;
    }
    
    const loginForm = document.querySelector('.auth-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Basic client-side validation
            if (!email || !password) {
                showError('Please fill in all fields');
                return;
            }
            
            if (!isValidEmail(email)) {
                showError('Please enter a valid email address');
                return;
            }
            
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;
            
            try {
                // Use API client for login
                await window.ApiAuthClient.login(email, password);
            } catch (error) {
                showError('Login failed. Please try again.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function showError(message) {
        // Create or update error message
        let errorDiv = document.querySelector('.auth-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'auth-error alert alert-danger';
            loginForm.insertBefore(errorDiv, loginForm.firstChild);
        }
        errorDiv.textContent = message;
        
        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    // Auto-focus email field
    const emailField = document.getElementById('email');
    if (emailField) {
        emailField.focus();
    }
});
