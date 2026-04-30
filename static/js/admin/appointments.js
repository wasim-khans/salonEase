let allAppointments = [];
let currentConfirmId = null;
let currentCancelId = null;
let currentCompleteId = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth('admin')) return;

    loadAppointments();
    setupFilters();
    setupConfirmForm();
    setupCancelForm();
    setupCompleteForm();
});

// ── Load appointments ──

async function loadAppointments() {
    const container = document.getElementById('appointments-container');

    try {
        const data = await apiGet('/api/admin/appointments');

        if (data.success) {
            allAppointments = data.appointments;
            updateFilterCounts();
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

function updateFilterCounts() {
    const counts = { all: allAppointments.length };
    allAppointments.forEach(a => {
        counts[a.status] = (counts[a.status] || 0) + 1;
    });
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const status = btn.dataset.status;
        const label = btn.textContent.replace(/\s*\(\d+\)$/, '');
        const count = counts[status] || 0;
        btn.textContent = `${label} (${count})`;
    });
}

function sortByDateDesc(list) {
    return list.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
}

// ── Display appointment cards ──

function apptRef(id) {
    return id ? '#' + id.slice(-6).toUpperCase() : '';
}

function displayAppointments(appointments) {
    appointments = sortByDateDesc(appointments);
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

        card.querySelector('.appt-card-ref').textContent = apptRef(appt.id);
        card.querySelector('.appt-card-customer').textContent = appt.customer_name || 'Unknown';
        card.querySelector('.appt-card-phone').textContent = appt.customer_phone || '';
        card.querySelector('[data-field="services"]').textContent = serviceNames;

        const badge = card.querySelector('.badge');
        badge.textContent = (appt.status || 'unknown').replace('_', ' ');
        const badgeClass = getBadgeClass(appt.status);
        if (badgeClass) badge.classList.add(badgeClass);

        card.querySelector('[data-field="date"]').textContent = date;
        card.querySelector('[data-field="time"]').textContent = appt.preferred_time || 'TBC';
        card.querySelector('[data-field="cost"]').textContent = `£${parseFloat(appt.estimated_total || 0).toFixed(2)}`;

        if (appt.status) card.querySelector('.appointment-card').classList.add(`status-${appt.status}`);

        // Action buttons per status
        const footer = card.querySelector('.appt-card-footer');
        appendActionButtons(footer, appt);
        // Open appointment detail modal when card is clicked
        const cardEl = card.querySelector('.appointment-card');
        cardEl.style.cursor = 'pointer';
        cardEl.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            openDetailModal(appt);
        });

        container.appendChild(card);
    });
}

