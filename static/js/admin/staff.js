// SalonEase Admin Staff Management
document.addEventListener('DOMContentLoaded', function() {
    // Read JWT token from localStorage
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
        console.error('No JWT token found');
        return;
    }
    
    // Add Staff button click handler
    const addStaffBtn = document.querySelector('.btn-primary');
    if (addStaffBtn) {
        addStaffBtn.addEventListener('click', openCreateStaffModal);
    }
    
    // Cancel button click handler
    const cancelBtn = document.querySelector('.modal-footer .btn-secondary');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeCreateStaffModal);
    }
    
    // Close icon click handler
    const closeIcon = document.querySelector('.modal-header .close');
    if (closeIcon) {
        closeIcon.addEventListener('click', closeCreateStaffModal);
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
        
        // Render staff into table body
        if (data.success && data.staff) {
            renderStaffTable(data.staff);
        }
    })
    .catch(error => {
        console.error('Error fetching staff:', error);
    });
});

function openCreateStaffModal() {
    const modal = document.getElementById('createStaffModal');
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
    }
}

function closeCreateStaffModal() {
    const modal = document.getElementById('createStaffModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
}

function renderStaffTable(staff) {
    const tableBody = document.getElementById('staffTable');
    
    if (!tableBody) return;
    
    if (!staff || staff.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No staff found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = staff.map(member => `
        <tr>
            <td>${escapeHtml(member.name)}</td>
            <td>${escapeHtml(member.email)}</td>
            <td>${escapeHtml(member.phone)}</td>
            <td>${escapeHtml(member.gender)}</td>
            <td>
                <button class="btn btn-sm btn-primary">Edit</button>
                <button class="btn btn-sm btn-danger">Delete</button>
            </td>
        </tr>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
