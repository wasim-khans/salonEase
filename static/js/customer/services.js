const SERVICE_IMAGES = {
    'haircut':              'https://plus.unsplash.com/premium_photo-1661423965742-c40ac9c54910?w=900&auto=format&fit=crop&q=60',
    'beard trim':           'https://plus.unsplash.com/premium_photo-1664303521711-bff2aee233b7?w=900&auto=format&fit=crop&q=60',
    'hair coloring':        'https://plus.unsplash.com/premium_photo-1728693697217-95df3717cccc?w=900&auto=format&fit=crop&q=60',
    'hair styling':         'https://plus.unsplash.com/premium_photo-1661326329898-65ac15c9208b?w=900&auto=format&fit=crop&q=60',
    'hair wash & blow dry': 'https://images.unsplash.com/photo-1717160675332-1a8d1080ae3d?w=900&auto=format&fit=crop&q=60',
    'manicure':             'https://plus.unsplash.com/premium_photo-1683121980903-496953f1626d?w=900&auto=format&fit=crop&q=60',
    'pedicure':             'https://plus.unsplash.com/premium_photo-1661868958612-7d52c5fb9647?w=900&auto=format&fit=crop&q=60',
    'facial treatment':     'https://plus.unsplash.com/premium_photo-1683122082225-26022a0deb5d?w=900&auto=format&fit=crop&q=60',
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
