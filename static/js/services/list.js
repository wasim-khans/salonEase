// Services List JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const selectedServices = [];
    const servicesGrid = document.querySelector('.services-grid');
    const selectedServicesContainer = document.querySelector('#selectedServices');
    const totalAmountElement = document.querySelector('#totalAmount');
    const proceedButton = document.querySelector('#proceedToBooking');
    
    // Filter functionality
    const genderFilter = document.querySelector('#genderFilter');
    const categoryFilter = document.querySelector('#categoryFilter');
    
    if (genderFilter) {
        genderFilter.addEventListener('change', filterServices);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterServices);
    }
    
    // Service selection
    if (servicesGrid) {
        servicesGrid.addEventListener('click', function(e) {
            const selectButton = e.target.closest('.select-service');
            if (selectButton) {
                const serviceId = selectButton.dataset.serviceId;
                const serviceName = selectButton.dataset.serviceName;
                const servicePrice = parseFloat(selectButton.dataset.price);
                
                toggleService(serviceId, serviceName, servicePrice, selectButton);
            }
        });
    }
    
    // Proceed to booking
    if (proceedButton) {
        proceedButton.addEventListener('click', function() {
            if (selectedServices.length === 0) {
                showError('Please select at least one service');
                return;
            }
            
            // Store selected services in session storage for booking page
            sessionStorage.setItem('selectedServices', JSON.stringify(selectedServices));
            
            // Redirect to booking page
            window.location.href = '/services/booking';
        });
    }
    
    function toggleService(serviceId, serviceName, servicePrice, button) {
        const existingIndex = selectedServices.findIndex(s => s.id === serviceId);
        
        if (existingIndex > -1) {
            // Remove service
            selectedServices.splice(existingIndex, 1);
            button.textContent = 'Add to Booking';
            button.classList.remove('btn-success');
            button.classList.add('btn-primary');
            button.innerHTML = '<i class="fas fa-plus"></i> Add to Booking';
        } else {
            // Add service
            selectedServices.push({
                id: serviceId,
                name: serviceName,
                price: servicePrice
            });
            button.textContent = 'Remove';
            button.classList.remove('btn-primary');
            button.classList.add('btn-success');
            button.innerHTML = '<i class="fas fa-check"></i> Added';
        }
        
        updateBookingSummary();
    }
    
    function updateBookingSummary() {
        if (selectedServicesContainer) {
            if (selectedServices.length === 0) {
                selectedServicesContainer.innerHTML = `
                    <div class="empty-selection">
                        <p>No services selected yet. Browse our services above to get started.</p>
                    </div>
                `;
            } else {
                selectedServicesContainer.innerHTML = selectedServices.map(service => `
                    <div class="selected-service-item">
                        <div class="service-info">
                            <span class="service-name">${service.name}</span>
                            <span class="service-price">$${service.price.toFixed(2)}</span>
                        </div>
                    </div>
                `).join('');
            }
        }
        
        // Update total
        const total = selectedServices.reduce((sum, service) => sum + service.price, 0);
        if (totalAmountElement) {
            totalAmountElement.textContent = `$${total.toFixed(2)}`;
        }
        
        // Update proceed button
        if (proceedButton) {
            proceedButton.disabled = selectedServices.length === 0;
        }
    }
    
    function filterServices() {
        const genderValue = genderFilter ? genderFilter.value : 'all';
        const categoryValue = categoryFilter ? categoryFilter.value : 'all';
        
        const serviceCards = document.querySelectorAll('.service-card');
        
        serviceCards.forEach(card => {
            const serviceCategory = card.dataset.category;
            const serviceGender = card.dataset.gender;
            
            let showCard = true;
            
            if (genderValue !== 'all' && serviceGender !== genderValue) {
                showCard = false;
            }
            
            if (categoryValue !== 'all' && serviceCategory !== categoryValue) {
                showCard = false;
            }
            
            card.style.display = showCard ? 'block' : 'none';
        });
    }
    
    function showError(message) {
        // Create or update error message
        let errorDiv = document.querySelector('.services-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'services-error alert alert-danger';
            const bookingSummary = document.querySelector('.booking-summary');
            if (bookingSummary) {
                bookingSummary.insertBefore(errorDiv, bookingSummary.firstChild);
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
    
    // Initialize
    updateBookingSummary();
});
