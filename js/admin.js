/**
 * ADMIN PANEL FUNCTIONALITY
 * Aaira Properties & Agro Limited
 * 
 * Handles admin authentication and management of:
 * - Real Estate Properties
 * - Dairy Products  
 * - Qurbani Cows
 */

import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  COLLECTIONS,
  checkAuth,
  logoutUser,
  uploadImage,
  addDocument,
  updateDocument,
  deleteDocument,
  getAllDocuments,
  showNotification,
  showLoading
} from "./firebase.js";

// Current editing state
let currentEditingItem = null;
let currentCollection = null;

/**
 * Initialize admin panel
 */
async function initAdmin() {
  // Check if user is authenticated
  const isAuthenticated = await checkAuth();
  
  if (!isAuthenticated && !isLoginPage()) {
    // Redirect to login if not authenticated and not on login page
    window.location.href = 'admin-login.html';
    return;
  }

  if (isAuthenticated && isLoginPage()) {
    // Redirect to admin panel if already logged in
    window.location.href = 'admin.html';
    return;
  }

  // Set up auth state listener
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('Admin authenticated:', user.email);
      if (!isLoginPage()) {
        initAdminPanel();
      }
    } else {
      console.log('No user authenticated');
      if (!isLoginPage()) {
        window.location.href = 'admin-login.html';
      }
    }
  });
}

/**
 * Check if current page is login page
 */
function isLoginPage() {
  return window.location.pathname.includes('admin-login') || 
         window.location.pathname.includes('login');
}

/**
 * Initialize admin panel UI and functionality
 */
function initAdminPanel() {
  // Set up logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Set up tab switching
  setupTabs();

  // Load initial data
  loadAllData();

  // Set up form submissions
  setupPropertyForm();
  setupDairyForm();
  setupQurbaniForm();
}

/**
 * Handle admin login
 */
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;

  // Validate inputs
  if (!email || !password) {
    showNotification('Please enter email and password', 'error');
    return;
  }

  // Show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Signing in...';

  try {
    await signInWithEmailAndPassword(auth, email, password);
    showNotification('Login successful! Redirecting...', 'success');
    
    // Redirect to admin panel
    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 1000);
  } catch (error) {
    console.error('Login error:', error);
    
    let errorMessage = 'Login failed. Please check your credentials.';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No user found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email format.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    }
    
    showNotification(errorMessage, 'error');
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  }
});

/**
 * Handle logout
 */
async function handleLogout() {
  const hideLoading = showLoading('Signing out...');
  
  try {
    await logoutUser();
    hideLoading();
    showNotification('Logged out successfully', 'success');
    
    setTimeout(() => {
      window.location.href = 'admin-login.html';
    }, 1000);
  } catch (error) {
    hideLoading();
    console.error('Logout error:', error);
    showNotification('Error logging out. Please try again.', 'error');
  }
}

/**
 * Setup tab switching functionality
 */
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // Remove active class from all tabs
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Add active class to clicked tab
      button.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });
}

/**
 * Load all data for admin panel
 */
async function loadAllData() {
  await loadProperties();
  await loadDairyProducts();
  await loadQurbaniCows();
}

// ============================================
// PROPERTIES MANAGEMENT
// ============================================

/**
 * Setup property form submission
 */
function setupPropertyForm() {
  const form = document.getElementById('propertyForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handlePropertySubmit(e);
  });
}

/**
 * Handle property form submission (add/edit)
 */
