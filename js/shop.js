// Fallback authentication check in case main.js is not loaded
if (typeof checkAuth !== 'function') {
    function checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'customer-login.html';
            return false;
        }
        return true;
    }
}

// Check authentication
if (!checkAuth()) {
    window.location.href = 'customer-login.html';
}

// Product data (this would come from an API)
const products = [
    {
        id: 1,
        name: 'Adjustable Base Jack',
        price: 60.00,
        image: 'images/Adjustable-Base-Jack.jpg',
        description: 'Provides height adjustment and stability for scaffolding structures.',
        type: 'rent'
    },
    {
        id: 2,
        name: 'Catwalk',
        price: 200.00,
        image: 'images/Scaffolding-Catwalk.jpg',
        description: 'A sturdy walkway for safe movement on scaffolding.',
        type: 'rent'
    },
    {
        id: 3,
        name: 'Adjustable U-Head',
        price: 60.00,
        image: 'images/Adjustable-U-Head.png',
        description: 'Supports beams with adjustable height for precise leveling.',
        type: 'rent'
    },
    {
        id: 4,
        name: 'Swivel Clamp',
        price: 20.00,
        image: 'images/Swivel-Clamp.jpg',
        description: 'Connects scaffold tubes at various angles for flexibility.',
        type: 'rent'
    },
    {
        id: 5,
        name: 'Ladder',
        price: 300.00,
        image: 'images/Ladder.jpg',
        description: 'Ensures safe access to different scaffold levels.',
        type: 'rent'
    },
    {
        id: 6,
        name: 'Caster Wheel',
        price: 100.00,
        image: 'images/Caster-Wheel.jpg',
        description: 'Adds mobility to scaffolding for easy repositioning.',
        type: 'rent'
    },
    {
        id: 7,
        name: 'Shoring Jack',
        price: 200.00,
        image: 'images/Shoring-Jack.jpg',
        description: 'Supports heavy loads in construction and formwork.',
        type: 'rent'
    }
];

let filteredProducts = [...products];

// Filter products by category
function filterByCategory(category) {
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });

    filteredProducts = category === 'all' 
        ? [...products]
        : products.filter(product => product.type === category);

    updatePriceRange();
    renderProducts();
}

// Filter products by price range
function filterByPrice() {
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;

    filteredProducts = products.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
    );

    renderProducts();
}

// Update price range inputs
function updatePriceRange() {
    const prices = products.map(product => product.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const priceRange = document.getElementById('priceRange');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');

    priceRange.min = minPrice;
    priceRange.max = maxPrice;
    priceRange.value = maxPrice;

    minPriceInput.value = minPrice.toFixed(2);
    maxPriceInput.value = maxPrice.toFixed(2);
}

// Render products
function renderProducts() {
    const productsGrid = document.querySelector('.products-grid');
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <p>No products found matching your criteria.</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">${formatCurrency(product.price)}</p>
                <p class="type">For ${product.type}</p>
                <p class="description">${product.description}</p>
                <button class="add-to-cart" data-product-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners to Add to Cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });
}

// Handle add to cart
function handleAddToCart(event) {
    const button = event.currentTarget;
    const productId = parseInt(button.dataset.productId);
    const product = products.find(p => p.id === productId);

    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }

    // Disable button temporarily
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

    try {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showNotification('Product added to cart!');

        // Reset button after successful addition
        setTimeout(() => {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
        }, 500);
    } catch (error) {
        showNotification('Failed to add product to cart', 'error');
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set up price range filter
    const priceRange = document.getElementById('priceRange');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');

    priceRange.addEventListener('input', (e) => {
        maxPriceInput.value = parseFloat(e.target.value).toFixed(2);
        filterByPrice();
    });

    minPriceInput.addEventListener('change', filterByPrice);
    maxPriceInput.addEventListener('change', filterByPrice);

    // Set up category filter
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterByCategory(button.dataset.category);
        });
    });

    // Initial render
    updatePriceRange();
    renderProducts();
}); 