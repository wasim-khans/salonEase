// SalonEase Admin Services Management
document.addEventListener('DOMContentLoaded', function() {
    // Read JWT token from localStorage
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
        console.error('No JWT token found');
        return;
    }
    
    // Add Service button click handler
    const addServiceBtn = document.querySelector('.btn-primary');
    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', openCreateServiceModal);
    }
    
    // Cancel button click handler
    const cancelBtn = document.querySelector('.modal-footer .btn-secondary');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeCreateServiceModal);
    }
    
    // Close icon click handler
    const closeIcon = document.querySelector('.modal-header .close');
    if (closeIcon) {
        closeIcon.addEventListener('click', closeCreateServiceModal);
    }
    
    // Fetch GET /api/services
    fetch('/api/services', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        // Log API response to console
        console.log('Services API response:', data);
        
        // Render services into table body
        if (data.success && data.services) {
            renderServicesTable(data.services);
        }
    })
    .catch(error => {
        console.error('Error fetching services:', error);
    });
});

function openCreateServiceModal() {
    const modal = document.getElementById('createServiceModal');
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
    }
}

function closeCreateServiceModal() {
    const modal = document.getElementById('createServiceModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
}

function renderServicesTable(services) {
    const tableBody = document.getElementById('servicesTable');
    
    if (!tableBody) return;
    
    if (!services || services.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No services found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = services.map(service => `
        <tr>
            <td>${escapeHtml(service.name)}</td>
            <td>${escapeHtml(service.category)}</td>
            <td>£${parseFloat(service.base_price).toFixed(2)}</td>
            <td>${service.duration} min</td>
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
