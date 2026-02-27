// script.js - Shared functions for Artsy Seller Dashboard

// API Configuration
const API_BASE = 'https://xoqyywycygofgbgazrpu.supabase.co/rest/v1';
const API_KEY = 'sb_publishable_O-6kGt2-CDzg7uR8hQoK_w_ZD5M1aUo';

// Headers for API calls
const headers = {
  apikey: API_KEY,
  'Content-Type': 'application/json',
};

// Toggle mobile menu
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.classList.toggle('active');
  }
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date
function formatDate(dateString) {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Format relative time (e.g., "2 hours ago")
function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  return 'just now';
}

// Show loading spinner
function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    `;
  }
}

// Show error message
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `
      <div class="card" style="text-align: center; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 20px;">😕</div>
        <h3>Oops! Something went wrong</h3>
        <p style="color: var(--neutral); margin: 10px 0;">${
          message || 'Please try again later.'
        }</p>
        <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 20px;">
          Try Again
        </button>
      </div>
    `;
  }
}

// Show success message
function showSuccess(message) {
  alert(message); // Simple for now
}

// Confirm action
function confirmAction(message) {
  return confirm(message);
}

// Generic fetch wrapper with error handling
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: headers,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to connect to server',
    };
  }
}

// Upload product
async function uploadProduct(productData) {
  return await fetchAPI('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
}

// Update order status (API call)
async function updateOrderStatusAPI(orderId, status) {
  return await fetchAPI(`/orders?id=eq.${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// Get artisan profile
async function getArtisanProfile(artisanId = 1) {
  return await fetchAPI(`/artisans?id=eq.${artisanId}`);
}

// Get dashboard summary
async function getDashboardSummary(artisanId = 1) {
  return await fetchAPI(
    `/rpc/get_dashboard_summary?artisan_id_param=${artisanId}`
  );
}

// Get products
async function getProducts(artisanId = 1) {
  return await fetchAPI(
    `/products?artisan_id=eq.${artisanId}&order=created_at.desc`
  );
}

// Get orders
async function getOrders() {
  return await fetchAPI('/orders?order=created_at.desc');
}

// Get reviews
async function getReviews(productId = null) {
  const endpoint = productId
    ? `/reviews?product_id=eq.${productId}&order=created_at.desc`
    : '/reviews?order=created_at.desc';
  return await fetchAPI(endpoint);
}

// Handle image upload
async function handleImageUpload(event) {
  const files = event.target.files;
  const previewGrid = document.getElementById('imagePreview');
  const uploadStatus = document.getElementById('uploadStatus');
  
  if (files.length === 0) return;
  
  // Show loading state
  uploadStatus.innerHTML = 'Uploading... 📸';
  uploadStatus.style.color = 'var(--primary)';
  
  // For demo, simulate upload success
  setTimeout(() => {
    // Show preview
    previewGrid.innerHTML = '';
    for (let i = 0; i < Math.min(files.length, 3); i++) {
      const file = files[i];
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'preview-image';
        img.alt = 'Preview';
        previewGrid.appendChild(img);
      };
      
      reader.readAsDataURL(file);
    }
    
    // Show success message
    uploadStatus.innerHTML = `✅ ${files.length} image(s) uploaded successfully!`;
    uploadStatus.style.color = 'green';
    
    if (files.length > 3) {
      uploadStatus.innerHTML += ' (Only first 3 shown)';
    }
  }, 1500);
}

// Show toast notification (used across pages)
function showToast(message, type = 'success') {
  // Remove existing toast if any
  const existingToast = document.getElementById('toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: ${type === 'success' ? 'var(--success)' : 'var(--primary)'};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 2000;
    font-weight: 500;
    animation: slideIn 0.3s ease;
  `;
  
  // Add animation if not exists
  if (!document.getElementById('toast-animation')) {
    const style = document.createElement('style');
    style.id = 'toast-animation';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Hide after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Update cart count in navigation
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartCountElements = document.querySelectorAll('.cart-count');
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  cartCountElements.forEach(el => {
      el.textContent = totalItems;
  });
}

// Initialize page
document.addEventListener('DOMContentLoaded', function () {
  // Close mobile menu when clicking outside
  document.addEventListener('click', function (event) {
    const navLinks = document.getElementById('navLinks');
    const menuBtn = document.querySelector('.mobile-menu-btn');

    if (navLinks && navLinks.classList.contains('active')) {
      if (!navLinks.contains(event.target) && !menuBtn.contains(event.target)) {
        navLinks.classList.remove('active');
      }
    }
  });
});

