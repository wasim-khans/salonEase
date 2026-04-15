<<<<<<< Updated upstream
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user || user.type !== 'customer') {
        showError('Please log in to book an appointment.');
        window.location.href = '/auth/login';
        return;
    }
=======
const MOCK_SERVICES = [
    { id: '1', name: 'Haircut',              category: 'hair',  base_price: 25, duration_minutes: 45  },
    { id: '2', name: 'Beard Trim',           category: 'hair',  base_price: 15, duration_minutes: 20  },
    { id: '3', name: 'Hair Coloring',        category: 'hair',  base_price: 75, duration_minutes: 120 },
    { id: '4', name: 'Hair Styling',         category: 'hair',  base_price: 35, duration_minutes: 60  },
    { id: '5', name: 'Hair Wash & Blow Dry', category: 'hair',  base_price: 20, duration_minutes: 40  },
    { id: '6', name: 'Manicure',             category: 'nails', base_price: 20, duration_minutes: 45  },
    { id: '7', name: 'Pedicure',             category: 'nails', base_price: 25, duration_minutes: 60  },
    { id: '8', name: 'Facial Treatment',     category: 'skin',  base_price: 60, duration_minutes: 90  },
];

// Services selected for this booking (array of service objects)
let selectedServices = [];

document.addEventListener('DOMContentLoaded', async () => {
    if (!requireAuth('customer')) return;
>>>>>>> Stashed changes

    await loadInitialService();
    setupBookingForm();
});

async function loadInitialService() {
    const params = new URLSearchParams(window.location.search);
    const serviceId = params.get('service');
    if (!serviceId) return;

    let service = null;

    try {
<<<<<<< Updated upstream
        const response = await fetch('/api/services');
        const data = await response.json();

        if (data.success && data.services.length > 0) {
            container.innerHTML = '';
            data.services.forEach(service => {
                const label = document.createElement('label');
                label.className = 'checkbox-label';
                label.innerHTML = `
                    <input type="checkbox" name="services" value="${service.id}" data-price="${service.base_price}">
                    <span>${service.name} — £${parseFloat(service.base_price).toFixed(2)}</span>
                `;
                container.appendChild(label);
            });

            // Update estimated total when checkboxes change
            container.addEventListener('change', updateEstimatedTotal);
        } else {
            container.innerHTML = '<p>No services available.</p>';
=======
        const data = await apiGet('/api/services');
        if (data.success) {
            service = data.services.find(s => String(s.id) === String(serviceId));
>>>>>>> Stashed changes
        }
    } catch (_) {}

    if (!service) {
        service = MOCK_SERVICES.find(s => String(s.id) === String(serviceId));
    }

    if (service) {
        selectedServices.push(service);
        renderServiceChips();
    }
}

function renderServiceChips() {
    const container = document.getElementById('selected-services');
    container.innerHTML = selectedServices.map(s => `
        <div class="service-chip" data-id="${s.id}">
            <div class="service-chip-info">
                <strong>${escapeHtml(s.name)}</strong>
                <span>${s.duration_minutes ? s.duration_minutes + ' min' : ''}</span>
            </div>
            <span class="service-chip-price">£${parseFloat(s.base_price).toFixed(2)}</span>
        </div>
    `).join('');

    updateEstimatedTotal();
}

function updateEstimatedTotal() {
    const total = selectedServices.reduce((sum, s) => sum + parseFloat(s.base_price), 0);
    const el = document.getElementById('estimated-total');
    el.textContent = selectedServices.length > 0 ? `Estimated total: £${total.toFixed(2)}` : '';
}

function setupBookingForm() {
    const form = document.getElementById('bookingForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

<<<<<<< Updated upstream
        const token = localStorage.getItem('jwtToken');
        const checkedServices = document.querySelectorAll('input[name="services"]:checked');
        const appointmentDate = document.getElementById('date').value;
        const preferredTime = document.getElementById('time').value;
        const preferredStaffGender = document.querySelector('input[name="preferred_staff_gender"]:checked')?.value || 'any';

        if (checkedServices.length === 0) {
=======
        if (selectedServices.length === 0) {
>>>>>>> Stashed changes
            showError('Please select at least one service.');
            return;
        }

        const appointmentDate = document.getElementById('date').value;
        const preferredTime   = document.getElementById('time').value;
        const preferredStaffGender = document.querySelector('input[name="preferred_staff_gender"]:checked')?.value || 'any';

        if (!appointmentDate) { showError('Please select a date.'); return; }
        if (!preferredTime)   { showError('Please select a time slot.'); return; }

        const services = selectedServices.map(s => ({
            service_id: s.id,
            price: parseFloat(s.base_price)
        }));

        try {
            const response = await fetch('/api/customer/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    appointment_date: appointmentDate,
                    preferred_time: preferredTime,
                    preferred_staff_gender: preferredStaffGender,
                    services
                })
            });

            const data = await response.json();

            if (data.success) {
                showSuccess('Booking submitted successfully! It is now under review.');
                window.location.href = '/customer/appointments';
            } else {
                showError(data.message || 'Failed to create booking.');
            }
        } catch (error) {
            showError('An error occurred while creating the booking.');
        }
    });
}
