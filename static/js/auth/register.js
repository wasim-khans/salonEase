document.addEventListener('DOMContentLoaded', () => {
    console.log('Register page loaded');
    const registerForm = document.querySelector('form');
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const gender = document.getElementById('gender')?.value || 'prefer_not_to_say';
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, phone, password, gender })
            });
            
            const data = await response.json();
            console.log('Registration response:', data);
            
            if (data.success) {
                localStorage.clear();
                localStorage.setItem('jwtToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                if (data.user.type === 'customer') {
                    window.location.href = '/customer/services';
                } else if (data.user.type === 'admin') {
                    window.location.href = '/admin/appointments';
                }
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration');
        }
    });
});
