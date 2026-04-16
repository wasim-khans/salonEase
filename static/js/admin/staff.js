let currentEditStaffId = null;
let currentDeleteStaffId = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth('admin')) return;

    loadStaff();
    setupStaffForm();
});

// Load staff table

async function loadStaff() {
    showTableLoading('staff-table-body', 6, 'staff');

    try {
        const data = await apiGet('/api/admin/staff');

        if (data.success && data.staff.length > 0) {
            const tbody = document.getElementById('staff-table-body');
            tbody.innerHTML = '';

            data.staff.sort((a, b) => a.name.localeCompare(b.name));

            data.staff.forEach((member, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${escapeHtml(member.name)}</td>
                    <td>${escapeHtml(member.email)}</td>
                    <td>${escapeHtml(member.phone)}</td>
                    <td>${escapeHtml(member.gender)}</td>
                    <td class="table-actions">
                        <button class="btn-action" onclick="openEditStaffModal(${member.id}, '${escapeHtml(member.name)}', '${escapeHtml(member.email)}', '${escapeHtml(member.phone)}', '${escapeHtml(member.gender)}')">Edit</button>
                        <button class="btn-action btn-action-danger" onclick="openDeleteStaffModal(${member.id}, '${escapeHtml(member.name)}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            showTableEmpty('staff-table-body', 6, 'staff');
        }
    } catch (error) {
        console.error('Error loading staff:', error);
        showTableEmpty('staff-table-body', 6, 'staff');
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

// Form handling

function setupStaffForm() {
    const form = document.getElementById('staff-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const body = {
            name: document.getElementById('staff-name').value.trim(),
            email: document.getElementById('staff-email').value.trim(),
            phone: document.getElementById('staff-phone').value.trim(),
            gender: document.getElementById('staff-gender').value
        };

        const password = document.getElementById('staff-password').value;
        if (password) {
            body.password = password;
        }

        if (!body.name || !body.email || !body.phone) {
            showError('Name, email, and phone are required.');
            return;
        }

        try {
            let data;
            if (currentEditStaffId) {
                data = await apiPut(`/api/admin/staff/${currentEditStaffId}`, body);
            } else {
                if (!password) {
                    showError('Password is required for new staff.');
                    return;
                }
                data = await apiPost('/api/admin/staff', body);
            }

            if (data.success) {
                showSuccess(currentEditStaffId ? 'Staff member updated.' : 'Staff member created.');
                closeModal('staff-modal');
                loadStaff();
            } else {
                showError(data.message || 'Failed to save staff member.');
            }
        } catch (error) {
            console.error('Staff save error:', error);
            showError('An error occurred while saving.');
        }
    });
}

// Delete modal

function openDeleteStaffModal(id) {
    currentDeleteStaffId = id;
    openModal('delete-staff-modal');
}

async function confirmDeleteStaff() {
    if (!currentDeleteStaffId) return;

    try {
        const data = await apiDelete(`/api/admin/staff/${currentDeleteStaffId}`);

        if (data.success) {
            showSuccess('Staff member deleted.');
            closeModal('delete-staff-modal');
            loadStaff();
        } else {
            showError(data.message || 'Failed to delete staff member.');
        }
    } catch (error) {
        console.error('Staff delete error:', error);
        showError('An error occurred while deleting.');
    }
}
