// Load header and footer components
document.addEventListener('DOMContentLoaded', function() {
    loadComponents();
    initializeEventListeners();
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
    // Role selection
    const roleCards = document.querySelectorAll('.role-card');
    roleCards.forEach((card, index) => {
        // Add data-role attribute based on index
        if (index === 0) card.setAttribute('data-role', 'buyer');
        if (index === 1) card.setAttribute('data-role', 'seller');
        
        card.addEventListener('click', function() {
            const role = this.getAttribute('data-role');
            selectRole(role);
        });
    });
    
    // Location detection
    const detectBtn = document.getElementById('detect-location');
    if (detectBtn) {
        detectBtn.addEventListener('click', detectLocation);
    }
    
    // Search functionality
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Location input
    const locationInput = document.getElementById('location-input');
    if (locationInput) {
        locationInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveLocation();
            }
        });
    }
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

// Role selection functionality
function selectRole(role) {
    // Remove active class from all cards
    document.querySelectorAll('.role-card').forEach(card => {
        card.style.transform = 'scale(1)';
        card.classList.remove('bg-white/30');
        card.classList.add('bg-white/10');
    });
    
    // Add active class to selected card
    const selectedCard = document.querySelector(`[data-role="${role}"]`);
    if (selectedCard) {
        selectedCard.style.transform = 'scale(1.05)';
        selectedCard.classList.remove('bg-white/10');
        selectedCard.classList.add('bg-white/30');
    }
    
    // Store selected role
    localStorage.setItem('selectedRole', role);
    
    // Show success message
    showNotification(`You selected: ${role.charAt(0).toUpperCase() + role.slice(1)}`, 'success');
    
    // Redirect based on role after a short delay
    setTimeout(() => {
        if (role === 'buyer') {
            window.location.href = 'buy.html';
        } else if (role === 'seller') {
            window.location.href = 'sell.html';
        }
    }, 1500);
}

// Location detection
function detectLocation() {
    const detectBtn = document.getElementById('detect-location');
    const originalText = detectBtn.innerHTML;
    
    // Show loading state
    detectBtn.innerHTML = '<span class="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Detecting...';
    detectBtn.disabled = true;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                // Get location from coordinates
                getLocationFromCoords(position.coords.latitude, position.coords.longitude);
            },
            function(error) {
                console.error('Error getting location:', error);
                showNotification('Unable to detect location. Please enter manually.', 'error');
                resetDetectButton(detectBtn, originalText);
            }
        );
    } else {
        showNotification('Geolocation is not supported by this browser.', 'error');
        resetDetectButton(detectBtn, originalText);
    }
}

// Get location from coordinates using reverse geocoding
async function getLocationFromCoords(lat, lng) {
    const detectBtn = document.getElementById('detect-location');
    const originalText = detectBtn.innerHTML;
    
    try {
        // Using a free reverse geocoding service
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        
        if (data.display_name) {
            const locationInput = document.getElementById('location-input');
            const city = data.address.city || data.address.town || data.address.village || 'Unknown Location';
            locationInput.value = city;
            
            // Store location
            localStorage.setItem('userLocation', city);
            
            showNotification(`Location detected: ${city}`, 'success');
        } else {
            showNotification('Location detected but could not get city name.', 'warning');
        }
    } catch (error) {
        console.error('Error getting location name:', error);
        showNotification('Location detected but could not get city name.', 'warning');
    }
    
    resetDetectButton(detectBtn, originalText);
}

// Reset detect button
function resetDetectButton(button, originalText) {
    button.innerHTML = originalText;
    button.disabled = false;
}

// Save location
function saveLocation() {
    const locationInput = document.getElementById('location-input');
    const location = locationInput.value.trim();
    
    if (location) {
        localStorage.setItem('userLocation', location);
        showNotification(`Location saved: ${location}`, 'success');
    } else {
        showNotification('Please enter a valid location.', 'error');
    }
}

// Search functionality
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    
    if (query) {
        // Store search query
        localStorage.setItem('searchQuery', query);
        
        // Redirect to buy page with search query
        window.location.href = `buy.html?search=${encodeURIComponent(query)}`;
    } else {
        showNotification('Please enter a search term.', 'error');
    }
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

// Smooth scroll to sections
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Add smooth scroll to navigation links
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        smoothScrollTo(targetId);
    }
});