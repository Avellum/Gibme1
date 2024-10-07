$(document).ready(function() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    console.log('Product ID:', productId); // Log the product ID for debugging

    // Fetch product details from API
    $.get(`/api/products/${productId}`, function(product) {
        console.log('API response:', product); // Log the API response for debugging

        if (product) {
            // Create carousel indicators
            let indicatorsHtml = '';
            let imagesHtml = '';

            // Add the main image as the first image
            if (product.main_image_url) {
                indicatorsHtml += `
                    <li data-target="#productCarousel" data-slide-to="0" class="active"></li>
                `;
                imagesHtml += `
                    <div class="carousel-item active">
                        <img src="/${product.main_image_url}" class="d-block w-100" alt="${product.name}">
                    </div>
                `;
            }

            // Add additional images
            if (product.images && product.images.length > 0) {
                product.images.forEach((image, index) => {
                    indicatorsHtml += `
                        <li data-target="#productCarousel" data-slide-to="${index + 1}" class=""></li>
                    `;
                    imagesHtml += `
                        <div class="carousel-item">
                            <img src="/${image.image_url}" class="d-block w-100" alt="${product.name}">
                        </div>
                    `;
                });
            } else if (!product.main_image_url) {
                // Add a placeholder if no images are found and no main image
                imagesHtml = `
                    <div class="carousel-item active">
                        <img src="/images/placeholder.jpg" class="d-block w-100" alt="No image available">
                    </div>
                `;
            }

            const productHtml = `
                <div class="row">
                    <div class="col-md-6">
                        <div id="productCarousel" class="carousel slide" data-ride="carousel">
                            <ol class="carousel-indicators">
                                ${indicatorsHtml}
                            </ol>
                            <div class="carousel-inner">
                                ${imagesHtml}
                            </div>
                            <a class="carousel-control-prev" href="#productCarousel" role="button" data-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="sr-only">Previous</span>
                            </a>
                            <a class="carousel-control-next" href="#productCarousel" role="button" data-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="sr-only">Next</span>
                            </a>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h1>${product.name}</h1>
                        <p>${product.description}</p>
                        <h4>Price: $${product.price}</h4>
                        <h5>Stock: ${product.stock}</h5>
                        <button class="btn btn-primary">Add to Cart</button>
                    </div>
                </div>
            `;
            $('#product-details').html(productHtml);
        } else {
            $('#product-details').html('<p>Product not found.</p>');
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error('Error fetching product details:', textStatus, errorThrown); // Log the error details for debugging
        $('#product-details').html('<p>Error fetching product details.</p>');
    });
});
