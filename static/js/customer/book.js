document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth('customer')) return;

    loadServicesCheckboxes();
    setupBookingForm();
});

async function loadServicesCheckboxes() {
    const container = document.getElementById('services-checkboxes');

    try {
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
        }
    } catch (error) {
        console.error('Error loading services:', error);
        container.innerHTML = '<p>Failed to load services.</p>';
    }
}

function updateEstimatedTotal() {
    const checked = document.querySelectorAll('input[name="services"]:checked');
    let total = 0;
    checked.forEach(cb => {
        total += parseFloat(cb.dataset.price);
    });

    const totalEl = document.getElementById('estimated-total');
    if (checked.length > 0) {
        totalEl.textContent = `Estimated total: £${total.toFixed(2)}`;
    } else {
        totalEl.textContent = '';
    }
}

function setupBookingForm() {
    const form = document.getElementById('bookingForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('jwtToken');
        const checkedServices = document.querySelectorAll('input[name="services"]:checked');
        const appointmentDate = document.getElementById('date').value;
        const preferredTime = document.getElementById('time').value;
        const preferredStaffGender = document.querySelector('input[name="preferred_staff_gender"]:checked')?.value || 'any';

        if (checkedServices.length === 0) {
            showError('Please select at least one service.');
            return;
        }

        if (!appointmentDate) {
            showError('Please select a date.');
            return;
        }

        if (!preferredTime) {
            showError('Please select a time slot.');
            return;
        }

        const services = Array.from(checkedServices).map(cb => ({
            service_id: cb.value,
            price: parseFloat(cb.dataset.price)
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
