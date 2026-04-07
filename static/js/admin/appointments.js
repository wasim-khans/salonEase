let allAppointments = [];
let currentConfirmId = null;
let currentCancelId = null;
let currentCompleteId = null;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user || user.type !== 'admin') {
        showError('Access denied. Admin login required.');
        window.location.href = '/auth/login';
        return;
    }

    loadAppointments();
    setupFilters();
    setupConfirmForm();
    setupCancelForm();
    setupCompleteForm();
});

// ── Modal helpers ──

function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// ── Load appointments ──

async function loadAppointments() {
    const container = document.getElementById('appointments-container');
    const token = localStorage.getItem('jwtToken');

    try {
        const response = await fetch('/api/admin/appointments', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            allAppointments = data.appointments;
            const activeFilter = document.querySelector('.filter-btn.active');
            const status = activeFilter ? activeFilter.dataset.status : 'all';
            if (status === 'all') {
                displayAppointments(allAppointments);
            } else {
                displayAppointments(allAppointments.filter(a => a.status === status));
            }
        } else {
            container.innerHTML = '<p>Failed to load appointments.</p>';
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
        container.innerHTML = '<p>Failed to load appointments. Please try again later.</p>';
    }
}

// ── Filters ──

function setupFilters() {
    const filterContainer = document.getElementById('status-filters');
    if (!filterContainer) return;

    filterContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            filterContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            const status = e.target.dataset.status;
            if (status === 'all') {
                displayAppointments(allAppointments);
            } else {
                displayAppointments(allAppointments.filter(a => a.status === status));
            }
        }
    });
}

// ── Display appointment cards ──

function displayAppointments(appointments) {
    const container = document.getElementById('appointments-container');

    if (!appointments || appointments.length === 0) {
        container.innerHTML = '<p>No appointments found.</p>';
        return;
    }

    container.innerHTML = '';

    appointments.forEach(appt => {
        const template = document.getElementById('appointment-card-template');
        const card = template.content.cloneNode(true);

        const serviceNames = appt.services ? appt.services.map(s => s.service_name).join(', ') : 'N/A';
        const date = new Date(appt.appointment_date).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });

        card.querySelector('.appt-card-services').textContent = `${appt.customer_name || 'Unknown'} — ${serviceNames}`;

        const badge = card.querySelector('.badge');
        badge.textContent = appt.status.replace('_', ' ');
        badge.classList.add(getBadgeClass(appt.status));

        card.querySelector('[data-field="date"]').textContent = date;
        card.querySelector('[data-field="time"]').textContent = appt.preferred_time || 'TBC';
        card.querySelector('[data-field="cost"]').textContent = `£${parseFloat(appt.estimated_total || 0).toFixed(2)}`;

        card.querySelector('.appointment-card').classList.add(`status-${appt.status}`);

        // Action buttons per status (from UI State Rules table)
        const footer = card.querySelector('.appt-card-footer');

        // in_review → Confirm, Cancel
        if (appt.status === 'in_review') {
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'btn-action';
            confirmBtn.textContent = 'Confirm';
            confirmBtn.addEventListener('click', () => openConfirmModal(appt));
            footer.appendChild(confirmBtn);

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn-action btn-action-danger';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.addEventListener('click', () => openCancelModal(appt.id));
            footer.appendChild(cancelBtn);
        }

        // confirmed → Complete, Cancel
        if (appt.status === 'confirmed') {
            const completeBtn = document.createElement('button');
            completeBtn.className = 'btn-action';
            completeBtn.textContent = 'Complete';
            completeBtn.addEventListener('click', () => openCompleteModal(appt));
            footer.appendChild(completeBtn);

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn-action btn-action-danger';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.addEventListener('click', () => openCancelModal(appt.id));
            footer.appendChild(cancelBtn);
        }

        container.appendChild(card);
    });
}

function getBadgeClass(status) {
    const map = {
        'in_review': 'badge-review',
        'confirmed': 'badge-confirmed',
        'completed': 'badge-completed',
        'cancelled': 'badge-cancelled'
    };
    return map[status] || '';
}

// ── Confirm Modal ──

async function openConfirmModal(appt) {
    currentConfirmId = appt.id;

    // Show appointment details
    const details = document.getElementById('confirm-appt-details');
    const serviceNames = appt.services ? appt.services.map(s => s.service_name).join(', ') : 'N/A';
    details.innerHTML = `
        <p><strong>Customer:</strong> ${appt.customer_name || 'Unknown'}</p>
        <p><strong>Services:</strong> ${serviceNames}</p>
        <p><strong>Date:</strong> ${new Date(appt.appointment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        <p><strong>Preferred Time:</strong> ${appt.preferred_time || 'TBC'}</p>
        <p><strong>Staff Preference:</strong> ${appt.preferred_staff_gender || 'any'}</p>
        <p><strong>Estimated Cost:</strong> £${parseFloat(appt.estimated_total || 0).toFixed(2)}</p>
    `;

    // Pre-select the preferred time in start_time dropdown
    const startTimeSelect = document.getElementById('confirm-start-time');
    const timeVal = appt.preferred_time ? appt.preferred_time.substring(0, 5) : '';
    startTimeSelect.value = timeVal;

    // Load staff into dropdown
    await loadStaffDropdown('confirm-staff', appt.preferred_staff_gender);

    openModal('confirm-modal');
}

