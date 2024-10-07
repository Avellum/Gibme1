$(document).ready(function() {
    const token = localStorage.getItem('token');

    function loadRecentOrder() {
        if (token) {
            fetch('/api/orders/recent', { // Assuming you have an endpoint for fetching the most recent order
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    const order = data.order; // Assuming the response contains the most recent order
                    let orderHtml = '';
                    let orderItemsHtml = '';

                    if (order) {
                        order.OrderItems.forEach(item => {
                            orderItemsHtml += `
                                <div class="card mb-3">
                                    <div class="card-body d-flex align-items-center">
                                        <img src="${item.Product.main_image_url}" alt="${item.Product.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 15px;">
                                        <div>
                                            <p>${item.Product.name} - ${item.ProductVariation ? item.ProductVariation.Options.map(option => option.value).join(', ') : ''} ${item.Attribute ? item.Attribute.attribute_value : ''}</p>
                                            <p>Quantity: ${item.quantity}</p>
                                            <p>Price: $${item.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            `;
                        });

                        orderHtml = `
                            <div class="card mt-3">
                                <div class="card-header">
                                    <h5>Order #${order.id} - ${new Date(order.created_at).toLocaleDateString()}</h5>
                                </div>
                                <div class="card-body">
                                    ${orderItemsHtml}
                                    <h6>Total: $${order.total_amount.toFixed(2)}</h6>
                                    <h6>Status: ${order.order_status}</h6>
                                </div>
                            </div>
                        `;
                    } else {
                        orderHtml = '<p>No recent order found.</p>';
                    }

                    $('#order-confirmation-section').html(orderHtml);
                } else {
                    $('#order-confirmation-section').html('<p>Error loading recent order.</p>');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                $('#order-confirmation-section').html('<p>Error loading recent order.</p>');
            });
        } else {
            window.location.href = '/auth';
        }
    }

    // Load recent order on page load
    loadRecentOrder();
});
