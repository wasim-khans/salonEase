let currentEditId = null;
let currentCancelId = null;
<<<<<<< Updated upstream

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user || user.type !== 'customer') {
        showError('Please log in to view your appointments.');
        window.location.href = '/auth/login';
        return;
    }

=======
let currentCancelAppt = null;
let editModalChangeListener = null;

const MOCK_APPOINTMENTS = [
    {
        id: 1, status: 'confirmed',
        services: [{ service_name: 'Haircut', service_id: 1 }],
        appointment_date: '2025-04-12', preferred_time: '10:00',
        estimated_total: 25, preferred_staff_gender: 'any'
    },
    {
        id: 2, status: 'in_review',
        services: [{ service_name: 'Manicure', service_id: 6 }],
        appointment_date: '2025-04-20', preferred_time: '15:30',
        estimated_total: 20, preferred_staff_gender: 'any'
    },
    {
        id: 3, status: 'completed',
        services: [{ service_name: 'Hair Treatment', service_id: 3 }],
        appointment_date: '2025-03-05', preferred_time: '11:00',
        estimated_total: 60, preferred_staff_gender: 'any'
    },
    {
        id: 4, status: 'cancelled',
        services: [{ service_name: 'Hair Colouring', service_id: 3 }],
        appointment_date: '2025-03-01', preferred_time: '09:00',
        estimated_total: 75, preferred_staff_gender: 'any'
    },
];

document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth('customer')) return;
>>>>>>> Stashed changes
    loadAppointments();
    setupEditForm();
    setupCancelForm();
});

<<<<<<< Updated upstream
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
=======
async function loadAppointments() {
    try {
        const data = await apiGet('/api/customer/appointments');
        if (data.success) {
            renderAppointments(data.appointments);
>>>>>>> Stashed changes
        } else {
            renderAppointments(MOCK_APPOINTMENTS);
        }
    } catch (_) {
        renderAppointments(MOCK_APPOINTMENTS);
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
let editModalChangeListener = null;

async function openEditModal(appt) {
    currentEditId = appt.id;
    const container = document.getElementById('edit-services-checkboxes');
    
    try {
<<<<<<< Updated upstream
        const response = await fetch('/api/services');
        const data = await response.json();
        
        if (data.success && data.services.length > 0) {
            container.innerHTML = '';
            const selectedIds = appt.services.map(s => s.service_id);
            
            // Remove existing listener if it exists
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
            
            // Add new listener and store reference
            editModalChangeListener = updateEditTotal;
            container.addEventListener('change', editModalChangeListener);
            updateEditTotal();
=======
        const data = await apiGet('/api/services');
        if (data.success && data.services.length > 0) {
            renderEditCheckboxes(container, data.services, appt);
>>>>>>> Stashed changes
        } else {
            renderEditCheckboxes(container, MOCK_SERVICES_EDIT, appt);
        }
    } catch (_) {
        renderEditCheckboxes(container, MOCK_SERVICES_EDIT, appt);
    }
<<<<<<< Updated upstream
    
    // Pre-fill date
    const rawDate = appt.appointment_date;
    const dateStr = new Date(rawDate).toISOString().split('T')[0];
=======

    const dateStr = new Date(appt.appointment_date).toISOString().split('T')[0];
>>>>>>> Stashed changes
    document.getElementById('edit-date').value = dateStr;
    document.getElementById('edit-time').value = appt.preferred_time ? appt.preferred_time.substring(0, 5) : '';
    const genderRadio = document.querySelector(`input[name="edit_staff_gender"][value="${appt.preferred_staff_gender || 'any'}"]`);
    if (genderRadio) genderRadio.checked = true;

    openModal('edit-modal');
}

const MOCK_SERVICES_EDIT = [
    { id: 1, name: 'Haircut', base_price: 25 }, { id: 2, name: 'Beard Trim', base_price: 15 },
    { id: 3, name: 'Hair Coloring', base_price: 75 }, { id: 4, name: 'Hair Styling', base_price: 35 },
    { id: 5, name: 'Hair Wash & Blow Dry', base_price: 20 }, { id: 6, name: 'Manicure', base_price: 20 },
    { id: 7, name: 'Pedicure', base_price: 25 }, { id: 8, name: 'Facial Treatment', base_price: 60 },
];

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
<<<<<<< Updated upstream

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
=======
        const checked = document.querySelectorAll('input[name="edit_services"]:checked');
        if (checked.length === 0) { showError('Please select at least one service.'); return; }
>>>>>>> Stashed changes

        const body = {
            appointment_date: document.getElementById('edit-date').value,
            preferred_time:   document.getElementById('edit-time').value,
            preferred_staff_gender: document.querySelector('input[name="edit_staff_gender"]:checked')?.value || 'any',
            services: Array.from(checked).map(cb => ({ service_id: cb.value, price: parseFloat(cb.dataset.price) }))
        };

        try {
<<<<<<< Updated upstream
            const response = await fetch(`/api/customer/appointments/${currentEditId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

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
=======
            const data = await apiPut(`/api/customer/appointments/${currentEditId}`, body);
            if (data.success) { closeModal('edit-modal'); loadAppointments(); }
            else showError(data.message || 'Failed to update appointment.');
        } catch (_) { showError('An error occurred while updating.'); }
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream

        const reason = document.getElementById('cancel-reason').value.trim();
        if (!reason) {
            showError('Cancellation reason is required.');
            return;
        }

        const token = localStorage.getItem('jwtToken');

        try {
            const response = await fetch(`/api/customer/appointments/${currentCancelId}/cancel`, {
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
=======
        try {
            const data = await apiPut(`/api/customer/appointments/${currentCancelId}/cancel`, { cancellation_reason: 'Cancelled by customer' });
            if (data.success) { closeModal('cancel-modal'); showCancelledView(); }
            else showError(data.message || 'Failed to cancel appointment.');
        } catch (_) { showError('An error occurred while cancelling.'); }
>>>>>>> Stashed changes
    });
}
