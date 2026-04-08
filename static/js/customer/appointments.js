let currentEditId = null;
let currentCancelId = null;

let editModalChangeListener = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth('customer')) return;

    loadAppointments();
    setupEditForm();
    setupCancelForm();
});

// ── Load appointments ──

async function loadAppointments() {
    const container = document.getElementById('appointments-container');
    const token = localStorage.getItem('jwtToken');

    try {
        const response = await fetch('/api/customer/appointments', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success && data.appointments.length > 0) {
            container.innerHTML = '';
            data.appointments.forEach(appt => {
                container.appendChild(createAppointmentCard(appt));
            });
        } else if (data.success) {
            container.innerHTML = '<p>You have no appointments yet. <a href="/customer/book">Book one now</a>.</p>';
        } else {
            container.innerHTML = '<p>Failed to load appointments.</p>';
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
        container.innerHTML = '<p>Failed to load appointments. Please try again later.</p>';
    }
}

// ── Build appointment card ──

function createAppointmentCard(appt) {
    const template = document.getElementById('appointment-card-template');
    const card = template.content.cloneNode(true);

    const serviceNames = appt.services.map(s => s.service_name).join(', ') || 'N/A';
    const date = new Date(appt.appointment_date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    card.querySelector('.appt-card-services').textContent = serviceNames;

    const badge = card.querySelector('.badge');
    badge.textContent = appt.status.replace('_', ' ');
    badge.classList.add(getBadgeClass(appt.status));

    card.querySelector('[data-field="date"]').textContent = date;
    card.querySelector('[data-field="time"]').textContent = appt.preferred_time || 'TBC';
    card.querySelector('[data-field="cost"]').textContent = `£${parseFloat(appt.estimated_total || 0).toFixed(2)}`;

    card.querySelector('.appointment-card').classList.add(`status-${appt.status}`);

    const footer = card.querySelector('.appt-card-footer');

    if (appt.status === 'in_review') {
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-action';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => openEditModal(appt));
        footer.appendChild(editBtn);
    }

    if (appt.status === 'in_review' || appt.status === 'confirmed') {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-action btn-action-danger';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => openCancelModal(appt.id));
        footer.appendChild(cancelBtn);
    }

    return card;
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

// ── Edit Modal ──

async function openEditModal(appt) {
    currentEditId = appt.id;
    const container = document.getElementById('edit-services-checkboxes');

    try {
        const response = await fetch('/api/services');
        const data = await response.json();

        if (data.success && data.services.length > 0) {
            container.innerHTML = '';

            const selectedIds = appt.services.map(s => s.service_id);

            if (editModalChangeListener) {
                container.removeEventListener('change', editModalChangeListener);
            }

            data.services.forEach(service => {
                const label = document.createElement('label');
                label.className = 'checkbox-label';
                const isChecked = selectedIds.includes(service.id) ? 'checked' : '';
                label.innerHTML = `
                    <input type="checkbox" name="edit_services" value="${service.id}" data-price="${service.base_price}" ${isChecked}>
                    <span>${service.name} — £${parseFloat(service.base_price).toFixed(2)}</span>
                `;
                container.appendChild(label);
            });

            editModalChangeListener = updateEditTotal;
            container.addEventListener('change', editModalChangeListener);
            updateEditTotal();
        } else {
            container.innerHTML = '<p>No services available.</p>';
        }
    } catch (error) {
        container.innerHTML = '<p>Failed to load services.</p>';
    }

    // Pre-fill date
    const rawDate = appt.appointment_date;
    const dateStr = new Date(rawDate).toISOString().split('T')[0];
    document.getElementById('edit-date').value = dateStr;

    // Pre-fill time
    const timeSelect = document.getElementById('edit-time');
    const timeVal = appt.preferred_time ? appt.preferred_time.substring(0, 5) : '';
    timeSelect.value = timeVal;

    // Pre-fill staff gender
    const genderRadio = document.querySelector(`input[name="edit_staff_gender"][value="${appt.preferred_staff_gender || 'any'}"]`);
    if (genderRadio) genderRadio.checked = true;

    openModal('edit-modal');
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

        const token = localStorage.getItem('jwtToken');
        const checkedServices = document.querySelectorAll('input[name="edit_services"]:checked');

        if (checkedServices.length === 0) {
            showError('Please select at least one service.');
            return;
        }

        const services = Array.from(checkedServices).map(cb => ({
            service_id: cb.value,
            price: parseFloat(cb.dataset.price)
        }));

        const body = {
            appointment_date: document.getElementById('edit-date').value,
            preferred_time: document.getElementById('edit-time').value,
            preferred_staff_gender: document.querySelector('input[name="edit_staff_gender"]:checked')?.value || 'any',
            services
        };

        try {
            const data = await apiPut(`/api/customer/appointments/${currentEditId}`, body);

            if (data.success) {
                closeModal('edit-modal');
                loadAppointments();
            } else {
                showError(data.message || 'Failed to update appointment.');
            }
        } catch (error) {
            console.error('Edit error:', error);
            showError('An error occurred while updating.');
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
            const data = await apiPut(`/api/customer/appointments/${currentCancelId}/cancel`, { cancellation_reason: reason });

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
