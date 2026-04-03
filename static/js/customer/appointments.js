document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user || user.type !== 'customer') {
        alert('Please log in to view your appointments.');
        window.location.href = '/auth/login';
        return;
    }

    loadAppointments();
});

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
                const card = createAppointmentCard(appt);
                container.appendChild(card);
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

function createAppointmentCard(appt) {
    const template = document.getElementById('appointment-card-template');
    const card = template.content.cloneNode(true);

    const serviceNames = appt.services.map(s => s.service_name).join(', ') || 'N/A';
    const date = new Date(appt.appointment_date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
    const badgeClass = getBadgeClass(appt.status);

    // Populate card
    card.querySelector('.appt-card-services').textContent = serviceNames;

    const badge = card.querySelector('.badge');
    badge.textContent = appt.status.replace('_', ' ');
    badge.classList.add(badgeClass);

    card.querySelector('[data-field="date"]').textContent = date;
    card.querySelector('[data-field="time"]').textContent = appt.preferred_time || 'TBC';
    card.querySelector('[data-field="cost"]').textContent = `£${parseFloat(appt.estimated_total || 0).toFixed(2)}`;

    // Add status class to card for left-border colour
    card.querySelector('.appointment-card').classList.add(`status-${appt.status}`);

    // Actions
    const footer = card.querySelector('.appt-card-footer');

    if (appt.status === 'in_review') {
        const editBtn = document.createElement('a');
        editBtn.className = 'btn-book';
        editBtn.href = `/customer/book?edit=${appt.id}`;
        editBtn.textContent = 'Edit';
        footer.appendChild(editBtn);
    }

    if (appt.status === 'in_review' || appt.status === 'confirmed') {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-cancel';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => cancelAppointment(appt.id));
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

async function cancelAppointment(appointmentId) {
    const reason = prompt('Please provide a reason for cancellation (required):');

    if (!reason || reason.trim() === '') {
        alert('Cancellation reason is required.');
        return;
    }

    const token = localStorage.getItem('jwtToken');

    try {
        const response = await fetch(`/api/customer/appointments/${appointmentId}/cancel`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cancellation_reason: reason.trim() })
        });

        const data = await response.json();

        if (data.success) {
            alert('Appointment cancelled successfully.');
            loadAppointments();
        } else {
            alert(data.message || 'Failed to cancel appointment.');
        }
    } catch (error) {
        console.error('Cancel error:', error);
        alert('An error occurred while cancelling.');
    }
}
