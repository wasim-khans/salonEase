document.addEventListener('DOMContentLoaded', () => {
    console.log('appointments.js loaded');
    
    // Check if user is logged in and is an admin
    const token = localStorage.getItem('jwtToken');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user || user.type !== 'admin') {
        alert('Access denied. Admin login required.');
        window.location.href = '/auth/login';
        return;
    }
    
    // Load appointments data
    loadAppointments();
});

async function loadAppointments() {
    const token = localStorage.getItem('jwtToken');
    
    try {
        const response = await fetch('/api/admin/appointments', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('Appointments data:', data);
        
        if (data.success) {
            displayAppointments(data.appointments);
        } else {
            console.error('Failed to load appointments:', data.message);
            alert(data.message || 'Failed to load appointments');
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
        alert('An error occurred while loading appointments');
    }
}

function displayAppointments(appointments) {
    console.log('Displaying appointments:', appointments);
    // TODO: Implement UI to display appointments
    // For now, just log them
}
