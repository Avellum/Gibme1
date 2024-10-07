$(document).ready(function() {
    // Fetch categories and populate the select options
    $.get('/api/categories', function(categories) {
        const categorySelect = $('#productCategory');
        categories.forEach(category => {
            categorySelect.append(new Option(category.name, category.id));
        });
    }).fail(function() {
        console.error('Error loading categories.');
    });

    // Handle product form submission
    $('#productForm').on('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        $.ajax({
            url: '/api/products',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function() {
                $('#productConfirmation').show().delay(3000).fadeOut();
                $('#productForm')[0].reset();
            },
            error: function() {
                console.error('Error saving product.');
            }
        });
    });

    // Handle image form submission
    $('#imageForm').on('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        $.ajax({
            url: '/api/products/images',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function() {
                $('#imageConfirmation').show().delay(3000).fadeOut();
                $('#imageForm')[0].reset();
            },
            error: function() {
                console.error('Error uploading images.');
            }
        });
    });

    // Handle variation form submission
    $('#variationForm').on('submit', function(e) {
        e.preventDefault();
        const formData = $(this).serialize();
        $.post('/api/products/variations', formData, function() {
            $('#variationConfirmation').show().delay(3000).fadeOut();
            $('#variationForm')[0].reset();
        }).fail(function() {
            console.error('Error adding variation.');
        });
    });

    // Handle promotion form submission
    $('#promotionForm').on('submit', function(e) {
        e.preventDefault();
        const formData = $(this).serialize();
        $.post('/api/products/promotions', formData, function() {
            $('#promotionConfirmation').show().delay(3000).fadeOut();
            $('#promotionForm')[0].reset();
        }).fail(function() {
            console.error('Error adding promotion.');
        });
    });

    // Handle delete product form submission
    $('#deleteProductForm').on('submit', function(e) {
        e.preventDefault();
        const productId = $('#deleteProductId').val();
        const productName = $('#deleteProductName').val();

        $.ajax({
            url: '/api/products',
            type: 'DELETE',
            data: { product_id: productId, product_name: productName },
            success: function() {
                $('#deleteConfirmation').show().delay(3000).fadeOut();
                $('#deleteProductForm')[0].reset();
            },
            error: function() {
                console.error('Error deleting product.');
            }
        });
    });
});
