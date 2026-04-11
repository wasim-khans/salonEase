let currentEditStaffId = null;
let currentDeleteStaffId = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth('admin')) return;

    loadStaff();
    setupStaffForm();
});

// Load staff table

async function loadStaff() {
    showTableLoading('staff-table-body', 5, 'staff');

    try {
        const data = await apiGet('/api/admin/staff');

        if (data.success && data.staff.length > 0) {
            const tbody = document.getElementById('staff-table-body');
            tbody.innerHTML = '';

            data.staff.forEach(member => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${escapeHtml(member.name)}</td>
                    <td>${escapeHtml(member.email)}</td>
                    <td>${escapeHtml(member.phone)}</td>
                    <td>${escapeHtml(member.gender)}</td>
                    <td>
                        <button class="btn-outline" onclick="openEditStaffModal(${member.id})">Edit</button>
                        <button class="btn-outline btn-action-danger" onclick="openDeleteStaffModal(${member.id}, '${escapeHtml(member.name)}')" style="border-color:#e74c3c; color:#e74c3c;">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            showTableEmpty('staff-table-body', 5, 'staff');
        }
    } catch (error) {
        console.error('Error loading staff:', error);
        showTableEmpty('staff-table-body', 5, 'staff');
        showError('Failed to load staff. Please try again.');
    }
}
