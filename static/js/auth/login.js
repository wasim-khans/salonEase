document.addEventListener('DOMContentLoaded', () => {
    console.log('Login page loaded');
    const loginForm = document.querySelector('form');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            console.log('Login response:', data);
            
            if (data.success) {
                localStorage.clear();
                localStorage.setItem('jwtToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                await new Promise(resolve => setTimeout(resolve, 2000)); // this is added to make sure the request life cycle completes properly to shows the reponse in the network tab
                if (data.user.type === 'customer') {
                    window.location.href = '/customer/services';
                } else if (data.user.type === 'admin') {
                    window.location.href = '/admin/appointments';
                } 
                // else if (data.user.type === 'staff') {
                //     window.location.href = '/staff/appointments';
                // }
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login');
        }
    });
});
