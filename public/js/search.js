$(document).ready(function() {
    $('#searchForm').on('submit', function(event) {
        event.preventDefault();
        const query = $('#searchInput').val();
        if (query) {
            window.location.href = `/search?query=${encodeURIComponent(query)}`;
        }
    });

    // Get search query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');

    if (query) {
        // Fetch search results from API
        $.get(`/api/products/search?query=${encodeURIComponent(query)}`, function(products) {
            if (products.length > 0) {
                let resultsHtml = '';
                products.forEach(product => {
                    resultsHtml += `
                        <div class="col-md-4 mb-4">
                            <div class="card">
                                <a href="/product?id=${product.id}" class="card-link">
                                    <img src="/${product.main_image_url}" class="card-img-top" alt="${product.name}">
                                    <div class="card-body">
                                        <h5 class="card-title">${product.name}</h5>
                                        <p class="card-text">$${product.price}</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    `;
                });
                $('#search-results').html(resultsHtml);
            } else {
                $('#search-results').html('<p>No products found.</p>');
            }
        }).fail(function() {
            $('#search-results').html('<p>Error fetching search results.</p>');
        });
    }
});
