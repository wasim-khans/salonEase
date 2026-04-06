// SalonEase Admin Staff Management
document.addEventListener('DOMContentLoaded', function() {
    // Read JWT token from localStorage
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
        console.error('No JWT token found');
        return;
    }
    
    // Fetch GET /api/admin/staff
    fetch('/api/admin/staff', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        // Log API response to console
        console.log('Staff API response:', data);
    })
    .catch(error => {
        console.error('Error fetching staff:', error);
    });
});
