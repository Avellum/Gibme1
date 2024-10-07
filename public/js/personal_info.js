$(document).ready(function() {
    const token = localStorage.getItem('token');

    if (token) {
        // Fetch customer details
        fetch('/api/customers/details', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const user = data.customer;

                // Display current customer details at the top of the page
                const detailsHtml = `
                    <h3>Current Information</h3>
                    <p><strong>Name:</strong> ${user.first_name} ${user.last_name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Phone:</strong> ${user.phone_number}</p>
                `;
                $('#current-info').html(detailsHtml);

                // Pre-fill form fields with current details for editing
                $('#firstName').val(user.first_name);
                $('#lastName').val(user.last_name);
                $('#email').val(user.email);
                $('#phoneNumber').val(user.phone_number);
            } else {
                alert('Failed to load user details.');
            }
        })
        .catch(error => {
            console.error('Error fetching user details:', error);
            window.location.href = '/auth'; // Redirect to auth page if there's an error
        });
    } else {
        window.location.href = '/auth'; // Redirect to auth page if no token found
    }

    // Handle form submission for updating personal information
    $('#personal-info-form').on('submit', function(event) {
        event.preventDefault();

        const firstName = $('#firstName').val();
        const lastName = $('#lastName').val();
        const email = $('#email').val();
        const phoneNumber = $('#phoneNumber').val();

        const formData = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone_number: phoneNumber
        };

        fetch('/api/customers/update', {
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
                alert('Personal information updated successfully!');
                location.reload(); // Reload the page to show updated details
            } else {
                alert('Error updating personal information: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error updating personal information:', error);
            alert('Error updating personal information: ' + error.message);
        });
    });
});
