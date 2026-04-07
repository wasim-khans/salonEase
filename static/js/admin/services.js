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
    
    // Create Service form submit handler
    const createForm = document.querySelector('.modal-body form');
    if (createForm) {
        createForm.addEventListener('submit', handleCreateService);
    }
    
    // Fetch GET /api/services
    showLoadingState('servicesTable');
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
        hideLoadingState('servicesTable');
    });
});

// Global variable to store current editing service id
let currentEditServiceId = null;

function openCreateServiceModal() {
    currentEditServiceId = null; // Reset for create mode
    const modal = document.getElementById('createServiceModal');
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
        
        // Update modal title for create mode
        const modalTitle = modal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Create New Service';
        }
        
        // Clear form for create mode
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

function openEditServiceModal(service) {
    currentEditServiceId = service.id; // Store service id for later use
    const modal = document.getElementById('createServiceModal');
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
        
        // Update modal title for edit mode
        const modalTitle = modal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Edit Service';
        }
        
        // Prefill form inputs with service data
        const form = modal.querySelector('form');
        if (form) {
            form.querySelector('#serviceName').value = service.name;
            form.querySelector('#serviceCategory').value = service.category;
            form.querySelector('#servicePrice').value = service.base_price;
            form.querySelector('#serviceDuration').value = service.duration;
        }
    }
}

function closeCreateServiceModal() {
    const modal = document.getElementById('createServiceModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
    }
}

function handleCreateService(e) {
    e.preventDefault();
    
    // Read form values
    const formData = new FormData(e.target);
    const serviceData = {
        name: formData.get('name'),
        category: formData.get('category'),
        base_price: parseFloat(formData.get('base_price')),
        duration: parseInt(formData.get('duration'))
    };
    
    // Get JWT token
    const token = localStorage.getItem('jwtToken');
    
    // Check if we're in edit mode or create mode
    if (currentEditServiceId) {
        // Edit mode - send PUT request
        fetch(`/api/services/${currentEditServiceId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(serviceData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Update service response:', data);
            
            if (data.success) {
                // Close modal
                closeCreateServiceModal();
                
                // Clear form
                e.target.reset();
                
                // Reload services list
                loadServices();
            }
        })
        .catch(error => {
            console.error('Error updating service:', error);
        });
    } else {
        // Create mode - send POST request
        fetch('/api/services', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(serviceData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Create service response:', data);
            
            if (data.success) {
                // Close modal
                closeCreateServiceModal();
                
                // Clear form
                e.target.reset();
                
                // Reload services list
                loadServices();
            }
        })
        .catch(error => {
            console.error('Error creating service:', error);
        });
    }
}

function loadServices() {
    const token = localStorage.getItem('jwtToken');
    
    fetch('/api/services', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.services) {
            renderServicesTable(data.services);
        }
    })
    .catch(error => {
        console.error('Error fetching services:', error);
    });
}

function renderServicesTable(services) {
    const tableBody = document.getElementById('servicesTable');
    
    if (!tableBody) return;
    
    if (!services || services.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No services found</td></tr>';
        hideLoadingState('servicesTable');
        return;
    }
    
    tableBody.innerHTML = services.map(service => `
        <tr>
            <td>${escapeHtml(service.name)}</td>
            <td>${escapeHtml(service.category)}</td>
            <td>£${parseFloat(service.base_price).toFixed(2)}</td>
            <td>${service.duration} min</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="openEditServiceModal(${JSON.stringify(service).replace(/"/g, '&quot;')})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteService('${service.id}', '${escapeHtml(service.name)}')">Delete</button>
            </td>
        </tr>
    `).join('');
    
    hideLoadingState('servicesTable');
}

function deleteService(serviceId, serviceName) {
    // Show confirmation prompt
    const confirmed = confirm(`Are you sure you want to delete "${serviceName}"? This action cannot be undone.`);
    
    if (!confirmed) {
        return; // User cancelled the deletion
    }
    
    // Get JWT token
    const token = localStorage.getItem('jwtToken');
    
    // Send DELETE request to /api/services/:id
    fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Delete service response:', data);
        
        if (data.success) {
            // Reload services list
            loadServices();
        }
    })
    .catch(error => {
        console.error('Error deleting service:', error);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoadingState(tableId) {
    const tableBody = document.getElementById(tableId);
    if (!tableBody) return;
    
    tableBody.innerHTML = `
        <tr>
            <td colspan="4" style="text-align: center; padding: 20px;">
                <div style="display: inline-block; padding: 8px 16px; background: #f8f9fa; border-radius: 4px; color: #6c757d;">
                    <div style="display: inline-block; width: 20px; height: 20px; border: 2px solid #ffffff; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;">
                        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 6px solid #ffffff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    </div>
                    Loading services...
                </div>
            </td>
        </tr>
    `;
}

function hideLoadingState(tableId) {
    const tableBody = document.getElementById(tableId);
    if (!tableBody) return;
    
    // Check if loading state exists and remove it
    const loadingRow = tableBody.querySelector('.loading-state');
    if (loadingRow) {
        tableBody.removeChild(loadingRow);
    }
}
