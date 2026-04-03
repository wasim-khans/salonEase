document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user || user.type !== 'admin') {
        alert('Access denied. Admin login required.');
        window.location.href = '/auth/login';
        return;
    }

    loadAppointments();
    setupFilters();
});

let allAppointments = [];

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
            displayAppointments(allAppointments);
        } else {
            container.innerHTML = '<p>Failed to load appointments.</p>';
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
        container.innerHTML = '<p>Failed to load appointments. Please try again later.</p>';
    }
}

function setupFilters() {
    const filterContainer = document.getElementById('status-filters');
    if (!filterContainer) return;

    filterContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            // Update active state
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
        const badgeClass = getBadgeClass(appt.status);

        // Show customer name before services
        card.querySelector('.appt-card-services').textContent = `${appt.customer_name || 'Unknown'} — ${serviceNames}`;

        const badge = card.querySelector('.badge');
        badge.textContent = appt.status.replace('_', ' ');
        badge.classList.add(badgeClass);

        card.querySelector('[data-field="date"]').textContent = date;
        card.querySelector('[data-field="time"]').textContent = appt.preferred_time || 'TBC';
        card.querySelector('[data-field="cost"]').textContent = `£${parseFloat(appt.estimated_total || 0).toFixed(2)}`;

        card.querySelector('.appointment-card').classList.add(`status-${appt.status}`);

        // Admin action — manage link
        const footer = card.querySelector('.appt-card-footer');
        const manageBtn = document.createElement('a');
        manageBtn.className = 'btn-action';
        manageBtn.href = `/admin/appointments/${appt.id}`;
        manageBtn.textContent = 'Manage';
        footer.appendChild(manageBtn);

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