function appendActionButtons(container, appt) {
    if (appt.status === 'in_review') {
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'btn-action';
        confirmBtn.textContent = 'Confirm';
        confirmBtn.addEventListener('click', () => { closeModal('detail-modal'); openConfirmModal(appt); });
        container.appendChild(confirmBtn);

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-action btn-action-danger';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => { closeModal('detail-modal'); openCancelModal(appt.id); });
        container.appendChild(cancelBtn);
    }

    if (appt.status === 'confirmed') {
        const completeBtn = document.createElement('button');
        completeBtn.className = 'btn-action';
        completeBtn.textContent = 'Complete';
        completeBtn.addEventListener('click', () => { closeModal('detail-modal'); openCompleteModal(appt); });
        container.appendChild(completeBtn);

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-action btn-action-danger';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => { closeModal('detail-modal'); openCancelModal(appt.id); });
        container.appendChild(cancelBtn);
    }
}
// open detail modal for specific appointment 
function openDetailModal(appt) {
    const ref = apptRef(appt.id);
    const serviceNames = appt.services ? appt.services.map(s => s.service_name).join(', ') : 'N/A';
    const date = new Date(appt.appointment_date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
    const statusLabel = (appt.status || 'unknown').replace('_', ' ');
    const badgeClass = getBadgeClass(appt.status);

    document.getElementById('detail-modal-title').textContent = `Appointment ${ref}`;

    const info = document.getElementById('detail-appt-info');
    info.innerHTML = `
        <div class="detail-status-row">
            <span class="badge ${badgeClass}">${escapeHtml(statusLabel)}</span>
        </div>
        <div class="detail-grid">
            <div class="detail-section">
                <h4>Customer</h4>
                <div class="detail-row"><span class="detail-label">Name</span><span>${escapeHtml(appt.customer_name || 'Unknown')}</span></div>
                <div class="detail-row"><span class="detail-label">Phone</span><span>${escapeHtml(appt.customer_phone || 'N/A')}</span></div>
                <div class="detail-row"><span class="detail-label">Email</span><span>${escapeHtml(appt.customer_email || 'N/A')}</span></div>
            </div>
            <div class="detail-section">
                <h4>Appointment</h4>
                <div class="detail-row"><span class="detail-label">Services</span><span>${escapeHtml(serviceNames)}</span></div>
                <div class="detail-row"><span class="detail-label">Date</span><span>${date}</span></div>
                <div class="detail-row"><span class="detail-label">Preferred Time</span><span>${escapeHtml(appt.preferred_time || 'TBC')}</span></div>
                <div class="detail-row"><span class="detail-label">Staff Preference</span><span>${escapeHtml(appt.preferred_staff_gender || 'any')}</span></div>
                <div class="detail-row"><span class="detail-label">Estimated Cost</span><span>£${parseFloat(appt.estimated_total || 0).toFixed(2)}</span></div>
                ${appt.staff_name ? `<div class="detail-row"><span class="detail-label">Served By</span><span>${escapeHtml(appt.staff_name)}</span></div>` : ''}
            </div>
        </div>
        ${appt.status === 'cancelled' ? `
        <div class="detail-section detail-cancelled">
            <h4>Cancellation Info</h4>
            <div class="detail-row"><span class="detail-label">Cancelled By</span><span>${escapeHtml(appt.cancelled_by || 'N/A')}</span></div>
            <div class="detail-row"><span class="detail-label">Reason</span><span>${escapeHtml(appt.cancellation_reason || 'No reason provided')}</span></div>
        </div>` : ''}
        ${appt.admin_notes ? `
        <div class="detail-section">
            <h4>Admin Notes</h4>
            <p style="margin:0;color:#555;">${escapeHtml(appt.admin_notes)}</p>
        </div>` : ''}
    `;

    const actions = document.getElementById('detail-appt-actions');
    actions.innerHTML = '';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-outline';
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', () => closeModal('detail-modal'));
    actions.appendChild(closeBtn);

    appendActionButtons(actions, appt);

    openModal('detail-modal');
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
    const date = new Date(appt.appointment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const time = appt.preferred_time ? appt.preferred_time.substring(0, 5) : 'TBC';
    details.innerHTML = `
        <div class="confirm-customer-header">
            <span class="confirm-customer-name">${escapeHtml(appt.customer_name || 'Unknown')}</span>
            <span class="confirm-customer-phone">${escapeHtml(appt.customer_phone || '')}</span>
        </div>
        <div class="confirm-details-grid">
            <div class="confirm-detail-item">
                <span class="confirm-detail-label">Services</span>
                <span class="confirm-detail-value">${escapeHtml(serviceNames)}</span>
            </div>
            <div class="confirm-detail-item">
                <span class="confirm-detail-label">Date</span>
                <span class="confirm-detail-value">${date}</span>
            </div>
            <div class="confirm-detail-item">
                <span class="confirm-detail-label">Preferred Time</span>
                <span class="confirm-detail-value">${time}</span>
            </div>
            <div class="confirm-detail-item">
                <span class="confirm-detail-label">Staff Preference</span>
                <span class="confirm-detail-value">${escapeHtml(appt.preferred_staff_gender || 'any')}</span>
            </div>
            <div class="confirm-detail-item">
                <span class="confirm-detail-label">Estimated Cost</span>
                <span class="confirm-detail-value confirm-cost">£${parseFloat(appt.estimated_total || 0).toFixed(2)}</span>
            </div>
        </div>
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

        try {
            const data = await apiPut(`/api/admin/appointments/${currentConfirmId}/confirm`, { staff_id, start_time });

            if (data.success) {
                closeModal('confirm-modal');
                showSuccess('Appointment confirmed successfully.');
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

        try {
            const data = await apiPut(`/api/admin/appointments/${currentCancelId}/cancel`, { cancellation_reason: reason });

            if (data.success) {
                closeModal('cancel-modal');
                showSuccess('Appointment cancelled successfully.');
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

    // Show appointment details with consistent styling
    const details = document.getElementById('complete-appt-details');
    const serviceNames = appt.services ? appt.services.map(s => s.service_name).join(', ') : 'N/A';
    const date = new Date(appt.appointment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const time = appt.preferred_time ? appt.preferred_time.substring(0, 5) : 'TBC';
    
    details.innerHTML = `
        <div class="modal-appt-info">
            <strong>${escapeHtml(appt.customer_name || 'Unknown')}</strong>
            <span>${escapeHtml(appt.customer_phone || '')}</span>
        </div>
        <div class="confirm-details-grid">
            <div class="confirm-detail-item">
                <span class="confirm-detail-label">Services</span>
                <span class="confirm-detail-value">${escapeHtml(serviceNames)}</span>
            </div>
            <div class="confirm-detail-item">
                <span class="confirm-detail-label">Date</span>
                <span class="confirm-detail-value">${date}</span>
            </div>
            <div class="confirm-detail-item">
                <span class="confirm-detail-label">Time</span>
                <span class="confirm-detail-value">${time}</span>
            </div>
            <div class="confirm-detail-item">
                <span class="confirm-detail-label">Estimated Cost</span>
                <span class="confirm-detail-value confirm-cost">£${parseFloat(appt.estimated_total || 0).toFixed(2)}</span>
            </div>
        </div>
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

        try {
            const data = await apiPut(`/api/admin/appointments/${currentCompleteId}/complete`, { actual_price, completed_by, admin_notes: admin_notes || null });

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

    try {
        const data = await apiGet('/api/admin/staff');

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
