const SERVICE_IMAGES = {
    'haircut':              '/images/services/haircut.jpg',
    'beard trim':           '/images/services/beard-trim.jpg',
    'hair coloring':        '/images/services/hair-coloring.jpg',
    'hair styling':         '/images/services/hair-styling.jpg',
    'hair wash & blow dry': '/images/services/hair-wash.jpg',
    'manicure':             '/images/services/manicure.jpg',
    'pedicure':             '/images/services/pedicure.jpg',
    'facial treatment':     '/images/services/facial-treatment.jpg',
};

document.addEventListener('DOMContentLoaded', () => {
    loadServices();
});

async function loadServices() {
    const grid = document.getElementById('services-grid');

    try {
        const data = await apiGet('/api/services');

        if (data.success && data.services.length > 0) {
            renderServices(grid, data.services);
        } else {
            showError('Failed to load services.');
            grid.innerHTML = '<p class="empty-state">No services available.</p>';
        }
    } catch (error) {
        console.error('Error loading services:', error);
        showError('Failed to load services.');
        grid.innerHTML = '<p class="empty-state">No services available.</p>';
    }
}

function renderServices(grid, services) {
    grid.innerHTML = '';
    services.forEach(service => {
        grid.innerHTML += createServiceCard(service);
    });
}

function createServiceCard(service) {
    const img = SERVICE_IMAGES[service.name.toLowerCase()] || '';
    const imgHtml = img
        ? `<img class="service-card-img" src="${img}" alt="${escapeHtml(service.name)}">`
        : '';
    const meta = service.duration_minutes
        ? `${service.duration_minutes} min · ${escapeHtml(service.category)}`
        : escapeHtml(service.category);

    return `
        <div class="service-card">
            ${imgHtml}
            <div class="service-card-body">
                <h3 class="service-name">${escapeHtml(service.name)}</h3>
                <p class="service-meta">${meta}</p>
                <div class="service-card-footer">
                    <span class="service-price">from £${parseFloat(service.base_price).toFixed(2)}</span>
                    <a class="btn-book" href="/customer/book?service=${service.id}">Book →</a>
                </div>
            </div>
        </div>
    `;
}
