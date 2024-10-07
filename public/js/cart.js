//cart.js

function loadCartItems() {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    fetch('/api/cart', {
        method: 'GET',
        headers: headers
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const cartItems = data.cartItems;
            if (cartItems.length > 0) {
                let cartHtml = '';
                let subtotal = 0;

                cartItems.forEach(item => {
                    let productName = item.Product.name;
                    let totalPrice;

                    // Handle product variations
                    if (item.ProductVariation) {
                        const variationNames = item.ProductVariation.Options.map(option => option.value).join(', ');
                        productName += ` - ${variationNames}`;
                        totalPrice = (item.ProductVariation.price * item.quantity).toFixed(2);
                    } else {
                        totalPrice = (item.Product.price * item.quantity).toFixed(2);
                    }

                    // Handle product attributes
                    let attributes = '';
                    if (item.ProductAttribute && item.ProductAttribute.attribute_value) {
                        attributes += `, ${item.ProductAttribute.attribute_value}`;
                    }

                    // Handle variation attributes
                    if (item.VariationAttribute && item.VariationAttribute.attribute_value) {
                        attributes += `, ${item.VariationAttribute.attribute_value}`;
                    }

                    // Add attributes to the product name
                    productName += attributes;

                    subtotal += parseFloat(totalPrice);
                    cartHtml += `
                        <a href="/product?id=${item.Product.id}" class="text-decoration-none text-dark">
                            <div class="card mb-3">
                                <div class="card-body cart-item">
                                    <img src="${item.Product.main_image_url}" alt="${productName}">
                                    <div class="details">
                                        <div>${productName}</div>
                                        <div>Qt.: ${item.quantity}</div>
                                        <div>Total: $${totalPrice}</div>
                                    </div>
                                    <button class="btn btn-sm btn-danger remove-cart-item" data-id="${item.id}">Remove</button>
                                </div>
                            </div>
                        </a>
                    `;
                });

                // Add the subtotal HTML
                const subtotalHtml = `
                    <div class="subtotal mb-2">
                        <h5>Subtotal: $${subtotal.toFixed(2)}</h5>
                    </div>
                `;

                // Add the "Proceed to Checkout" button HTML
                const checkoutButtonHtml = `
                    <button class="btn btn-primary btn-block" id="proceed-to-checkout-btn">Proceed to Checkout</button>
                `;

                $('#cart-items').html(cartHtml + subtotalHtml + checkoutButtonHtml);
            } else {
                $('#cart-items').html('<p>No items</p>');
            }
        } else {
            $('#cart-items').html('<p>Error loading cart items</p>');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        $('#cart-items').html('<p>Error loading cart items</p>');
    });
}

function removeCartItem(cartItemId) {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    fetch(`/api/cart/${cartItemId}`, {
        method: 'DELETE',
        headers: headers
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadCartItems();
        } else {
            alert('Error removing item from cart');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error removing item from cart');
    });
}

// Handle cart item removal
$(document).on('click', '.remove-cart-item', function(event) {
    event.preventDefault();
    const cartItemId = $(this).data('id');
    removeCartItem(cartItemId);
});

// Load cart items on document ready
$(document).ready(function() {
    loadCartItems();

    // Show cart items on hover
    $('.nav-item.dropdown').hover(
        function() {
            loadCartItems();
            $(this).addClass('show');
            $(this).find('.dropdown-menu').addClass('show');
        },
        function() {
            $(this).removeClass('show');
            $(this).find('.dropdown-menu').removeClass('show');
        }
    );

    // Handle "Proceed to Checkout" button click
    $(document).on('click', '#proceed-to-checkout-btn', function() {
        window.location.href = '/checkout';
    });
});
