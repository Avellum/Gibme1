$(document).ready(function() {
    function handleResponse(selector, successMessage, errorMessage, response) {
        if (response.success) {
            $(selector).text(successMessage).removeClass('alert-danger').addClass('alert alert-success');
        } else {
            const errorMessageToShow = response.message || errorMessage;
            $(selector).text(errorMessageToShow).removeClass('alert-success').addClass('alert alert-danger');
        }
    }

    // Fetch Google Client ID from the server and initialize Google Sign-In
    fetch('/api/config/google-client-id')
        .then(response => response.json())
        .then(data => {
            const googleClientId = data.clientId;

            google.accounts.id.initialize({
                client_id: googleClientId,
                callback: handleCredentialResponse
            });

            // Render the Google Sign-In button as soon as the client ID is available
            google.accounts.id.renderButton(
                document.getElementById("g_id_signin_button"),
                { theme: "outline", size: "large" }
            );
        })
        .catch(error => {
            console.error('Error fetching Google Client ID:', error);
        });

    // Handle Sign In form submission
    $('#signInForm').on('submit', function(event) {
        event.preventDefault();
        const email = $('#signInEmail').val();
        const password = $('#signInPassword').val();

        $.post('/api/auth/signin', { email, password })
            .done(function(response) {
                handleResponse('#signInMessage', 'Sign In successful!', 'Sign In failed. Please try again.', response);
                if (response.success) {
                    // Save the token in localStorage
                    localStorage.setItem('token', response.token);
                    // Redirect to the account page
                    setTimeout(() => window.location.href = '/', 1000);
                }
            })
            .fail(function(error) {
                const errorMessage = error.responseJSON ? error.responseJSON.message : 'Sign In failed. Please try again.';
                $('#signInMessage').text(errorMessage).addClass('alert alert-danger');
            });
    });

    // Handle Sign Up form submission
    $('#signUpForm').on('submit', function(event) {
        event.preventDefault();
        const firstName = $('#signUpFirstName').val();
        const lastName = $('#signUpLastName').val();
        const email = $('#signUpEmail').val();
        const password = $('#signUpPassword').val();
        const phoneNumber = $('#signUpPhoneNumber').val();

        $.post('/api/auth/signup', { first_name: firstName, last_name: lastName, email, password, phone_number: phoneNumber })
            .done(function(response) {
                $('#signUpMessage').text('Sign Up successful! Redirecting to sign in...').removeClass('alert-danger').addClass('alert alert-success');
                setTimeout(() => window.location.href = '/auth', 1500); // Redirect after 1.5 seconds
            })
            .fail(function(error) {
                const errorMessage = error.responseJSON ? error.responseJSON.message : 'Sign Up failed. Please try again.';
                $('#signUpMessage').text(errorMessage).addClass('alert alert-danger');
            });
    });

    // Handle Google Sign-In response
    function handleCredentialResponse(response) {
        console.log('Google Sign-In response:', response);
        const id_token = response.credential;
        $.post('/api/auth/google', { id_token: id_token })
            .done(function(response) {
                console.log('Google Sign-In success:', response);
                handleResponse('#signInMessage', 'Google Sign-In successful!', 'Google Sign-In failed. Please try again.', response);
                if (response.success) {
                    // Save the token in localStorage
                    localStorage.setItem('token', response.token);
                    // Redirect to the account page
                    window.location.href = '/';
                }
            })
            .fail(function(error) {
                const errorMessage = error.responseJSON ? error.responseJSON.message : 'Google Sign-In failed. Please try again.';
                console.error('Google Sign-In error:', error.responseJSON || error);
                $('#signInMessage').text(errorMessage).addClass('alert alert-danger');
            });
    }
});
