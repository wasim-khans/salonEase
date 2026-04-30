// Services selected for this booking (array of service objects)
let selectedServices = [];

document.addEventListener('DOMContentLoaded', async () => {
    if (!requireAuth('customer')) return;

    // Set minimum date to today for the date picker
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    restoreSelectedServices();
    await loadInitialService();
    renderServiceChips();
    setupBookingForm();
});

function restoreSelectedServices() {
    try {
        const saved = sessionStorage.getItem('bookingServices');
        if (saved) selectedServices = JSON.parse(saved);
    } catch (_) {}
}

function saveSelectedServices() {
    sessionStorage.setItem('bookingServices', JSON.stringify(selectedServices));
}

async function loadInitialService() {
    const params = new URLSearchParams(window.location.search);
    const serviceId = params.get('service');
    if (!serviceId) return;

    let service = null;

    try {
        const data = await apiGet('/api/services');
        if (data.success) {
            service = data.services.find(s => String(s.id) === String(serviceId));
        }
    } catch (err) {
        console.error('Error loading service:', err);
        showError('Failed to load service details.');
    }

    if (service && !selectedServices.some(s => String(s.id) === String(service.id))) {
        selectedServices.push(service);
    }
    saveSelectedServices();
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
            <button type="button" class="service-chip-remove" onclick="removeService('${s.id}')">&times;</button>
        </div>
    `).join('');

    updateEstimatedTotal();
}

function removeService(id) {
    selectedServices = selectedServices.filter(s => String(s.id) !== String(id));
    saveSelectedServices();
    renderServiceChips();
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

        const appointmentDate = document.getElementById('date').value;
        const preferredTime   = document.getElementById('time').value;
        const preferredStaffGender = document.querySelector('input[name="preferred_staff_gender"]:checked')?.value || 'any';

        if (selectedServices.length === 0) {
            showError('Please select at least one service.');
            return;
        }

        if (!appointmentDate) { showError('Please select a date.'); return; }
        if (!preferredTime)   { showError('Please select a time slot.'); return; }

        // Validate that the appointment date is not in the past
        const selectedDate = new Date(appointmentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            showError('Cannot book appointments in the past. Please select a future date.');
            return;
        }

        const services = selectedServices.map(s => ({
            service_id: s.id,
            price: parseFloat(s.base_price)
        }));

        try {
            const data = await apiPost('/api/customer/appointments', {
                appointment_date: appointmentDate,
                preferred_time: preferredTime,
                preferred_staff_gender: preferredStaffGender,
                services
            });

            if (data.success) {
                showSuccess('Booking submitted successfully! It is now under review.');
                sessionStorage.removeItem('bookingServices');
                setTimeout(() => { window.location.href = '/customer/appointments'; }, 1000);
            } else {
                showError(data.message || 'Failed to create booking.');
            }
        } catch (error) {
            console.error('Booking error:', error);
            showError('An error occurred while creating the booking.');
        }
    });
}
