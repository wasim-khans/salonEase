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
    
    // Create Staff form submit handler
    const createForm = document.querySelector('.modal-body form');
    if (createForm) {
        createForm.addEventListener('submit', handleCreateStaff);
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

// Global variable to store current editing staff id
let currentEditStaffId = null;

function openCreateStaffModal() {
    currentEditStaffId = null; // Reset for create mode
    const modal = document.getElementById('createStaffModal');
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
        
        // Update modal title for create mode
        const modalTitle = modal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Create New Staff';
        }
        
        // Clear form for create mode
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

function openEditStaffModal(staff) {
    currentEditStaffId = staff.id; // Store staff id for later use
    const modal = document.getElementById('createStaffModal');
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
        
        // Update modal title for edit mode
        const modalTitle = modal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Edit Staff';
        }
        
        // Prefill form inputs with staff data
        const form = modal.querySelector('form');
        if (form) {
            form.querySelector('#staffName').value = staff.name;
            form.querySelector('#staffEmail').value = staff.email;
            form.querySelector('#staffPhone').value = staff.phone;
            form.querySelector('#staffPassword').value = ''; // Don't prefill password
            form.querySelector('#staffGender').value = staff.gender;
        }
    }
}

function closeCreateStaffModal() {
    const modal = document.getElementById('createStaffModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
}

function handleCreateStaff(e) {
    e.preventDefault();
    
    // Read form values
    const formData = new FormData(e.target);
    const staffData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        gender: formData.get('gender')
    };
    
    // Get JWT token
    const token = localStorage.getItem('jwtToken');
    
    // Send POST request to /api/admin/staff
    fetch('/api/admin/staff', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(staffData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Create staff response:', data);
        
        if (data.success) {
            // Close modal
            closeCreateStaffModal();
            
            // Clear form
            e.target.reset();
            
            // Reload staff list
            loadStaff();
        }
    })
    .catch(error => {
        console.error('Error creating staff:', error);
    });
}

function loadStaff() {
    const token = localStorage.getItem('jwtToken');
    
    fetch('/api/admin/staff', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.staff) {
            renderStaffTable(data.staff);
        }
    })
    .catch(error => {
        console.error('Error fetching staff:', error);
    });
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
                <button class="btn btn-sm btn-primary" onclick="openEditStaffModal(${JSON.stringify(member).replace(/"/g, '&quot;')})">Edit</button>
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
