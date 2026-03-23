// Registration Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.querySelector('.auth-form');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const role = document.getElementById('role').value;
            const gender = document.getElementById('gender').value;
            
            // Basic client-side validation
            if (!name || !email || !password || !confirmPassword || !role) {
                showError('Please fill in all required fields');
                return;
            }
            
            if (!isValidEmail(email)) {
                showError('Please enter a valid email address');
                return;
            }
            
            if (password.length < 6) {
                showError('Password must be at least 6 characters long');
                return;
            }
            
            if (password !== confirmPassword) {
                showError('Passwords do not match');
                return;
            }
            
            if (role === 'staff' && !gender) {
                showError('Gender is required for staff members');
                return;
            }
            
            // Show loading state
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating Account...';
            submitBtn.disabled = true;
            
            // Submit form normally (server-side validation will handle the rest)
            registerForm.submit();
        });
        
        // Handle role change to show/hide gender field
        const roleSelect = document.getElementById('role');
        const genderGroup = document.getElementById('gender').closest('.form-group');
        
        if (roleSelect && genderGroup) {
            roleSelect.addEventListener('change', function() {
                if (this.value === 'staff') {
                    genderGroup.style.display = 'block';
                    document.getElementById('gender').required = true;
                } else {
                    genderGroup.style.display = 'none';
                    document.getElementById('gender').required = false;
                    document.getElementById('gender').value = '';
                }
            });
            
            // Initial state
            if (roleSelect.value !== 'staff') {
                genderGroup.style.display = 'none';
            }
        }
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
            registerForm.insertBefore(errorDiv, registerForm.firstChild);
        }
        errorDiv.textContent = message;
        
        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    // Auto-focus name field
    const nameField = document.getElementById('name');
    if (nameField) {
        nameField.focus();
    }
});
