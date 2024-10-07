$(document).ready(function() {
    const token = localStorage.getItem('token');

    function loadShippingAddresses() {
        if (token) {
            fetch('/api/addresses', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const addresses = data.addresses;
                    let shippingHtml = '';
                    let billingHtml = '';

                    addresses.forEach(address => {
                        const addressHtml = `
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="shippingAddress" id="shipping-${address.id}" value="${address.id}">
                                <label class="form-check-label" for="shipping-${address.id}">
                                    ${address.address_line1}, ${address.city}, ${address.state}, ${address.postal_code}, ${address.country} (${address.address_type})
                                </label>
                            </div>
                        `;
                        if (address.address_type === 'shipping') {
                            shippingHtml += addressHtml;
                        } else if (address.address_type === 'billing') {
                            billingHtml += addressHtml;
                        }
                    });

                    $('#shipping-address-section').html(shippingHtml);
                    $('#billing-address-section').html(billingHtml);
                } else {
                    $('#shipping-address-section').html('<p>Error loading addresses.</p>');
                    $('#billing-address-section').html('<p>Error loading addresses.</p>');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                $('#shipping-address-section').html('<p>Error loading addresses.</p>');
                $('#billing-address-section').html('<p>Error loading addresses.</p>');
            });
        } else {
            window.location.href = '/auth';
        }
    }

    function copyShippingToBilling() {
        if ($('#same-as-shipping').is(':checked')) {
            $('#billing_address_line1').val($('#shipping_address_line1').val());
            $('#billing_address_line2').val($('#shipping_address_line2').val());
            $('#billing_city').val($('#shipping_city').val());
            $('#billing_state').val($('#shipping_state').val());
            $('#billing_postal_code').val($('#shipping_postal_code').val());
            $('#billing_country').val($('#shipping_country').val());
        } else {
            $('#billing_address_line1').val('');
            $('#billing_address_line2').val('');
            $('#billing_city').val('');
            $('#billing_state').val('');
            $('#billing_postal_code').val('');
            $('#billing_country').val('');
        }
    }

    function loadOrderSummary() {
        if (token) {
            fetch('/api/cart', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const cartItems = data.cartItems;
                    let summaryHtml = '';
                    let totalAmount = 0;

                    cartItems.forEach(item => {
                        let itemTotal = item.ProductVariation ? item.ProductVariation.price * item.quantity : item.Product.price * item.quantity;
                        totalAmount += itemTotal;

                        // Image URL
                        const imageUrl = item.Product.main_image_url;

                        summaryHtml += `
                            <div class="card mb-3">
                                <div class="card-body d-flex align-items-center">
                                    <img src="${imageUrl}" alt="${item.Product.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 15px;">
                                    <div>
                                        <p>${item.Product.name} - ${item.ProductVariation ? item.ProductVariation.Options.map(option => option.value).join(', ') : ''} ${item.Attribute ? item.Attribute.attribute_value : ''}</p>
                                        <p>Quantity: ${item.quantity}</p>
                                        <p>Price: $${itemTotal.toFixed(2)}</p>
                                    </div>
                                    <button class="btn btn-sm btn-danger remove-order-item-btn" data-id="${item.id}">Remove</button>
                                </div>
                            </div>
                        `;
                    });

                    summaryHtml += `
                        <div class="card mt-3">
                            <div class="card-body d-flex justify-content-between">
                                <h5>Total:</h5>
                                <h5>$${totalAmount.toFixed(2)}</h5>
                            </div>
                        </div>
                    `;

                    $('#order-summary-section').html(summaryHtml);
                } else {
                    $('#order-summary-section').html('<p>Error loading order summary.</p>');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                $('#order-summary-section').html('<p>Error loading order summary.</p>');
            });
        }
    }

    function placeOrder() {
        const selectedShippingAddressId = $('input[name="shippingAddress"]:checked').val();
        const selectedBillingAddressId = $('input[name="billingAddress"]:checked').val();
        const paymentMethod = $('input[name="paymentMethod"]:checked').val();

        if (!selectedShippingAddressId) {
            alert('Please select a shipping address.');
            return;
        }

        if (!selectedBillingAddressId && !$('#same-as-shipping').is(':checked')) {
            alert('Please select a billing address.');
            return;
        }

        const orderData = {
            shipping_address_id: selectedShippingAddressId,
            billing_address_id: selectedBillingAddressId || selectedShippingAddressId, // Use shipping address if checkbox is checked
            payment_method: paymentMethod
        };

        fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Order placed successfully!');
                window.location.href = '/orderconfirmation';
            } else {
                alert('Error placing order: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error placing order:', error);
            alert('Error placing order: ' + error.message);
        });
    }

    function removeCartItem(cartItemId) {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        fetch(`/api/cart/${cartItemId}`, {
            method: 'DELETE',
            headers: headers
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadOrderSummary(); // Reload the summary after removing an item
            } else {
                alert('Error removing item from cart');
            }
        })
        .catch(error => {
            console.error('Error removing item from cart:', error);
            alert('Error removing item from cart');
        });
    }

    // Event listeners
    $(document).on('click', '.remove-order-item-btn', function() {
        const cartItemId = $(this).data('id');
        removeCartItem(cartItemId);
    });

    $('#same-as-shipping').change(copyShippingToBilling);
    $('#place-order-btn').click(function() {
        placeOrder();
    });

    // Initial load
    loadShippingAddresses();
    loadOrderSummary();
});
