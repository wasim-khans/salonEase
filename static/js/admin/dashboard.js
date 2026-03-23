// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Auto-refresh dashboard stats every 30 seconds
    setInterval(loadDashboardStats, 30000);
    
    // Quick action buttons
    const addServiceBtn = document.querySelector('#addServiceBtn');
    const addStaffBtn = document.querySelector('#addStaffBtn');
    
    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', function() {
            window.location.href = '/admin/services';
        });
    }
    
    if (addStaffBtn) {
        addStaffBtn.addEventListener('click', function() {
            window.location.href = '/admin/staff';
        });
    }
    
    // Recent appointments actions
    const appointmentsList = document.querySelector('.appointments-list');
    if (appointmentsList) {
        appointmentsList.addEventListener('click', function(e) {
            const reviewButton = e.target.closest('.btn-primary');
            const viewButton = e.target.closest('.btn-outline');
            
            if (reviewButton) {
                const appointmentId = reviewButton.getAttribute('href').match(/\/admin\/appointments\/(.+)/);
                if (appointmentId) {
                    reviewAppointment(appointmentId[1]);
                }
            }
        });
    }
    
    function loadDashboardStats() {
        // This would typically fetch updated stats from the server
        // For now, we'll just refresh the page or update via API
        fetch('/admin/dashboard/stats')
            .then(response => response.json())
            .then(data => {
                updateStatCards(data);
            })
            .catch(error => {
                console.error('Failed to load dashboard stats:', error);
            });
    }
    
    function updateStatCards(stats) {
        // Update stat cards with new data
        const statCards = document.querySelectorAll('.stat-card h3');
        if (statCards.length >= 4) {
            statCards[0].textContent = stats.totalAppointments || 0;
            statCards[1].textContent = stats.pendingAppointments || 0;
            statCards[2].textContent = stats.totalUsers || 0;
            statCards[3].textContent = stats.totalServices || 0;
        }
    }
    
    function reviewAppointment(appointmentId) {
        // Redirect to appointment review page
        window.location.href = `/admin/appointments/${appointmentId}`;
    }
    
    // Initialize tooltips and other UI elements
    initializeTooltips();
    
    function initializeTooltips() {
        // Simple tooltip implementation
        const tooltipElements = document.querySelectorAll('[title]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', function(e) {
                showTooltip(e.target, e.target.getAttribute('title'));
            });
            
            element.addEventListener('mouseleave', function() {
                hideTooltip();
            });
        });
    }
    
    function showTooltip(element, text) {
        // Remove existing tooltip
        hideTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'admin-tooltip';
        tooltip.textContent = text;
        tooltip.style.position = 'absolute';
        tooltip.style.background = '#333';
        tooltip.style.color = 'white';
        tooltip.style.padding = '5px 10px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '12px';
        tooltip.style.zIndex = '1000';
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
        tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
    }
    
    function hideTooltip() {
        const existingTooltip = document.querySelector('.admin-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
    }
    
    // Handle real-time updates (placeholder for WebSocket implementation)
    initializeRealTimeUpdates();
    
    function initializeRealTimeUpdates() {
        // This would connect to WebSocket for real-time updates
        // For now, we'll just use polling
        console.log('Real-time updates initialized (polling mode)');
    }
    
    // Export dashboard data
    const exportBtn = document.querySelector('.export-dashboard');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportDashboardData();
        });
    }
    
    function exportDashboardData() {
        // Create a simple CSV export
        const stats = {
            totalAppointments: document.querySelector('.stat-card:nth-child(1) h3').textContent,
            pendingAppointments: document.querySelector('.stat-card:nth-child(2) h3').textContent,
            totalUsers: document.querySelector('.stat-card:nth-child(3) h3').textContent,
            totalServices: document.querySelector('.stat-card:nth-child(4) h3').textContent,
            exportDate: new Date().toISOString()
        };
        
        const csv = 'Metric,Value\n' + 
            Object.entries(stats).map(([key, value]) => `${key},${value}`).join('\n');
        
        downloadCSV(csv, 'dashboard-export.csv');
    }
    
    function downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
});
