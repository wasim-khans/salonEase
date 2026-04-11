document.addEventListener('DOMContentLoaded', () => {
    loadServices();
});

async function loadServices() {
    const grid = document.getElementById('services-grid');

    try {
        const data = await apiGet('/api/services');

        if (data.success && data.services.length > 0) {
            grid.innerHTML = '';
            data.services.forEach(service => {
                grid.innerHTML += createServiceCard(service);
            });
        } else {
            grid.innerHTML = '<p>No services available at the moment.</p>';
        }
    } catch (error) {
        console.error('Error loading services:', error);
        grid.innerHTML = '<p>Failed to load services. Please try again later.</p>';
    }
}

function createServiceCard(service) {
    return `
        <div class="service-card">
            <h3 class="service-name">${escapeHtml(service.name)}</h3>
            <p class="service-desc">${escapeHtml(service.category)}</p>
            <p class="service-price">from £${parseFloat(service.base_price).toFixed(2)}</p>
            <a class="btn-book" href="/customer/book?service=${service.id}">Book →</a>
        </div>
    `;
}
