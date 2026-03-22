// SalonEase Main JavaScript
// Basic client-side functionality

console.log("Hey I am main.js and I will be used across all pages");

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('SalonEase application loaded');
});

// Basic utility functions
window.SalonEase = {
    formatDate: function(dateString) {
        return new Date(dateString).toLocaleDateString();
    },
    formatTime: function(timeString) {
        return timeString;
    },
    formatCurrency: function(amount) {
        return '$' + amount;
    }
};
