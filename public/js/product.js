$(document).ready(function () {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    console.log('Product ID:', productId); // Log the product ID for debugging

    // Fetch product details from API
    $.get(`/api/products/${productId}`, function (product) {
        console.log('API response:', product); // Log the API response for debugging

        if (product) {
            let indicatorsHtml = '';
            let imagesHtml = '';

            // Add the main image as the first image
            if (product.main_image_url) {
                console.log('Main image URL:', product.main_image_url); // Debug log for main image
                indicatorsHtml += `<li data-target="#productCarousel" data-slide-to="0" class="active"></li>`;
                imagesHtml += `<div class="carousel-item active"><img src="/${product.main_image_url}" class="d-block w-100" alt="${product.name}"></div>`;
            }

            // Add additional images
            if (product.images && product.images.length > 0) {
                product.images.forEach((image, index) => {
                    console.log(`Adding image ${index + 1}:`, image.image_url); // Debug log for additional images
                    indicatorsHtml += `<li data-target="#productCarousel" data-slide-to="${index + 1}" class=""></li>`;
                    imagesHtml += `<div class="carousel-item"><img src="/${image.image_url}" class="d-block w-100" alt="${product.name}"></div>`;
                });
            } else if (!product.main_image_url) {
                console.log('No main image, showing placeholder image'); // Debug log for placeholder image
                imagesHtml = `<div class="carousel-item active"><img src="/images/placeholder.jpg" class="d-block w-100" alt="No image available"></div>`;
            }

            // Create dropdowns for variations
            let variationHtml = '';
            const variationTypes = {};

            // Populate variations and map variation-specific attributes
            product.Variations.forEach(variation => {
                console.log('Processing variation:', variation); // Debug log for each variation
                variation.Options.forEach(option => {
                    if (!variationTypes[option.variation_type]) {
                        variationTypes[option.variation_type] = new Map();
                    }
                    variationTypes[option.variation_type].set(option.value, {
                        sku: variation.sku,
                        price: variation.price,
                        stock: variation.stock,
                        attributes: variation.Attributes || [] // Store variation-specific attributes
                    });
                });
            });

            // Log variationTypes for debugging
            console.log('Variation Types:', variationTypes); // Debug log for all variation types

            // Create variation dropdowns
            for (const [type, valuesMap] of Object.entries(variationTypes)) {
                console.log(`Creating dropdown for variation type: ${type}`); // Debug log for dropdown creation
                variationHtml += `
                    <div class="form-group">
                        <label for="${type}">${type}:</label>
                        <select class="form-control variation-select" id="${type}" name="${type}" data-type="${type}">
                            <option value="">Select ${type}</option>
                            ${[...valuesMap.keys()].map(value => {
                                const valueObj = valuesMap.get(value);
                                console.log(`Adding option for ${type}: ${value}`, valueObj); // Debug log for each option
                                return `<option value="${value}" data-sku="${valueObj.sku}" data-price="${valueObj.price}" data-stock="${valueObj.stock}" data-attributes='${JSON.stringify(valueObj.attributes)}'>${value}</option>`;
                            }).join('')}
                        </select>
                    </div>
                `;
            }

            // Create product-level attribute dropdowns (always shown for base product)
            let productAttributeHtml = '';
            const productAttributeTypes = {};

            if (product.Attributes && product.Attributes.length > 0) {
                product.Attributes.forEach(attribute => {
                    console.log('Processing product attribute:', attribute); // Debug log for each attribute
                    if (!productAttributeTypes[attribute.attribute_type]) {
                        productAttributeTypes[attribute.attribute_type] = [];
                    }
                    productAttributeTypes[attribute.attribute_type].push({
                        value: attribute.attribute_value,
                        id: attribute.id,
                        stock: attribute.stock
                    });
                });

                for (const [type, values] of Object.entries(productAttributeTypes)) {
                    console.log(`Creating dropdown for attribute type: ${type}`); // Debug log for attribute dropdown creation
                    productAttributeHtml += `
                        <div class="form-group product-attribute-group">
                            <label for="attribute-${type}">${type}:</label>
                            <select class="form-control attribute-select" id="attribute-${type}" data-type="${type}">
                                <option value="">Select ${type}</option>
                                ${values.map(item => `
                                    <option value="${item.value}" data-attribute-id="${item.id}" data-stock="${item.stock}">${item.value}</option>
                                `).join('')}
                            </select>
                        </div>
                    `;
                }
            }

            const productHtml = `
                <div class="row">
                    <div class="col-md-6">
                        <div id="productCarousel" class="carousel slide" data-ride="carousel">
                            <ol class="carousel-indicators">${indicatorsHtml}</ol>
                            <div class="carousel-inner">${imagesHtml}</div>
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
                        <h1 id="product-name">${product.name}</h1> <!-- Here is the product name to update -->
                        <p>${product.description}</p>
                        <h4 id="product-price">Base Price: $${product.price}</h4>
                        <h5 id="product-stock">Stock: ${product.stock}</h5>
                        ${variationHtml}
                        <div id="attribute-section">${productAttributeHtml}</div> <!-- Initially show product attributes -->
                        <div class="form-group">
                            <label for="quantity">Quantity:</label>
                            <input type="number" class="form-control" id="quantity" name="quantity" value="1" min="1" max="${product.stock}">
                        </div>
                        <button class="btn btn-primary" id="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
                        <div id="add-to-cart-message" class="mt-2 text-success" style="display: none;">Item added to cart</div>
                    </div>
                </div>
            `;
            $('#product-details').html(productHtml);

            // Update product details and variation-specific attributes based on the selected variation or attribute
            function updateProductDetails() {
                const selectedVariations = [];
                const selectedAttributes = [];
                let selectedSku, selectedPrice, selectedStock, variationAttributes = [];

                console.log('Updating product details...'); // Debug log for updating details

                // Capture selected variations first
                $('.variation-select').each(function () {
                    const selectedValue = $(this).val();
                    if (selectedValue) {
                        selectedVariations.push(selectedValue);
                        selectedSku = $(this).find('option:selected').data('sku');
                        selectedPrice = $(this).find('option:selected').data('price');
                        selectedStock = $(this).find('option:selected').data('stock');
                        variationAttributes = $(this).find('option:selected').data('attributes') || []; // Get variation-specific attributes
                        console.log(`Selected Variation: ${selectedValue}`, { selectedSku, selectedPrice, selectedStock, variationAttributes }); // Debug selected variation details
                    }
                });

                // If no variations are selected, use the base product price and stock
                if (!selectedPrice || !selectedStock) {
                    selectedPrice = product.price;
                    selectedStock = product.stock;
                    console.log('No variation selected, using base price and stock');
                }

                // Then capture selected attributes
                $('.attribute-select').each(function () {
                    const selectedValue = $(this).val();
                    if (selectedValue) {
                        const attributeId = $(this).find('option:selected').data('attribute-id');
                        selectedAttributes.push({
                            type: $(this).attr('data-type'),
                            value: selectedValue,
                            id: attributeId
                        });
                        console.log('Selected Attribute:', { type: $(this).attr('data-type'), value: selectedValue, id: attributeId }); // Debug log for each selected attribute
                    }
                });

                // If there are variation-specific attributes, display them, otherwise clear product attributes
                if (variationAttributes.length > 0) {
                    let attributeHtml = '';
                    variationAttributes.forEach(attr => {
                        attributeHtml += `
                            <div class="form-group">
                                <label for="attribute-${attr.attribute_type}">${attr.attribute_type}:</label>
                                <select class="form-control attribute-select" id="attribute-${attr.attribute_type}" data-type="${attr.attribute_type}">
                                    <option value="">Select ${attr.attribute_type}</option>
                                    <option value="${attr.attribute_value}" data-stock="${attr.stock}">${attr.attribute_value}</option>
                                </select>
                            </div>
                        `;
                        console.log('Displaying variation-specific attributes:', attr); // Debug log for variation-specific attributes
                    });
                    $('#attribute-section').html(attributeHtml); // Replace with variation-specific attributes
                } else if (selectedVariations.length > 0) {
                    // Clear attributes for variations with no attributes
                    $('#attribute-section').html('');
                } else {
                    // If no variation attributes are available, restore base product attributes
                    $('#attribute-section').html(productAttributeHtml);
                }

                // Generate the combined name for the product, including variations and attributes
                const variationPart = selectedVariations.length > 0 ? ` - ${selectedVariations.join(', ')}` : '';
                const attributePart = selectedAttributes.map(attr => attr.value).join(', ');
                const combinedName = `${product.name}${variationPart}${attributePart ? `, ${attributePart}` : ''}`;
                console.log('Combined Product Name:', combinedName); // Debug log for combined product name

                // Update the product name with selected variations and attributes
                $('#product-name').text(combinedName);
                $('#product-price').text(`Price: $${selectedPrice}`);
                $('#product-stock').text(`Stock: ${selectedStock}`);
                $('#quantity').attr('max', selectedStock);
            }

            // Handle variation and attribute selection changes
            $(document).on('change', '.variation-select, .attribute-select', function () {
                console.log('Selection changed, updating product details...'); // Debug log for selection change
                updateProductDetails();
            });

            $('#add-to-cart-btn').click(function () {
                const productId = $(this).data('product-id');
                const quantity = parseInt($('#quantity').val());
                const selectedVariations = {};
                const selectedAttributes = {};

                // Collect variations
                $('.variation-select').each(function () {
                    const selectedValue = $(this).val();
                    if (selectedValue) {
                        selectedVariations[$(this).attr('data-type')] = selectedValue;
                        console.log('Selected Variation for Cart:', { type: $(this).attr('data-type'), value: selectedValue }); // Debug log for variation sent to cart
                    }
                });

                // Capture product or variation attributes
  $('.attribute-select').each(function () {
      const selectedValue = $(this).val();
      const attributeId = $(this).find('option:selected').data('attribute-id'); // Ensure the attribute ID is present
      if (selectedValue && attributeId) { // Only proceed if both value and ID exist
          selectedAttributes[$(this).attr('data-type')] = { value: selectedValue, id: attributeId };
          console.log('Selected Attribute for Cart:', { type: $(this).attr('data-type'), value: selectedValue, id: attributeId }); // Debug log for attributes sent to cart
      }
  });

                const token = localStorage.getItem('token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                console.log('Submitting Add to Cart Request:', { productId, quantity, selectedVariations, selectedAttributes }); // Debug log before submitting cart request

                $.ajax({
                    url: '/api/cart',
                    type: 'POST',
                    headers: { 'Content-Type': 'application/json', ...headers },
                    data: JSON.stringify({ productId, quantity, selectedVariations, selectedAttributes }),
                    success: function (response) {
                        console.log('Item added to cart successfully:', response); // Debug log for successful cart addition
                        $('#add-to-cart-message').fadeIn().delay(1000).fadeOut();
                        loadCartItems(); // Refresh cart
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error('Error adding item to cart:', errorThrown); // Debug log for cart addition error
                        alert('Error adding item to cart');
                    }
                });
            });
        } else {
            console.log('Product not found'); // Debug log for product not found
            $('#product-details').html('<p>Product not found.</p>');
        }
    }).fail(function () {
        console.error('Error fetching product details'); // Debug log for product fetch error
        $('#product-details').html('<p>Error fetching product details.</p>');
    });
});
