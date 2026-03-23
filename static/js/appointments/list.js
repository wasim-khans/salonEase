// Appointments List JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const statusFilter = document.querySelector('#statusFilter');
    const appointmentsGrid = document.querySelector('.appointments-grid');
    
    // Filter functionality
    if (statusFilter) {
        statusFilter.addEventListener('change', filterAppointments);
    }
    
    // Appointment actions
    if (appointmentsGrid) {
        appointmentsGrid.addEventListener('click', function(e) {
            const cancelButton = e.target.closest('.cancel-appointment');
            const viewButton = e.target.closest('.view-details');
            const bookAgainButton = e.target.closest('.book-again');
            
            if (cancelButton) {
                const appointmentId = cancelButton.dataset.id;
                cancelAppointment(appointmentId);
            } else if (viewButton) {
                const appointmentId = viewButton.dataset.id;
                viewAppointmentDetails(appointmentId);
            } else if (bookAgainButton) {
                bookSimilarAppointment();
            }
        });
    }
    
    // Modal functionality
    const modal = document.querySelector('.appointment-details-modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    if (modal) {
        closeButtons.forEach(button => {
            button.addEventListener('click', closeModal);
        });
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    function filterAppointments() {
        const statusValue = statusFilter ? statusFilter.value : 'all';
        
        const appointmentCards = document.querySelectorAll('.appointment-card');
        
        appointmentCards.forEach(card => {
            const cardStatus = card.className.match(/appointment-(\w+)/);
            if (cardStatus) {
                const appointmentStatus = cardStatus[1];
                card.style.display = (statusValue === 'all' || appointmentStatus === statusValue) ? 'block' : 'none';
            }
        });
    }
    
    async function cancelAppointment(appointmentId) {
        if (!confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }
        
        try {
            const response = await fetch(`/appointments/${appointmentId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                // Reload page to show updated status
                window.location.reload();
            } else {
                const error = await response.json();
                showError(error.error || 'Failed to cancel appointment');
            }
        } catch (error) {
            showError('Network error. Please try again.');
        }
    }
    
    async function viewAppointmentDetails(appointmentId) {
        try {
            const response = await fetch(`/appointments/${appointmentId}`);
            const appointment = await response.json();
            
            if (response.ok) {
                showAppointmentModal(appointment);
            } else {
                showError('Failed to load appointment details');
            }
        } catch (error) {
            showError('Network error. Please try again.');
        }
    }
    
    function showAppointmentModal(appointment) {
        const modalContent = document.querySelector('#appointmentDetailsContent');
        if (modalContent) {
            modalContent.innerHTML = `
                <div class="appointment-detail">
                    <h4>Appointment Details</h4>
                    <div class="detail-row">
                        <span class="label">ID:</span>
                        <span class="value">#${appointment.id.substring(0, 8)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Date:</span>
                        <span class="value">${appointment.appointment_date}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Preferred Time:</span>
                        <span class="value">${appointment.preferred_time}</span>
                    </div>
                    ${appointment.start_time ? `
                    <div class="detail-row">
                        <span class="label">Confirmed Time:</span>
                        <span class="value">${appointment.start_time}</span>
                    </div>
                    ` : ''}
                    <div class="detail-row">
                        <span class="label">Status:</span>
                        <span class="value">
                            <span class="badge badge-${appointment.status}">${appointment.status.replace('_', ' ').toUpperCase()}</span>
                        </span>
                    </div>
                    ${appointment.actual_price ? `
                    <div class="detail-row">
                        <span class="label">Final Price:</span>
                        <span class="value">$${appointment.actual_price}</span>
                    </div>
                    ` : ''}
                    <div class="detail-row">
                        <span class="label">Services:</span>
                        <span class="value services-list">Loading services...</span>
                    </div>
                </div>
            `;
            
            // Load services for this appointment
            loadAppointmentServices(appointment.id);
        }
        
        if (modal) {
            modal.style.display = 'block';
        }
    }
    
    async function loadAppointmentServices(appointmentId) {
        try {
            const response = await fetch(`/appointments/${appointmentId}/services`);
            const services = await response.json();
            
            if (response.ok) {
                const servicesList = document.querySelector('.services-list');
                if (servicesList) {
                    if (services.length > 0) {
                        servicesList.innerHTML = services.map(service => `
                            <div class="service-item">
                                <span class="service-name">${service.name}</span>
                                <span class="service-price">$${service.price}</span>
                            </div>
                        `).join('');
                    } else {
                        servicesList.innerHTML = '<span class="no-services">No services found</span>';
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load services:', error);
        }
    }
    
    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    function bookSimilarAppointment() {
        // Redirect to services page
        window.location.href = '/services';
    }
    
    function showError(message) {
        // Create or update error message
        let errorDiv = document.querySelector('.appointments-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'appointments-error alert alert-danger';
            const container = document.querySelector('.appointments-header');
            if (container) {
                container.appendChild(errorDiv);
            }
        }
        errorDiv.textContent = message;
        
        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    // Load services for each appointment
    loadAllAppointmentServices();
    
    async function loadAllAppointmentServices() {
        const serviceLists = document.querySelectorAll('.services-list');
        
        for (const serviceList of serviceLists) {
            const appointmentCard = serviceList.closest('.appointment-card');
            const viewButton = appointmentCard.querySelector('.view-details');
            
            if (viewButton) {
                const appointmentId = viewButton.dataset.id;
                
                try {
                    const response = await fetch(`/appointments/${appointmentId}/services`);
                    const services = await response.json();
                    
                    if (response.ok && services.length > 0) {
                        serviceList.innerHTML = services.map(service => 
                            `${service.name}`
                        ).join(', ');
                    } else {
                        serviceList.innerHTML = 'No services';
                    }
                } catch (error) {
                    serviceList.innerHTML = 'Error loading';
                }
            }
        }
    }
});