async function handlePropertySubmit(e) {
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;

  // Get form data
  const title = document.getElementById('propertyTitle').value.trim();
  const type = document.getElementById('propertyType').value;
  const location = document.getElementById('propertyLocation').value.trim();
  const price = document.getElementById('propertyPrice').value.trim();
  const size = document.getElementById('propertySize').value.trim();
  const description = document.getElementById('propertyDescription').value.trim();
  const features = document.getElementById('propertyFeatures').value.trim();
  const imageFile = document.getElementById('propertyImage').files[0];

  // Validate
  if (!title || !type || !location || !price) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }

  // Show loading
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Saving...';
  const hideLoading = showLoading('Saving property...');

  try {
    let imageUrl = currentEditingItem?.image || '';

    // Upload new image if provided
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const propertyData = {
      title,
      type,
      location,
      price,
      size,
      description,
      features: features.split('\n').filter(f => f.trim()),
      image: imageUrl,
      status: 'available'
    };

    if (currentEditingItem && currentCollection === COLLECTIONS.PROPERTIES) {
      // Update existing property
      await updateDocument(COLLECTIONS.PROPERTIES, currentEditingItem.id, propertyData);
      showNotification('Property updated successfully!', 'success');
    } else {
      // Add new property
      await addDocument(COLLECTIONS.PROPERTIES, propertyData);
      showNotification('Property added successfully!', 'success');
    }

    // Reset form and reload data
    form.reset();
    currentEditingItem = null;
    currentCollection = null;
    submitBtn.innerHTML = 'Add Property';
    await loadProperties();
  } catch (error) {
    console.error('Error saving property:', error);
    showNotification('Failed to save property: ' + error.message, 'error');
  } finally {
    hideLoading();
    submitBtn.disabled = false;
    if (!currentEditingItem) {
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

/**
 * Load and display properties
 */
async function loadProperties() {
  const container = document.getElementById('propertiesList');
  if (!container) return;

  const hideLoading = showLoading('Loading properties...');

  try {
    const properties = await getAllDocuments(COLLECTIONS.PROPERTIES);

    if (properties.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:#666;padding:40px;">No properties added yet.</p>';
      return;
    }

    container.innerHTML = properties.map(property => `
      <div class="admin-item-card">
        <img src="${property.image}" alt="${property.title}" style="width:100%;height:200px;object-fit:cover;border-radius:8px;">
        <h3>${property.title}</h3>
        <p><strong>Type:</strong> ${property.type}</p>
        <p><strong>Location:</strong> ${property.location}</p>
        <p><strong>Price:</strong> ${property.price}</p>
        <p><strong>Size:</strong> ${property.size}</p>
        <div class="admin-actions">
          <button onclick="editProperty('${property.id}')" class="btn-edit">Edit</button>
          <button onclick="deleteProperty('${property.id}')" class="btn-delete">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading properties:', error);
    container.innerHTML = '<p style="text-align:center;color:red;">Error loading properties</p>';
  } finally {
    hideLoading();
  }
}

/**
 * Edit property
 */
window.editProperty = async (propertyId) => {
  const hideLoading = showLoading('Loading property...');

  try {
    const properties = await getAllDocuments(COLLECTIONS.PROPERTIES);
    const property = properties.find(p => p.id === propertyId);

    if (!property) {
      showNotification('Property not found', 'error');
      return;
    }

    // Populate form
    document.getElementById('propertyTitle').value = property.title;
    document.getElementById('propertyType').value = property.type;
    document.getElementById('propertyLocation').value = property.location;
    document.getElementById('propertyPrice').value = property.price;
    document.getElementById('propertySize').value = property.size;
    document.getElementById('propertyDescription').value = property.description || '';
    document.getElementById('propertyFeatures').value = (property.features || []).join('\n');

    // Set editing state
    currentEditingItem = property;
    currentCollection = COLLECTIONS.PROPERTIES;

    // Update button text
    const submitBtn = document.querySelector('#propertyForm button[type="submit"]');
    submitBtn.innerHTML = 'Update Property';

    // Scroll to form
    document.getElementById('propertyForm').scrollIntoView({ behavior: 'smooth' });

    showNotification('Edit property and click Update', 'info');
  } catch (error) {
    console.error('Error editing property:', error);
    showNotification('Failed to load property for editing', 'error');
  } finally {
    hideLoading();
  }
};

/**
 * Delete property
 */
window.deleteProperty = async (propertyId) => {
  if (!confirm('Are you sure you want to delete this property?')) {
    return;
  }

  const hideLoading = showLoading('Deleting property...');

  try {
    await deleteDocument(COLLECTIONS.PROPERTIES, propertyId);
    showNotification('Property deleted successfully!', 'success');
    await loadProperties();
  } catch (error) {
    console.error('Error deleting property:', error);
    showNotification('Failed to delete property', 'error');
  } finally {
    hideLoading();
  }
};

// ============================================
// DAIRY PRODUCTS MANAGEMENT
// ============================================

/**
 * Setup dairy product form
 */
function setupDairyForm() {
  const form = document.getElementById('dairyForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleDairySubmit(e);
  });
}

/**
 * Handle dairy product submission
 */
async function handleDairySubmit(e) {
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;

  const name = document.getElementById('dairyName').value.trim();
  const category = document.getElementById('dairyCategory').value;
  const price = document.getElementById('dairyPrice').value.trim();
  const unit = document.getElementById('dairyUnit').value.trim();
  const description = document.getElementById('dairyDescription').value.trim();
  const features = document.getElementById('dairyFeatures').value.trim();
  const imageFile = document.getElementById('dairyImage').files[0];

  if (!name || !category || !price || !unit) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Saving...';
  const hideLoading = showLoading('Saving dairy product...');

  try {
    let imageUrl = currentEditingItem?.image || '';

    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const productData = {
      name,
      category,
      price,
      unit,
      description,
      features: features.split('\n').filter(f => f.trim()),
      image: imageUrl,
      available: true
    };

    if (currentEditingItem && currentCollection === COLLECTIONS.DAIRY_PRODUCTS) {
      await updateDocument(COLLECTIONS.DAIRY_PRODUCTS, currentEditingItem.id, productData);
      showNotification('Dairy product updated successfully!', 'success');
    } else {
      await addDocument(COLLECTIONS.DAIRY_PRODUCTS, productData);
      showNotification('Dairy product added successfully!', 'success');
    }

    form.reset();
    currentEditingItem = null;
    currentCollection = null;
    submitBtn.innerHTML = 'Add Product';
    await loadDairyProducts();
  } catch (error) {
    console.error('Error saving dairy product:', error);
    showNotification('Failed to save product: ' + error.message, 'error');
  } finally {
    hideLoading();
    submitBtn.disabled = false;
    if (!currentEditingItem) {
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

/**
 * Load dairy products
 */
async function loadDairyProducts() {
  const container = document.getElementById('dairyList');
  if (!container) return;

  const hideLoading = showLoading('Loading dairy products...');

  try {
    const products = await getAllDocuments(COLLECTIONS.DAIRY_PRODUCTS);

    if (products.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:#666;padding:40px;">No dairy products added yet.</p>';
      return;
    }

    container.innerHTML = products.map(product => `
      <div class="admin-item-card">
        <img src="${product.image}" alt="${product.name}" style="width:100%;height:200px;object-fit:cover;border-radius:8px;">
        <h3>${product.name}</h3>
        <p><strong>Category:</strong> ${product.category}</p>
        <p><strong>Price:</strong> ${product.price} per ${product.unit}</p>
        <p>${product.description}</p>
        <div class="admin-actions">
          <button onclick="editDairyProduct('${product.id}')" class="btn-edit">Edit</button>
          <button onclick="deleteDairyProduct('${product.id}')" class="btn-delete">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading dairy products:', error);
    container.innerHTML = '<p style="text-align:center;color:red;">Error loading products</p>';
  } finally {
    hideLoading();
  }
}

/**
 * Edit dairy product
 */
window.editDairyProduct = async (productId) => {
  const hideLoading = showLoading('Loading product...');

  try {
    const products = await getAllDocuments(COLLECTIONS.DAIRY_PRODUCTS);
    const product = products.find(p => p.id === productId);

    if (!product) {
      showNotification('Product not found', 'error');
      return;
    }

    document.getElementById('dairyName').value = product.name;
    document.getElementById('dairyCategory').value = product.category;
    document.getElementById('dairyPrice').value = product.price;
    document.getElementById('dairyUnit').value = product.unit;
    document.getElementById('dairyDescription').value = product.description || '';
    document.getElementById('dairyFeatures').value = (product.features || []).join('\n');

    currentEditingItem = product;
    currentCollection = COLLECTIONS.DAIRY_PRODUCTS;

    const submitBtn = document.querySelector('#dairyForm button[type="submit"]');
    submitBtn.innerHTML = 'Update Product';

    // Switch to dairy tab
    document.querySelector('[data-tab="dairy"]').click();
    document.getElementById('dairyForm').scrollIntoView({ behavior: 'smooth' });

    showNotification('Edit product and click Update', 'info');
  } catch (error) {
    console.error('Error editing product:', error);
    showNotification('Failed to load product for editing', 'error');
  } finally {
    hideLoading();
  }
};

/**
 * Delete dairy product
 */
window.deleteDairyProduct = async (productId) => {
  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }

  const hideLoading = showLoading('Deleting product...');

  try {
    await deleteDocument(COLLECTIONS.DAIRY_PRODUCTS, productId);
    showNotification('Product deleted successfully!', 'success');
    await loadDairyProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
    showNotification('Failed to delete product', 'error');
  } finally {
    hideLoading();
  }
};

// ============================================
// QURBANI COWS MANAGEMENT
// ============================================

/**
 * Setup qurbani form
 */
function setupQurbaniForm() {
  const form = document.getElementById('qurbaniForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleQurbaniSubmit(e);
  });
}

/**
 * Handle qurbani cow submission
 */
async function handleQurbaniSubmit(e) {
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;

  const name = document.getElementById('cowName').value.trim();
  const breed = document.getElementById('cowBreed').value.trim();
  const weight = document.getElementById('cowWeight').value.trim();
  const age = document.getElementById('cowAge').value.trim();
  const price = document.getElementById('cowPrice').value.trim();
  const description = document.getElementById('cowDescription').value.trim();
  const features = document.getElementById('cowFeatures').value.trim();
  const imageFile = document.getElementById('cowImage').files[0];

  if (!name || !breed || !weight || !age || !price) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Saving...';
  const hideLoading = showLoading('Saving qurbani cow...');

  try {
    let imageUrl = currentEditingItem?.image || '';

    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const cowData = {
      name,
      breed,
      weight,
      age,
      price,
      description,
      features: features.split('\n').filter(f => f.trim()),
      image: imageUrl,
      available: true,
      healthCertified: true
    };

    if (currentEditingItem && currentCollection === COLLECTIONS.QURBANI_COWS) {
      await updateDocument(COLLECTIONS.QURBANI_COWS, currentEditingItem.id, cowData);
      showNotification('Qurbani cow updated successfully!', 'success');
    } else {
      await addDocument(COLLECTIONS.QURBANI_COWS, cowData);
      showNotification('Qurbani cow added successfully!', 'success');
    }

    form.reset();
    currentEditingItem = null;
    currentCollection = null;
    submitBtn.innerHTML = 'Add Cow';
    await loadQurbaniCows();
  } catch (error) {
    console.error('Error saving qurbani cow:', error);
    showNotification('Failed to save cow: ' + error.message, 'error');
  } finally {
    hideLoading();
    submitBtn.disabled = false;
    if (!currentEditingItem) {
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

/**
 * Load qurbani cows
 */
async function loadQurbaniCows() {
  const container = document.getElementById('qurbaniList');
  if (!container) return;

  const hideLoading = showLoading('Loading qurbani cows...');

  try {
    const cows = await getAllDocuments(COLLECTIONS.QURBANI_COWS);

    if (cows.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:#666;padding:40px;">No qurbani cows added yet.</p>';
      return;
    }

    container.innerHTML = cows.map(cow => `
      <div class="admin-item-card">
        <img src="${cow.image}" alt="${cow.name}" style="width:100%;height:200px;object-fit:cover;border-radius:8px;">
        <h3>${cow.name}</h3>
        <p><strong>Breed:</strong> ${cow.breed}</p>
        <p><strong>Weight:</strong> ${cow.weight}</p>
        <p><strong>Age:</strong> ${cow.age}</p>
        <p><strong>Price:</strong> ${cow.price}</p>
        <div class="admin-actions">
          <button onclick="editQurbaniCow('${cow.id}')" class="btn-edit">Edit</button>
          <button onclick="deleteQurbaniCow('${cow.id}')" class="btn-delete">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading qurbani cows:', error);
    container.innerHTML = '<p style="text-align:center;color:red;">Error loading cows</p>';
  } finally {
    hideLoading();
  }
}

/**
 * Edit qurbani cow
 */
window.editQurbaniCow = async (cowId) => {
  const hideLoading = showLoading('Loading cow...');

  try {
    const cows = await getAllDocuments(COLLECTIONS.QURBANI_COWS);
    const cow = cows.find(c => c.id === cowId);

    if (!cow) {
      showNotification('Cow not found', 'error');
      return;
    }

    document.getElementById('cowName').value = cow.name;
    document.getElementById('cowBreed').value = cow.breed;
    document.getElementById('cowWeight').value = cow.weight;
    document.getElementById('cowAge').value = cow.age;
    document.getElementById('cowPrice').value = cow.price;
    document.getElementById('cowDescription').value = cow.description || '';
    document.getElementById('cowFeatures').value = (cow.features || []).join('\n');

    currentEditingItem = cow;
    currentCollection = COLLECTIONS.QURBANI_COWS;

    const submitBtn = document.querySelector('#qurbaniForm button[type="submit"]');
    submitBtn.innerHTML = 'Update Cow';

    // Switch to qurbani tab
    document.querySelector('[data-tab="qurbani"]').click();
    document.getElementById('qurbaniForm').scrollIntoView({ behavior: 'smooth' });

    showNotification('Edit cow and click Update', 'info');
  } catch (error) {
    console.error('Error editing cow:', error);
    showNotification('Failed to load cow for editing', 'error');
  } finally {
    hideLoading();
  }
};

/**
 * Delete qurbani cow
 */
window.deleteQurbaniCow = async (cowId) => {
  if (!confirm('Are you sure you want to delete this cow?')) {
    return;
  }

  const hideLoading = showLoading('Deleting cow...');

  try {
    await deleteDocument(COLLECTIONS.QURBANI_COWS, cowId);
    showNotification('Cow deleted successfully!', 'success');
    await loadQurbaniCows();
  } catch (error) {
    console.error('Error deleting cow:', error);
    showNotification('Failed to delete cow', 'error');
  } finally {
    hideLoading();
  }
};

// Initialize admin panel when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}
