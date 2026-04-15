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

const MOCK_SERVICES = [
    { id: 1, name: 'Haircut',              category: 'hair',  base_price: 25, duration_minutes: 45  },
    { id: 2, name: 'Beard Trim',           category: 'hair',  base_price: 15, duration_minutes: 20  },
    { id: 3, name: 'Hair Coloring',        category: 'hair',  base_price: 75, duration_minutes: 120 },
    { id: 4, name: 'Hair Styling',         category: 'hair',  base_price: 35, duration_minutes: 60  },
    { id: 5, name: 'Hair Wash & Blow Dry', category: 'hair',  base_price: 20, duration_minutes: 40  },
    { id: 6, name: 'Manicure',             category: 'nails', base_price: 20, duration_minutes: 45  },
    { id: 7, name: 'Pedicure',             category: 'nails', base_price: 25, duration_minutes: 60  },
    { id: 8, name: 'Facial Treatment',     category: 'skin',  base_price: 60, duration_minutes: 90  },
];

document.addEventListener('DOMContentLoaded', () => {
    loadServices();
});

async function loadServices() {
    const grid = document.getElementById('services-grid');

    try {
        const response = await fetch('/api/services');
        const data = await response.json();

        if (data.success && data.services.length > 0) {
            renderServices(grid, data.services);
        } else {
            renderServices(grid, MOCK_SERVICES);
        }
    } catch (error) {
        renderServices(grid, MOCK_SERVICES);
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
<<<<<<< Updated upstream
            <h3 class="service-name">${service.name}</h3>
            <p class="service-desc">${service.category}</p>
            <p class="service-price">from £${parseFloat(service.base_price).toFixed(2)}</p>
            <a class="btn-book" href="/customer/book?service=${service.id}">Book →</a>
=======
            ${imgHtml}
            <div class="service-card-body">
                <h3 class="service-name">${escapeHtml(service.name)}</h3>
                <p class="service-meta">${meta}</p>
                <div class="service-card-footer">
                    <span class="service-price">from £${parseFloat(service.base_price).toFixed(2)}</span>
                    <a class="btn-book" href="/customer/book?service=${service.id}">Book →</a>
                </div>
            </div>
>>>>>>> Stashed changes
        </div>
    `;
}
