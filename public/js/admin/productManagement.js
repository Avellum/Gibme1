document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('product-search');
    const searchResults = document.getElementById('search-results');
    const productDetailsContainer = document.getElementById('product-details');
    const editForm = document.getElementById('edit-product-form');
    const categorySelect = document.getElementById('product-category');

    const searchInputRemove = document.getElementById('product-search-remove');
    const searchResultsRemove = document.getElementById('search-results-remove');
    const productDetailsContainerRemove = document.getElementById('product-details-remove');
    const removeForm = document.getElementById('remove-product-form');

    // Function to fetch categories and populate the dropdown
    function populateCategoryDropdown() {
        fetch('/admin/productmanagement/categories')
            .then(response => response.json())
            .then(categories => {
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching categories:', error));
    }

    // Call the function to populate categories when the page loads
    populateCategoryDropdown();

    searchInput.addEventListener('input', function () {
        const query = this.value.trim();

        if (query.length > 0) {
            fetch(`/api/products/search?query=${query}`)
                .then(response => response.json())
                .then(products => {
                    searchResults.innerHTML = ''; // Clear previous results
                    if (products.length > 0) {
                        products.forEach(product => {
                            const resultItem = document.createElement('a');
                            resultItem.href = '#';
                            resultItem.classList.add('list-group-item', 'list-group-item-action');
                            resultItem.textContent = `${product.name} (ID: ${product.id}, SKU: ${product.sku})`;
                            resultItem.dataset.productId = product.id;

                            resultItem.addEventListener('click', function (e) {
                                e.preventDefault();
                                const productId = this.dataset.productId;

                                fetch(`/api/products/${productId}`)
                                    .then(response => response.json())
                                    .then(product => {
                                        displayProductDetails(product);
                                        populateEditForm(product);
                                        searchResults.innerHTML = ''; // Clear search results
                                        searchInput.value = product.name; // Optionally set the search input to the selected product name
                                    })
                                    .catch(error => console.error('Error fetching product details:', error));
                            });

                            searchResults.appendChild(resultItem);
                        });
                    } else {
                        searchResults.innerHTML = '<p class="text-muted">No products found.</p>';
                    }
                })
                .catch(error => console.error('Error fetching products:', error));
        } else {
            searchResults.innerHTML = ''; // Clear results if the input is empty
        }
    });

    function displayProductDetails(product) {
        // Clear previous product details
        productDetailsContainer.innerHTML = '';

        // Create product details elements
        const details = `
            <div class="card">
                <div class="card-header">
                    Product Details
                </div>
                <div class="card-body">
                    <h5 class="card-title">${product.name} (ID: ${product.id}, SKU: ${product.sku})</h5>
                    <p class="card-text"><strong>Description:</strong> ${product.description}</p>
                    <p class="card-text"><strong>Price:</strong> $${product.price}</p>
                    <p class="card-text"><strong>Stock:</strong> ${product.stock}</p>
                    <p class="card-text"><strong>Category ID:</strong> ${product.category_id}</p>
                    ${product.main_image_url ? `<p class="card-text"><strong>Main Image:</strong> <img src="/${product.main_image_url}" alt="${product.name}" class="img-fluid" style="max-width: 200px;"></p>` : ''}
                    ${product.images && product.images.length > 0 ? product.images.map(image => `<p class="card-text"><strong>Additional Image:</strong> <img src="/${image.image_url}" alt="Product Image" class="img-fluid" style="max-width: 200px;"></p>`).join('') : ''}
                    <p class="card-text"><strong>Variations:</strong></p>
                    ${product.Variations && product.Variations.length > 0 ? product.Variations.map(variation => `
                        <ul>
                            <li><strong>SKU:</strong> ${variation.sku}</li>
                            <li><strong>Price:</strong> $${variation.price}</li>
                            <li><strong>Stock:</strong> ${variation.stock}</li>
                            ${variation.Options && variation.Options.length > 0 ? variation.Options.map(option => `
                                <li><strong>${option.variation_type}:</strong> ${option.value}</li>
                            `).join('') : ''}
                        </ul>
                    `).join('') : '<p class="text-muted">No variations available.</p>'}
                    <p class="card-text"><strong>Promotions:</strong></p>
                    ${product.Promotions && product.Promotions.length > 0 ? product.Promotions.map(promotion => `
                        <ul>
                            <li><strong>Discount:</strong> ${promotion.discount_percentage}%</li>
                            <li><strong>Start Date:</strong> ${promotion.start_date}</li>
                            <li><strong>End Date:</strong> ${promotion.end_date}</li>
                        </ul>
                    `).join('') : '<p class="text-muted">No promotions available.</p>'}
                </div>
            </div>
        `;

        // Insert product details into the container
        productDetailsContainer.innerHTML = details;
    }

    function populateEditForm(product) {
        // Populate the edit form with the product details
        editForm.elements['id'].value = product.id || '';
        editForm.elements['name'].value = product.name || '';
        editForm.elements['sku'].value = product.sku || '';
        editForm.elements['description'].value = product.description || '';
        editForm.elements['price'].value = product.price || '';
        editForm.elements['stock'].value = product.stock || '';
        editForm.elements['category_id'].value = product.category_id || '';
        if (product.main_image_url) {
            editForm.elements['main_image'].value = '';  // Clear file input field
            // You can't set a value for file input fields. Instead, you may display the current image URL or handle it differently.
        }
    }

    // Code for the Remove Product functionality

    searchInputRemove.addEventListener('input', function () {
        const query = this.value.trim();

        if (query.length > 0) {
            fetch(`/api/products/search?query=${query}`)
                .then(response => response.json())
                .then(products => {
                    searchResultsRemove.innerHTML = ''; // Clear previous results
                    if (products.length > 0) {
                        products.forEach(product => {
                            const resultItem = document.createElement('a');
                            resultItem.href = '#';
                            resultItem.classList.add('list-group-item', 'list-group-item-action');
                            resultItem.textContent = `${product.name} (ID: ${product.id}, SKU: ${product.sku})`;
                            resultItem.dataset.productId = product.id;

                            resultItem.addEventListener('click', function (e) {
                                e.preventDefault();
                                const productId = this.dataset.productId;

                                fetch(`/api/products/${productId}`)
                                    .then(response => response.json())
                                    .then(product => {
                                        displayProductDetailsRemove(product);
                                        populateRemoveForm(product);
                                        searchResultsRemove.innerHTML = ''; // Clear search results
                                        searchInputRemove.value = product.name; // Optionally set the search input to the selected product name
                                    })
                                    .catch(error => console.error('Error fetching product details:', error));
                            });

                            searchResultsRemove.appendChild(resultItem);
                        });
                    } else {
                        searchResultsRemove.innerHTML = '<p class="text-muted">No products found.</p>';
                    }
                })
                .catch(error => console.error('Error fetching products:', error));
        } else {
            searchResultsRemove.innerHTML = ''; // Clear results if the input is empty
        }
    });

    function displayProductDetailsRemove(product) {
        // Clear previous product details
        productDetailsContainerRemove.innerHTML = '';

        // Create product details elements
        const details = `
            <div class="card">
                <div class="card-header">
                    Product Details
                </div>
                <div class="card-body">
                    <h5 class="card-title">${product.name} (ID: ${product.id}, SKU: ${product.sku})</h5>
                    <p class="card-text"><strong>Description:</strong> ${product.description}</p>
                    <p class="card-text"><strong>Price:</strong> $${product.price}</p>
                    <p class="card-text"><strong>Stock:</strong> ${product.stock}</p>
                    <p class="card-text"><strong>Category ID:</strong> ${product.category_id}</p>
                    ${product.main_image_url ? `<p class="card-text"><strong>Main Image:</strong> <img src="/${product.main_image_url}" alt="${product.name}" class="img-fluid" style="max-width: 200px;"></p>` : ''}
                </div>
            </div>
        `;

        // Insert product details into the container
        productDetailsContainerRemove.innerHTML = details;
    }

    function populateRemoveForm(product) {
        // Populate the remove form with the product details
        removeForm.elements['id'].value = product.id;
    }

    removeForm.addEventListener('submit', function (e) {
        const confirmed = confirm('Are you sure you want to delete this product? This action cannot be undone.');
        if (!confirmed) {
            e.preventDefault(); // Prevent form submission if not confirmed
        }
    });

});
