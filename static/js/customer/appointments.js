let currentEditId = null;
let currentCancelId = null;
let currentCancelAppt = null;
let editModalChangeListener = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth('customer')) return;
    loadAppointments();
    setupEditForm();
    setupCancelForm();
});

// ── Load appointments ──

async function loadAppointments() {
    try {
        const data = await apiGet('/api/customer/appointments');
        if (data.success) {
            renderAppointments(data.appointments);
        } else {
            showError('Failed to load appointments.');
            renderAppointments([]);
        }
    } catch (err) {
        console.error('Error loading appointments:', err);
        showError('Failed to load appointments.');
        renderAppointments([]);
    }
}

function renderAppointments(appointments) {
    const upcoming = appointments.filter(a => a.status === 'in_review' || a.status === 'confirmed');
    const past     = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

    document.getElementById('upcoming-container').innerHTML =
        upcoming.length ? buildTable(upcoming, true) : '<p class="empty-state">No upcoming appointments.</p>';

    document.getElementById('past-container').innerHTML =
        past.length ? buildTable(past, false) : '<p class="empty-state">No past appointments.</p>';

    // Re-attach event listeners after render
    document.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const appt = appointments.find(a => a.id == btn.dataset.id);
            if (appt) openEditModal(appt);
        });
    });
    document.querySelectorAll('[data-action="cancel"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const appt = appointments.find(a => a.id == btn.dataset.id);
            openCancelModal(btn.dataset.id, appt);
        });
    });
}

function buildTable(appointments, showActions) {
    const actionCol = showActions ? '<th>Action</th>' : '';
    const rows = appointments.map(appt => {
        const name = appt.services.map(s => escapeHtml(s.service_name)).join(', ');
        const date = new Date(appt.appointment_date).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
        const time  = appt.preferred_time ? appt.preferred_time.substring(0, 5) : 'TBC';
        const cost  = `£${parseFloat(appt.estimated_total || 0).toFixed(2)}`;
        const badge = `<span class="badge ${getBadgeClass(appt.status)}">${appt.status.replace('_', ' ')}</span>`;

        let actions = '';
        if (showActions) {
            if (appt.status === 'in_review') {
                actions += `<button class="btn-action" data-action="edit" data-id="${appt.id}">Edit</button> `;
            }
            if (appt.status === 'in_review' || appt.status === 'confirmed') {
                actions += `<button class="btn-action btn-action-danger" data-action="cancel" data-id="${appt.id}">Cancel</button>`;
            }
        }

        return `
            <tr>
                <td class="appt-service">${name}</td>
                <td>${date}</td>
                <td>${time}</td>
                <td>${cost}</td>
                <td>${badge}</td>
                ${showActions ? `<td class="appt-actions">${actions}</td>` : ''}
            </tr>`;
    }).join('');

    return `
        <table class="appointments-table">
            <thead>
                <tr>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Cost</th>
                    <th>Status</th>
                    ${actionCol}
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
}

function getBadgeClass(status) {
    return { in_review: 'badge-review', confirmed: 'badge-confirmed', completed: 'badge-completed', cancelled: 'badge-cancelled' }[status] || '';
}

// ── Edit Modal ──

async function openEditModal(appt) {
    currentEditId = appt.id;
    const container = document.getElementById('edit-services-checkboxes');

    try {
        const data = await apiGet('/api/services');
        if (data.success && data.services.length > 0) {
            renderEditCheckboxes(container, data.services, appt);
        } else {
            showError('Failed to load services.');
            container.innerHTML = '<p class="empty-state">No services available.</p>';
        }
    } catch (err) {
        console.error('Error loading services for edit:', err);
        showError('Failed to load services.');
        container.innerHTML = '<p class="empty-state">No services available.</p>';
    }

    const dateStr = new Date(appt.appointment_date).toISOString().split('T')[0];
    document.getElementById('edit-date').value = dateStr;
    document.getElementById('edit-time').value = appt.preferred_time ? appt.preferred_time.substring(0, 5) : '';
    const genderRadio = document.querySelector(`input[name="edit_staff_gender"][value="${appt.preferred_staff_gender || 'any'}"]`);
    if (genderRadio) genderRadio.checked = true;

    openModal('edit-modal');
}

function renderEditCheckboxes(container, services, appt) {
    const selectedIds = appt.services.map(s => s.service_id);
    if (editModalChangeListener) container.removeEventListener('change', editModalChangeListener);

    container.innerHTML = services.map(s => `
        <label class="checkbox-label">
            <input type="checkbox" name="edit_services" value="${s.id}" data-price="${s.base_price}" ${selectedIds.includes(s.id) ? 'checked' : ''}>
            <span>${escapeHtml(s.name)} — £${parseFloat(s.base_price).toFixed(2)}</span>
        </label>`).join('');

    editModalChangeListener = updateEditTotal;
    container.addEventListener('change', editModalChangeListener);
    updateEditTotal();
}

function updateEditTotal() {
    const checked = document.querySelectorAll('input[name="edit_services"]:checked');
    let total = 0;
    checked.forEach(cb => { total += parseFloat(cb.dataset.price); });
    const el = document.getElementById('edit-estimated-total');
    el.textContent = checked.length > 0 ? `Estimated total: £${total.toFixed(2)}` : '';
}

function setupEditForm() {
    const form = document.getElementById('edit-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const checked = document.querySelectorAll('input[name="edit_services"]:checked');
        if (checked.length === 0) { showError('Please select at least one service.'); return; }

        const body = {
            appointment_date: document.getElementById('edit-date').value,
            preferred_time:   document.getElementById('edit-time').value,
            preferred_staff_gender: document.querySelector('input[name="edit_staff_gender"]:checked')?.value || 'any',
            services: Array.from(checked).map(cb => ({ service_id: cb.value, price: parseFloat(cb.dataset.price) }))
        };

        try {
            const data = await apiPut(`/api/customer/appointments/${currentEditId}`, body);
            if (data.success) { closeModal('edit-modal'); loadAppointments(); }
            else showError(data.message || 'Failed to update appointment.');
        } catch (_) { showError('An error occurred while updating.'); }
    });
}

// ── Cancel Modal ──

function showCancelledView() {
    if (currentCancelAppt) {
        const name = currentCancelAppt.services.map(s => s.service_name).join(', ');
        const date = new Date(currentCancelAppt.appointment_date).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        const time = currentCancelAppt.preferred_time ? currentCancelAppt.preferred_time.substring(0, 5) : '';
        document.getElementById('cancelled-appt-name').textContent = name;
        document.getElementById('cancelled-appt-datetime').textContent = `${date} · ${time}`;
    }
    document.getElementById('appointments-view').style.display = 'none';
    document.getElementById('cancelled-view').style.display = 'block';
}

function openCancelModal(appointmentId, appt) {
    currentCancelId = appointmentId;
    currentCancelAppt = appt;

    if (appt) {
        const name = appt.services.map(s => s.service_name).join(', ');
        const date = new Date(appt.appointment_date).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        const time = appt.preferred_time ? appt.preferred_time.substring(0, 5) : '';
        document.getElementById('cancel-appt-name').textContent = name;
        document.getElementById('cancel-appt-datetime').textContent = `${date} · ${time}`;
    }

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
            const data = await apiPut(`/api/customer/appointments/${currentCancelId}/cancel`, { cancellation_reason: reason });
            if (data.success) { closeModal('cancel-modal'); showCancelledView(); }
            else showError(data.message || 'Failed to cancel appointment.');
        } catch (_) { showError('An error occurred while cancelling.'); }
    });
}