function setupConfirmForm() {
    const form = document.getElementById('confirm-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const staff_id = document.getElementById('confirm-staff').value;
        const start_time = document.getElementById('confirm-start-time').value;

        if (!staff_id) {
            showError('Please assign a staff member.');
            return;
        }

        if (!start_time) {
            showError('Please set a start time.');
            return;
        }

        const token = localStorage.getItem('jwtToken');

        try {
            const response = await fetch(`/api/admin/appointments/${currentConfirmId}/confirm`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ staff_id, start_time })
            });

            const data = await response.json();

            if (data.success) {
                closeModal('confirm-modal');
                loadAppointments();
            } else {
                showError(data.message || 'Failed to confirm appointment.');
            }
        } catch (error) {
            console.error('Confirm error:', error);
            showError('An error occurred while confirming.');
        }
    });
}

// ── Cancel Modal ──

function openCancelModal(appointmentId) {
    currentCancelId = appointmentId;
    document.getElementById('cancel-reason').value = '';
    openModal('cancel-modal');
}

function setupCancelForm() {
    const form = document.getElementById('cancel-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const reason = document.getElementById('cancel-reason').value.trim();
        if (!reason) {
            showError('Cancellation reason is required.');
            return;
        }

        const token = localStorage.getItem('jwtToken');

        try {
            const response = await fetch(`/api/admin/appointments/${currentCancelId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ cancellation_reason: reason })
            });

            const data = await response.json();

            if (data.success) {
                closeModal('cancel-modal');
                loadAppointments();
            } else {
                showError(data.message || 'Failed to cancel appointment.');
            }
        } catch (error) {
            console.error('Cancel error:', error);
            showError('An error occurred while cancelling.');
        }
    });
}

// ── Complete Modal ──

async function openCompleteModal(appt) {
    currentCompleteId = appt.id;

    // Show appointment details
    const details = document.getElementById('complete-appt-details');
    const serviceNames = appt.services ? appt.services.map(s => s.service_name).join(', ') : 'N/A';
    details.innerHTML = `
        <p><strong>Customer:</strong> ${appt.customer_name || 'Unknown'}</p>
        <p><strong>Services:</strong> ${serviceNames}</p>
        <p><strong>Estimated Cost:</strong> £${parseFloat(appt.estimated_total || 0).toFixed(2)}</p>
    `;

    // Pre-fill actual price with estimated total
    document.getElementById('complete-price').value = parseFloat(appt.estimated_total || 0).toFixed(2);
    document.getElementById('complete-notes').value = '';

    // Load staff into dropdown
    await loadStaffDropdown('complete-staff');

    // If staff was already assigned, pre-select them
    if (appt.staff_id) {
        document.getElementById('complete-staff').value = appt.staff_id;
    }

    openModal('complete-modal');
}

function setupCompleteForm() {
    const form = document.getElementById('complete-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const actual_price = parseFloat(document.getElementById('complete-price').value);
        const completed_by = document.getElementById('complete-staff').value;
        const admin_notes = document.getElementById('complete-notes').value.trim();

        if (!actual_price || actual_price <= 0) {
            showError('Please enter the actual price charged.');
            return;
        }

        if (!completed_by) {
            showError('Please select the staff member who provided the service.');
            return;
        }

        const token = localStorage.getItem('jwtToken');

        try {
            const response = await fetch(`/api/admin/appointments/${currentCompleteId}/complete`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ actual_price, completed_by, admin_notes: admin_notes || null })
            });

            const data = await response.json();

            if (data.success) {
                closeModal('complete-modal');
                loadAppointments();
            } else {
                showError(data.message || 'Failed to complete appointment.');
            }
        } catch (error) {
            console.error('Complete error:', error);
            showError('An error occurred while completing.');
        }
    });
}

// ── Staff dropdown loader ──

async function loadStaffDropdown(selectId, preferredGender) {
    const select = document.getElementById(selectId);
    const token = localStorage.getItem('jwtToken');

    try {
        const response = await fetch('/api/admin/staff', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success && data.staff.length > 0) {
            select.innerHTML = '<option value="">Select a staff member...</option>';

            data.staff.forEach(member => {
                const option = document.createElement('option');
                option.value = member.id;
                option.textContent = `${member.name} (${member.gender})`;
                select.appendChild(option);
            });
        } else {
            select.innerHTML = '<option value="">No staff available</option>';
        }
    } catch (error) {
        console.error('Error loading staff:', error);
        select.innerHTML = '<option value="">Failed to load staff</option>';
    }
}
