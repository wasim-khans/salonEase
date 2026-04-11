let currentEditServiceId = null;
let currentDeleteServiceId = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth('admin')) return;
    loadServices();
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
                    <td>
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
