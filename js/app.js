/**
 * PUBLIC WEBSITE FUNCTIONALITY
 * Aaira Properties & Agro Limited
 * 
 * Handles public-facing features:
 * - Loading and displaying properties, dairy products, qurbani cows
 * - Contact form submissions
 * - Inquiry management
 * - Real-time updates from Firebase
 */

import {
  COLLECTIONS,
  getAllDocuments,
  addDocument,
  showNotification,
  showLoading
} from "./firebase.js";

// EmailJS configuration
const EMAILJS_CONFIG = {
  serviceId: 'service_j7jwlqn',
  templateId: 'template_equgm1k',
  userId: '1u43jUCuiNJ96Rwgt'
};

/**
 * Initialize EmailJS
 */
(function() {
  emailjs.init(EMAILJS_CONFIG.userId);
})();

/**
 * Initialize public website
 */
function initPublicSite() {
  // Load all data from Firebase
  loadPublicData();

  // Setup contact form
  setupContactForm();

  // Setup inquiry forms
  setupInquiryForms();
}

/**
 * Load all public data
 */
async function loadPublicData() {
  await Promise.all([
    loadPropertiesPublic(),
    loadDairyProductsPublic(),
    loadQurbaniCowsPublic()
  ]);
}

// ============================================
// PROPERTIES - PUBLIC DISPLAY
// ============================================

/**
 * Load and display properties on public site
 */
async function loadPropertiesPublic() {
  const container = document.getElementById('projectsGrid');
  if (!container) return;

  try {
    const properties = await getAllDocuments(COLLECTIONS.PROPERTIES, 6); // Limit to 6 for homepage

    if (properties.length === 0) {
      container.innerHTML = `
        <div class="no-data-message">
          <p>No properties available at the moment. Please check back soon!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = properties.map(property => `
      <div class="project-card" data-id="${property.id}">
        <div class="project-image">
          <img src="${property.image}" alt="${property.title}" loading="lazy">
          <div class="project-status">${property.status || 'Available'}</div>
        </div>
        <div class="project-content">
          <h3 class="project-title">${property.title}</h3>
          <p class="project-location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            ${property.location}
          </p>
          <div class="project-details">
            <div class="detail-item">
              <span class="detail-label">${property.type}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Size</span>
              <span class="detail-value">${property.size}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Price</span>
              <span class="detail-value">${property.price}</span>
            </div>
          </div>
          ${property.features && property.features.length > 0 ? `
            <div class="project-features">
              ${property.features.slice(0, 3).map(f => `
                <span class="feature-tag">✓ ${f}</span>
              `).join('')}
            </div>
          ` : ''}
          <a href="https://wa.me/8801345695763?text=I%27m%20interested%20in%20${encodeURIComponent(property.title)}%20at%20${encodeURIComponent(property.location)}.%20Please%20share%20more%20details." 
             class="project-link" 
             target="_blank" 
             rel="noopener">
            Get Details on WhatsApp
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading properties:', error);
    if (container) {
      container.innerHTML = '<p style="text-align:center;color:red;">Error loading properties. Please refresh the page.</p>';
    }
  }
}

// ============================================
// DAIRY PRODUCTS - PUBLIC DISPLAY
// ============================================

/**
 * Load and display dairy products
 */
async function loadDairyProductsPublic() {
  const container = document.getElementById('dairyProductsGrid');
  if (!container) return;

  try {
    const products = await getAllDocuments(COLLECTIONS.DAIRY_PRODUCTS);

    if (products.length === 0) {
      container.innerHTML = `
        <div class="no-data-message">
          <p>Dairy products coming soon!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = products.filter(p => p.available).map(product => `
      <div class="product-card">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          ${product.category === 'Milk' ? '<div class="product-badge">Best Seller</div>' : ''}
        </div>
        <div class="product-content">
          <h3>${product.name}</h3>
          <p>${product.description || ''}</p>
          <div class="product-meta">
            <span class="product-quantity">Per ${product.unit}</span>
            <span class="product-price">${product.price}</span>
          </div>
          ${product.features && product.features.length > 0 ? `
            <div class="product-features-small">
              ${product.features.slice(0, 3).map(f => `
                <span>✓ ${f}</span>
              `).join('')}
            </div>
          ` : ''}
          <a href="https://wa.me/8801345695763?text=I%27d%20like%20to%20order%20${encodeURIComponent(product.name)}.%20Please%20share%20delivery%20details." 
             class="btn-product" 
             target="_blank" 
             rel="noopener">
            Order Now via WhatsApp
          </a>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading dairy products:', error);
    if (container) {
      container.innerHTML = '<p style="text-align:center;color:red;">Error loading products. Please refresh the page.</p>';
    }
  }
}

// ============================================
// QURBANI COWS - PUBLIC DISPLAY
// ============================================

/**
 * Load and display qurbani cows
 */
async function loadQurbaniCowsPublic() {
  const container = document.getElementById('qurbaniCowsGrid');
  if (!container) return;

  try {
    const cows = await getAllDocuments(COLLECTIONS.QURBANI_COWS);

    if (cows.length === 0) {
      container.innerHTML = `
        <div class="no-data-message">
          <p>Qurbani cows will be available soon. Pre-booking opens before Eid!</p>
        </div>
      `;
      return;
    }

    // For qurbani section, show as a special grid
    const cowsHtml = cows.filter(c => c.available).map(cow => `
      <div class="qurbani-cow-card">
        <div class="cow-image">
          <img src="${cow.image}" alt="${cow.name}" loading="lazy">
          ${cow.healthCertified ? '<div class="health-badge">✓ Health Certified</div>' : ''}
        </div>
        <div class="cow-content">
          <h3>${cow.name}</h3>
          <div class="cow-specs">
            <div class="spec-item">
              <strong>Breed:</strong>
              <span>${cow.breed}</span>
            </div>
            <div class="spec-item">
              <strong>Weight:</strong>
              <span>${cow.weight}</span>
            </div>
            <div class="spec-item">
              <strong>Age:</strong>
              <span>${cow.age}</span>
            </div>
            <div class="spec-item">
              <strong>Price:</strong>
              <span class="price-highlight">${cow.price}</span>
            </div>
          </div>
          ${cow.description ? `<p class="cow-description">${cow.description}</p>` : ''}
          ${cow.features && cow.features.length > 0 ? `
            <ul class="cow-features">
              ${cow.features.map(f => `<li>✓ ${f}</li>`).join('')}
            </ul>
          ` : ''}
          <a href="https://wa.me/8801345695763?text=I%27m%20interested%20in%20${encodeURIComponent(cow.name)}%20(${encodeURIComponent(cow.breed)}).%20Please%20share%20more%20details." 
             class="btn-cow-inquiry" 
             target="_blank" 
             rel="noopener">
            Inquire on WhatsApp
          </a>
        </div>
      </div>
    `).join('');

    container.innerHTML = cowsHtml;
  } catch (error) {
    console.error('Error loading qurbani cows:', error);
    if (container) {
      container.innerHTML = '<p style="text-align:center;color:red;">Error loading cows. Please refresh the page.</p>';
    }
  }
}

// ============================================
// CONTACT FORM
// ============================================

/**
 * Setup main contact form
 */
function setupContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const interest = document.getElementById('interest').value;
    const message = document.getElementById('message').value.trim();

    // Validate
    if (!name || !email || !phone || !interest) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending...</span>';

    try {
      // Save to Firebase
      await addDocument(COLLECTIONS.INQUIRIES, {
        name,
        email,
        phone,
        interest,
        message,
        status: 'new',
        source: 'website-contact-form'
      });

      // Send email via EmailJS
      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        {
          from_name: name,
          from_email: email,
          phone: phone,
          interest: interest,
          message: message || 'No additional message'
        }
      );

      showNotification('Thank you! Your inquiry has been received. We will contact you soon.', 'success');
      form.reset();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      showNotification('Sorry, something went wrong. Please try calling or WhatsApp us directly.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

/**
 * Setup quick inquiry forms (if any)
 */
function setupInquiryForms() {
  const inquiryForms = document.querySelectorAll('.inquiry-form');
  
  inquiryForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      const hideLoading = showLoading('Submitting inquiry...');

      try {
        await addDocument(COLLECTIONS.INQUIRIES, {
          ...data,
          status: 'new',
          source: form.getAttribute('data-source') || 'quick-inquiry'
        });

        showNotification('Inquiry submitted! We will contact you soon.', 'success');
        form.reset();
      } catch (error) {
        console.error('Error submitting inquiry:', error);
        showNotification('Error submitting inquiry. Please try WhatsApp.', 'error');
      } finally {
        hideLoading();
      }
    });
  });
}

