// SalonEase JavaScript
// Client-side functionality for the salon appointment management system

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('SalonEase application loaded');
    
    // Initialize any interactive elements
    initializeForms();
    initializeModals();
    initializeFilters();
});

// Form Handling
function initializeForms() {
    // Add event listeners for form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
}

function handleFormSubmit(event) {
    // Basic form validation
    const form = event.target;
    const requiredFields = form.querySelectorAll('[required]');
    
    let isValid = true;
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    });
    
    if (!isValid) {
        event.preventDefault();
        alert('Please fill in all required fields');
    }
}

// Modal Handling
function initializeModals() {
    // Add event listeners for modal triggers
    const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', openModal);
    });
    
    // Close modal handlers
    const modalCloses = document.querySelectorAll('[data-modal-close]');
    modalCloses.forEach(close => {
        close.addEventListener('click', closeModal);
    });
}

function openModal(event) {
    const modalId = event.target.dataset.modalTrigger;
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('active');
    }
}

function closeModal(event) {
    const modal = event.target.closest('.modal');
    if (modal) {
        modal.classList.remove('active');
        modal.classList.add('hidden');
    }
}

// Filter Handling
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-buttons a');
    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilterClick);
    });
}

function handleFilterClick(event) {
    // Remove active class from all buttons
    const filterButtons = document.querySelectorAll('.filter-buttons a');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Filter logic would go here
    const filter = event.target.dataset.filter;
    console.log('Filter by:', filter);
}

// Utility Functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Export functions for use in other scripts
window.SalonEase = {
    formatDate,
    formatTime,
    formatCurrency,
    openModal,
    closeModal
};
