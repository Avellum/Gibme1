$(document).ready(function() {
    $.get('/api/products', function(products) {
        let carouselInner = $('#carousel-inner');
        if (products.length) {
            let chunks = chunkArray(products, 4); // Split products into chunks of 4
            chunks.forEach((chunk, index) => {
                let activeClass = index === 0 ? 'active' : '';
                let carouselItem = `
                    <div class="carousel-item ${activeClass}">
                        <div class="row">
                            ${chunk.map(product => `
                                <div class="col-md-3">
                                    <a href="/product?id=${product.id}" class="card-link">
                                        <div class="card">
                                            <img src="/${product.main_image_url}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
                                            <div class="card-body">
                                                <h5 class="card-title">${product.name}</h5>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                carouselInner.append(carouselItem);
            });
        } else {
            carouselInner.html('<p>No products available.</p>');
        }
    }).fail(function() {
        $('#carousel-inner').html('<p>Error loading products.</p>');
    });
});

function chunkArray(arr, chunkSize) {
    let chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
}
