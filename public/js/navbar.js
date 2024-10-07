$(document).ready(function() {
    // Load the navbar from the correct path
    $("#navbar-placeholder").load("nav/navbar.html", function() {
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
                    $('#nav-signin').hide();
                    $('#nav-account').show();
                    $('#user-name').text(`${user.first_name}`);
                    loadCartItems();  // Load cart items when user is verified
                } else {
                    localStorage.removeItem('token'); // Remove invalid token
                    $('#nav-signin').show();
                    $('#nav-account').hide();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                localStorage.removeItem('token'); // Remove token if there's an error
                $('#nav-signin').show();
                $('#nav-account').hide();
            });
        } else {
            $('#nav-signin').show();
            $('#nav-account').hide();
        }

        // Ensure dropdown appears on hover and load cart items
        $('.nav-item.dropdown').hover(
            function() {
                if ($(this).find('.dropdown-menu').children().length === 0) {
                    loadCartItems();
                }
                $(this).addClass('show');
                $(this).find('.dropdown-menu').addClass('show');
            },
            function() {
                $(this).removeClass('show');
                $(this).find('.dropdown-menu').removeClass('show');
            }
        );

        // Redirect to checkout page on cart button click
        $('#navbarDropdownCart').click(function(e) {
            e.preventDefault(); // Prevent default anchor behavior
            if (!$(this).next('.dropdown-menu').hasClass('show')) {
                window.location.href = '/checkout';
            }
        });

        // Handle "Proceed to Checkout" button click
        $(document).on('click', '#proceed-to-checkout-btn', function() {
            window.location.href = '/checkout';
        });

        // Handle search form submission
        $('#searchForm').on('submit', function(event) {
            event.preventDefault();
            const query = $('#searchInput').val();
            console.log('Search query:', query); // Log the search query
            if (query) {
                window.location.href = `/search?query=${encodeURIComponent(query)}`;
            }
        });
    });
});
