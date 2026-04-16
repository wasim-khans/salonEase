let currentEditServiceId = null;
let currentDeleteServiceId = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth('admin')) return;
    loadServices();
    setupServiceForm();
});

// Load services table
async function loadServices() {
    showTableLoading('services-table-body', 5, 'services');
    try {
        const data = await apiGet('/api/services');
        if (data.success && data.services.length > 0) {
            const tbody = document.getElementById('services-table-body');
            tbody.innerHTML = '';

            data.services.forEach(svc => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${escapeHtml(svc.name)}</td>
                    <td>${escapeHtml(svc.category)}</td>
                    <td>&pound;${parseFloat(svc.base_price).toFixed(2)}</td>
                    <td>${escapeHtml(String(svc.duration))} min</td>
                    <td class="table-actions">
                        <button class="btn-action" onclick="openEditServiceModal('${svc.id}')">Edit</button>
                        <button class="btn-action btn-action-danger" onclick="openDeleteServiceModal('${svc.id}')">Delete</button>
                    </td>
                `;
                tr.dataset.id = svc.id;
                tr.dataset.name = svc.name;
                tr.dataset.category = svc.category;
                tr.dataset.price = svc.base_price;
                tr.dataset.duration = svc.duration;
                tbody.appendChild(tr);
            });
        } else {
            showTableEmpty('services-table-body', 5, 'services');
        }
    } catch (error) {
        console.error('Error loading services:', error);
        showTableEmpty('services-table-body', 5, 'services (error loading)');
    }
}

// Add modal
function openAddServiceModal() {
    currentEditServiceId = null;
    document.getElementById('service-modal-title').textContent = 'Add Service';
    document.getElementById('service-form').reset();
    openModal('service-modal');
}

// Edit modal
function openEditServiceModal(id) {
    currentEditServiceId = id;
    document.getElementById('service-modal-title').textContent = 'Edit Service';
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        document.getElementById('service-name').value = row.dataset.name;
        document.getElementById('service-category').value = row.dataset.category;
        document.getElementById('service-price').value = parseFloat(row.dataset.price).toFixed(2);
        document.getElementById('service-duration').value = row.dataset.duration;
    }
    openModal('service-modal');
}

// Form submit (create or update)
function setupServiceForm() {
    const form = document.getElementById('service-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const body = {
            name: document.getElementById('service-name').value.trim(),
            category: document.getElementById('service-category').value,
            base_price: parseFloat(document.getElementById('service-price').value),
            duration: parseInt(document.getElementById('service-duration').value, 10)
        };

        if (!body.name) {
            showError('Service name is required.');
            return;
        }

        if (!body.base_price || body.base_price <= 0) {
            showError('Please enter a valid price.');
            return;
        }

        if (!body.duration || body.duration <= 0) {
            showError('Please enter a valid duration.');
            return;
        }

        try {
            let data;
            if (currentEditServiceId) {
                data = await apiPut(`/api/admin/services/${currentEditServiceId}`, body);
            } else {
                data = await apiPost('/api/admin/services', body);
            }

            if (data.success) {
                showSuccess(currentEditServiceId ? 'Service updated.' : 'Service created.');
                closeModal('service-modal');
                loadServices();
            } else {
                showError(data.message || 'Failed to save service.');
            }
        } catch (error) {
            console.error('Service save error:', error);
            showError('An error occurred while saving.');
        }
    });
}

// Delete
function openDeleteServiceModal(id) {
    currentDeleteServiceId = id;
    openModal('delete-service-modal');
}

async function confirmDeleteService() {
    if (!currentDeleteServiceId) return;
    try {
        const data = await apiDelete(`/api/admin/services/${currentDeleteServiceId}`);
        if (data.success) {
            showSuccess('Service deleted.');
            closeModal('delete-service-modal');
            loadServices();
        } else {
            showError(data.message || 'Failed to delete service.');
        }
    } catch (error) {
        console.error('Service delete error:', error);
        showError('An error occurred while deleting.');
    }
}
