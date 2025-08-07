// Load header and footer components
document.addEventListener('DOMContentLoaded', function() {
    loadComponents();
    initializeEventListeners();
    loadIndianProducts();
});

// Load header and footer components
async function loadComponents() {
    try {
        // Load header
        const headerResponse = await fetch('components/header.html');
        const headerHtml = await headerResponse.text();
        document.getElementById('header-placeholder').innerHTML = headerHtml;
        
        // Load footer
        const footerResponse = await fetch('components/footer.html');
        const footerHtml = await footerResponse.text();
        document.getElementById('footer-placeholder').innerHTML = footerHtml;
        
        // Initialize header event listeners after loading
        initializeHeaderEvents();
    } catch (error) {
        console.error('Error loading components:', error);
    }
}

// Initialize all event listeners
function initializeEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
    }
    
    // Filter functionality
    const categoryFilter = document.getElementById('category-filter');
    const locationFilter = document.getElementById('location-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    
    if (locationFilter) {
        locationFilter.addEventListener('change', applyFilters);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', applyFilters);
    }
    
    // Load more button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreProducts);
    }
    
    // Category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.querySelector('h3').textContent;
            filterByCategory(category);
        });
    });
}

// Initialize header event listeners
function initializeHeaderEvents() {
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            alert('Login functionality coming soon!');
        });
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', function() {
            alert('Sign up functionality coming soon!');
        });
    }
}

// Load Indian products from JSON file
async function loadIndianProducts() {
    try {
        const response = await fetch('data/sampledata.json');
        const indianProducts = await response.json();
        
        if (indianProducts && indianProducts.length > 0) {
            // Store products globally
            window.allProducts = indianProducts;
            window.displayedProducts = 8; // Show first 8 products initially
            
            displayProducts(indianProducts.slice(0, 8));
        } else {
            console.error('No products found in JSON file');
            showNotification('No products available at the moment.', 'warning');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error loading products. Please try again later.', 'error');
    }
}

// Display products in grid
function displayProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 cursor-pointer hover:transform hover:-translate-y-2 hover:shadow-2xl';
        productCard.onclick = () => viewProduct(product.id);
        
        productCard.innerHTML = `
            <div class="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 text-4xl">
                <i class="fas fa-image"></i>
            </div>
            <div class="p-6">
                <h3 class="text-xl font-semibold mb-2 text-gray-800">${product.name}</h3>
                <div class="text-2xl font-bold text-green-600 mb-4">₹${product.price.toLocaleString('en-IN')}</div>
                <div class="text-gray-600 text-sm flex items-center gap-2 mb-2">
                    <i class="fas fa-map-marker-alt"></i>
                    ${product.location}
                </div>
                <div class="text-gray-500 text-xs flex items-center gap-2">
                    <i class="fas fa-user"></i>
                    ${product.seller}
                </div>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
}

// Search functionality
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.toLowerCase().trim();
    
    if (!query) {
        displayProducts(window.allProducts.slice(0, window.displayedProducts));
        return;
    }
    
    const filteredProducts = window.allProducts.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.location.toLowerCase().includes(query)
    );
    
    displayProducts(filteredProducts);
}

// Apply filters
function applyFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const locationFilter = document.getElementById('location-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    let filteredProducts = [...window.allProducts];
    
    // Category filter
    if (categoryFilter.value) {
        filteredProducts = filteredProducts.filter(product => 
            product.category === categoryFilter.value
        );
    }
    
    // Location filter
    if (locationFilter.value) {
        filteredProducts = filteredProducts.filter(product => 
            product.location.includes(locationFilter.value)
        );
    }
    
    // Sort products
    switch (sortFilter.value) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'recent':
        default:
            filteredProducts.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted));
            break;
    }
    
    displayProducts(filteredProducts);
}

// Filter by category
function filterByCategory(category) {
    const categoryFilter = document.getElementById('category-filter');
    categoryFilter.value = category;
    applyFilters();
}

// Load more products
function loadMoreProducts() {
    const currentCount = window.displayedProducts;
    const newCount = Math.min(currentCount + 4, window.allProducts.length);
    window.displayedProducts = newCount;
    
    displayProducts(window.allProducts.slice(0, newCount));
    
    // Hide load more button if all products are shown
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (newCount >= window.allProducts.length) {
        loadMoreBtn.style.display = 'none';
    }
}

// View product details
function viewProduct(productId) {
    // Store selected product ID
    localStorage.setItem('selectedProduct', productId);
    
    // Redirect to product detail page
    window.location.href = `item.html?id=${productId}`;
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-5 right-5 z-50 transform translate-x-full transition-transform duration-300 max-w-sm`;
    
    // Set background color based on type
    let bgColor = 'bg-blue-500';
    let icon = 'info-circle';
    
    switch (type) {
        case 'success':
            bgColor = 'bg-green-500';
            icon = 'check-circle';
            break;
        case 'error':
            bgColor = 'bg-red-500';
            icon = 'exclamation-circle';
            break;
        case 'warning':
            bgColor = 'bg-yellow-500';
            icon = 'exclamation-triangle';
            break;
    }
    
    notification.innerHTML = `
        <div class="${bgColor} text-white p-4 rounded-lg shadow-lg">
            <div class="flex items-center gap-3">
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
            </div>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}