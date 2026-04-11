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
                        <button class="btn-outline" onclick="openEditStaffModal(${member.id}, '${escapeHtml(member.name)}', '${escapeHtml(member.email)}', '${escapeHtml(member.phone)}', '${escapeHtml(member.gender)}')">Edit</button>
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

// Add modal

function openAddStaffModal() {
    currentEditStaffId = null;
    document.getElementById('staff-modal-title').textContent = 'Add Staff Member';
    document.getElementById('staff-form').reset();
    document.getElementById('staff-password').required = true;
    openModal('staff-modal');
}

// Edit modal

function openEditStaffModal(id, name, email, phone, gender) {
    currentEditStaffId = id;
    document.getElementById('staff-modal-title').textContent = 'Edit Staff Member';
    document.getElementById('staff-name').value = name;
    document.getElementById('staff-email').value = email;
    document.getElementById('staff-phone').value = phone;
    document.getElementById('staff-gender').value = gender;
    document.getElementById('staff-password').value = '';
    document.getElementById('staff-password').required = false;
    openModal('staff-modal');
}
