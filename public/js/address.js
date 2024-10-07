$(document).ready(function() {
    const token = localStorage.getItem('token');

    function loadAddresses() {
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
                    let shippingAddressesHtml = '';
                    let billingAddressesHtml = '';

                    if (addresses.length > 0) {
                        addresses.forEach(address => {
                            const addressHtml = `
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <p><strong>Address Line 1:</strong> ${address.address_line1}</p>
                                        <p><strong>Address Line 2:</strong> ${address.address_line2 || ''}</p>
                                        <p><strong>City:</strong> ${address.city}</p>
                                        <p><strong>State:</strong> ${address.state}</p>
                                        <p><strong>Postal Code:</strong> ${address.postal_code}</p>
                                        <p><strong>Country:</strong> ${address.country}</p>
                                        <button class="btn btn-warning edit-address-btn" data-id="${address.id}">Edit</button>
                                        <button class="btn btn-danger delete-address-btn" data-id="${address.id}">Delete</button>

                                        <!-- Edit Form (hidden by default) -->
                                        <div id="edit-form-${address.id}" class="edit-form mt-3" style="display: none;">
                                            <h5>Edit Address</h5>
                                            <form class="edit-address-form" data-id="${address.id}">
                                                <div class="form-group">
                                                    <label for="edit_address_line1">Address Line 1</label>
                                                    <input type="text" class="form-control" id="edit_address_line1" name="address_line1" value="${address.address_line1}" required>
                                                </div>
                                                <div class="form-group">
                                                    <label for="edit_address_line2">Address Line 2</label>
                                                    <input type="text" class="form-control" id="edit_address_line2" name="address_line2" value="${address.address_line2 || ''}">
                                                </div>
                                                <div class="form-group">
                                                    <label for="edit_city">City</label>
                                                    <input type="text" class="form-control" id="edit_city" name="city" value="${address.city}" required>
                                                </div>
                                                <div class="form-group">
                                                    <label for="edit_state">State</label>
                                                    <input type="text" class="form-control" id="edit_state" name="state" value="${address.state}" required>
                                                </div>
                                                <div class="form-group">
                                                    <label for="edit_postal_code">Postal Code</label>
                                                    <input type="text" class="form-control" id="edit_postal_code" name="postal_code" value="${address.postal_code}" required>
                                                </div>
                                                <div class="form-group">
                                                    <label for="edit_country">Country</label>
                                                    <input type="text" class="form-control" id="edit_country" name="country" value="${address.country}" required>
                                                </div>
                                                <button type="submit" class="btn btn-primary">Save Changes</button>
                                                <button type="button" class="btn btn-secondary cancel-edit-btn" data-id="${address.id}">Cancel</button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            `;

                            if (address.address_type === 'shipping') {
                                shippingAddressesHtml += addressHtml;
                            } else if (address.address_type === 'billing') {
                                billingAddressesHtml += addressHtml;
                            }
                        });
                    } else {
                        shippingAddressesHtml = '<p>No shipping addresses found.</p>';
                        billingAddressesHtml = '<p>No billing addresses found.</p>';
                    }

                    $('#shipping-address-list').html(shippingAddressesHtml);
                    $('#billing-address-list').html(billingAddressesHtml);
                } else {
                    $('#shipping-address-list').html('<p>Error loading addresses.</p>');
                    $('#billing-address-list').html('<p>Error loading addresses.</p>');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                $('#shipping-address-list').html('<p>Error loading addresses.</p>');
                $('#billing-address-list').html('<p>Error loading addresses.</p>');
            });
        } else {
            window.location.href = '/auth';
        }
    }

    // Load addresses when the page loads
    loadAddresses();

    // Handle address form submission
    $('#add-address-form').on('submit', function(event) {
        event.preventDefault();
        const formData = {
            address_line1: $('#address_line1').val(),
            address_line2: $('#address_line2').val(),
            city: $('#city').val(),
            state: $('#state').val(),
            postal_code: $('#postal_code').val(),
            country: $('#country').val(),
            address_type: $('input[name="address_type"]:checked').val()
        };

        fetch('/api/addresses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if ($('#same-as-shipping').is(':checked') && formData.address_type === 'shipping') {
                    formData.address_type = 'billing';
                    fetch('/api/addresses', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(formData)
                    })
                    .then(billingResponse => billingResponse.json())
                    .then(billingData => {
                        if (billingData.success) {
                            loadAddresses(); // Reload the addresses after adding a new one
                            alert('Address added successfully!');
                            $('#add-address-form')[0].reset(); // Clear the form
                        } else {
                            alert('Error adding billing address: ' + billingData.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error adding billing address:', error);
                        alert('Error adding billing address: ' + error.message);
                    });
                } else {
                    loadAddresses(); // Reload the addresses after adding a new one
                    alert('Address added successfully!');
                    $('#add-address-form')[0].reset(); // Clear the form
                }
            } else {
                alert('Error adding address: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error adding address:', error);
            alert('Error adding address: ' + error.message);
        });
    });

    // Handle edit button click
    $(document).on('click', '.edit-address-btn', function() {
        const addressId = $(this).data('id');
        $(`#edit-form-${addressId}`).slideDown();
    });

    // Handle cancel edit button click
    $(document).on('click', '.cancel-edit-btn', function() {
        const addressId = $(this).data('id');
        $(`#edit-form-${addressId}`).slideUp();
    });

    // Handle edit address form submission
    $(document).on('submit', '.edit-address-form', function(event) {
        event.preventDefault();
        const addressId = $(this).data('id');
        const formData = {
            address_line1: $(this).find('#edit_address_line1').val(),
            address_line2: $(this).find('#edit_address_line2').val(),
            city: $(this).find('#edit_city').val(),
            state: $(this).find('#edit_state').val(),
            postal_code: $(this).find('#edit_postal_code').val(),
            country: $(this).find('#edit_country').val(),
            address_type: $('input[name="address_type"]:checked').val()
        };

        fetch(`/api/addresses/${addressId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadAddresses(); // Reload the addresses after editing
                alert('Address updated successfully!');
            } else {
                alert('Error updating address: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error updating address:', error);
            alert('Error updating address: ' + error.message);
        });
    });

    // Handle delete address button click
    $(document).on('click', '.delete-address-btn', function() {
        const addressId = $(this).data('id');
        fetch(`/api/addresses/${addressId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadAddresses(); // Reload the addresses after deleting
                alert('Address deleted successfully!');
            } else {
                alert('Error deleting address: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error deleting address:', error);
            alert('Error deleting address: ' + error.message);
        });
    });
});
