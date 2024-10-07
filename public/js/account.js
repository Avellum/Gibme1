$(document).ready(function() {
    const token = localStorage.getItem('token');
    if (token) {
        fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const user = data.user;
                const detailsHtml = `
                    <p><strong>Name:</strong> ${user.first_name} ${user.last_name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Phone:</strong> ${user.phone_number}</p>
                `;
                $('#account-details').html(detailsHtml);

                // Fetch and display address details
                fetch('/api/addresses', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(response => response.json())
                .then(addressData => {
                    if (addressData.success) {
                        const address = addressData.addresses[0] || {}; // Assuming one address for simplicity
                        const addressHtml = `
                            <p><strong>Address Line 1:</strong> ${address.address_line1 || ''}</p>
                            <p><strong>Address Line 2:</strong> ${address.address_line2 || ''}</p>
                            <p><strong>City:</strong> ${address.city || ''}</p>
                            <p><strong>State:</strong> ${address.state || ''}</p>
                            <p><strong>Postal Code:</strong> ${address.postal_code || ''}</p>
                            <p><strong>Country:</strong> ${address.country || ''}</p>
                        `;
                        $('#address-details').html(addressHtml);
                    } else {
                        $('#address-details').html('<p>No address found.</p>');
                    }
                });
            } else {
                window.location.href = '/auth';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            window.location.href = '/auth';
        });
    } else {
        window.location.href = '/auth';
    }

    // Logout button event handler is now directly in account.html, so it is removed from here

    $('#edit-address-form').on('submit', function(event) {
        event.preventDefault();
        const formData = {
            address_line1: $('#address_line1').val(),
            address_line2: $('#address_line2').val(),
            city: $('#city').val(),
            state: $('#state').val(),
            postal_code: $('#postal_code').val(),
            country: $('#country').val()
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
                alert('Address updated successfully!');
                location.reload();
            } else {
                alert('Error updating address: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error updating address:', error);
            alert('Error updating address: ' + error.message);
        });
    });
});