// ============================================
// SEARCH & FILTER (Optional Enhancement)
// ============================================

/**
 * Setup property filtering
 */
function setupPropertyFilters() {
  const filterButtons = document.querySelectorAll('[data-filter]');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const filterType = button.getAttribute('data-filter');
      
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Load filtered properties
      const hideLoading = showLoading('Loading properties...');
      
      try {
        const allProperties = await getAllDocuments(COLLECTIONS.PROPERTIES);
        let filtered = allProperties;

        if (filterType !== 'all') {
          filtered = allProperties.filter(p => p.type === filterType);
        }

        displayFilteredProperties(filtered);
      } catch (error) {
        console.error('Error filtering properties:', error);
      } finally {
        hideLoading();
      }
    });
  });
}

/**
 * Display filtered properties
 */
function displayFilteredProperties(properties) {
  const container = document.getElementById('projectsGrid');
  if (!container) return;

  if (properties.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#666;">No properties found in this category.</p>';
    return;
  }

  // Reuse the same HTML structure as loadPropertiesPublic
  container.innerHTML = properties.map(property => `
    <div class="project-card" data-id="${property.id}">
      <div class="project-image">
        <img src="${property.image}" alt="${property.title}">
        <div class="project-status">${property.status || 'Available'}</div>
      </div>
      <div class="project-content">
        <h3 class="project-title">${property.title}</h3>
        <p class="project-location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          ${property.location}
        </p>
        <div class="project-details">
          <div class="detail-item">
            <span class="detail-value">${property.price}</span>
          </div>
        </div>
        <a href="https://wa.me/8801345695763?text=I%27m%20interested%20in%20${encodeURIComponent(property.title)}" 
           class="project-link" 
           target="_blank" 
           rel="noopener">
          Get Details
        </a>
      </div>
    </div>
  `).join('');
}

// ============================================
// AUTO-REFRESH DATA (Optional)
// ============================================

/**
 * Setup auto-refresh for real-time updates
 */
function setupAutoRefresh() {
  // Refresh data every 5 minutes
  setInterval(() => {
    console.log('Refreshing data...');
    loadPublicData();
  }, 5 * 60 * 1000); // 5 minutes
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initPublicSite();
    setupPropertyFilters();
    // Uncomment if you want auto-refresh
    // setupAutoRefresh();
  });
} else {
  initPublicSite();
  setupPropertyFilters();
  // Uncomment if you want auto-refresh
  // setupAutoRefresh();
}

// Export functions for use in other scripts if needed
window.aairaApp = {
  loadPropertiesPublic,
  loadDairyProductsPublic,
  loadQurbaniCowsPublic,
  refreshData: loadPublicData
};
