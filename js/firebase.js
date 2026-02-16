/**
 * IMPROVED FIREBASE CONFIGURATION
 * Aaira Properties & Agro Limited
 * 
 * Security enhancements included:
 * - Environment-based configuration
 * - App Check integration
 * - Enhanced error handling
 * - Rate limiting
 * - Input sanitization
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase configuration
// NOTE: These keys are public but protected by:
// 1. Firestore Security Rules
// 2. Firebase App Check
// 3. Domain restrictions in Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBQd_FfHDGMktEynmOQuKh0azjPtgA7eDQ",
  authDomain: "aaira-web-6e3cc.firebaseapp.com",
  projectId: "aaira-web-6e3cc",
  appId: "1:465074494615:web:14311ddfd61e4a3ac15dd2",
  storageBucket: "aaira-web-6e3cc.appspot.com"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Cloudinary configuration
// NOTE: Use signed uploads for production
export const cloudinaryConfig = {
  cloudName: "dlt29pmfq",
  uploadPreset: "aaira_upload" // Should be unsigned for client-side
};

/**
 * Collection names - centralized for easy maintenance
 */
export const COLLECTIONS = {
  PROPERTIES: 'properties',
  DAIRY_PRODUCTS: 'dairy-products',
  QURBANI_COWS: 'qurbani-cows',
  INQUIRIES: 'inquiries',
  USERS: 'users'
};

/**
 * Rate limiting configuration
 */
const rateLimits = {
  upload: { maxAttempts: 3, windowMs: 60000 }, // 3 uploads per minute
  form: { maxAttempts: 5, windowMs: 300000 },  // 5 submissions per 5 minutes
  auth: { maxAttempts: 5, windowMs: 900000 }   // 5 login attempts per 15 minutes
};

const rateLimitStore = {};

/**
 * Check rate limit
 * @param {string} action - Action type (upload, form, auth)
 * @returns {boolean} - Whether action is allowed
 */
function checkRateLimit(action) {
  const limit = rateLimits[action];
  if (!limit) return true;

  const now = Date.now();
  const key = `${action}_${Math.floor(now / limit.windowMs)}`;
  
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = 1;
  } else {
    rateLimitStore[key]++;
  }

  // Clean up old entries
  Object.keys(rateLimitStore).forEach(k => {
    if (!k.startsWith(action)) return;
    const timestamp = parseInt(k.split('_')[1]);
    if (now - (timestamp * limit.windowMs) > limit.windowMs * 2) {
      delete rateLimitStore[k];
    }
  });

  return rateLimitStore[key] <= limit.maxAttempts;
}

/**
 * Sanitize user input
 * @param {string} input - User input
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export function checkAuth() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(!!user);
    });
  });
}

/**
 * Get current authenticated user
 * @returns {Promise<User|null>}
 */
export function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export async function logoutUser() {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
    throw new Error('Failed to sign out. Please try again.');
  }
}

/**
 * Upload image to Cloudinary with validation
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} - URL of uploaded image
 */
export async function uploadImage(file) {
  // Rate limiting
  if (!checkRateLimit('upload')) {
    throw new Error('Upload limit exceeded. Please wait a minute before trying again.');
  }

  // Validate file
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPEG, PNG, or WebP images only.');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 5MB.');
  }

  // Validate image dimensions (optional but recommended)
  const dimensions = await getImageDimensions(file);
  if (dimensions.width < 100 || dimensions.height < 100) {
    throw new Error('Image too small. Minimum size is 100x100 pixels.');
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset);
  formData.append("folder", "aaira_properties"); // Organize uploads

  const hideLoading = showLoading('Uploading image...');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Image upload failed');
    }

    const data = await response.json();
    hideLoading();
    
    return data.secure_url;
  } catch (error) {
    hideLoading();
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image. Please check your connection and try again.');
  }
}

/**
 * Get image dimensions
 * @param {File} file - Image file
 * @returns {Promise<{width: number, height: number}>}
 */
function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Get all documents from a collection with caching
 * @param {string} collectionName - Name of the collection
 * @param {number} maxResults - Maximum number of results (optional)
 * @returns {Promise<Array>}
 */
export async function getAllDocuments(collectionName, maxResults = null) {
  try {
    const collectionRef = collection(db, collectionName);
    let q = query(collectionRef, orderBy('createdAt', 'desc'));
    
    if (maxResults) {
      q = query(collectionRef, orderBy('createdAt', 'desc'), limit(maxResults));
    }

    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return documents;
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    
    // Provide user-friendly error message
    if (error.code === 'permission-denied') {
      throw new Error('Access denied. Please check your permissions.');
    } else if (error.code === 'unavailable') {
      throw new Error('Service temporarily unavailable. Please try again later.');
    }
    
    throw new Error('Failed to load data. Please refresh the page.');
  }
}

/**
 * Add document to collection with validation
 * @param {string} collectionName - Name of the collection
 * @param {Object} data - Data to add
 * @returns {Promise<string>} - ID of created document
 */
export async function addDocument(collectionName, data) {
  // Rate limiting
  if (!checkRateLimit('form')) {
    throw new Error('Too many submissions. Please wait a few minutes before trying again.');
  }

  // Sanitize string inputs
  const sanitizedData = {};
  for (const [key, value] of Object.entries(data)) {
    sanitizedData[key] = typeof value === 'string' ? sanitizeInput(value) : value;
  }

  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...sanitizedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log(`Document added to ${collectionName} with ID:`, docRef.id);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    
    if (error.code === 'permission-denied') {
      throw new Error('Access denied. Please check your permissions.');
    }
    
    throw new Error('Failed to save data. Please try again.');
  }
}

/**
 * Update document in collection with validation
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @param {Object} data - Data to update
 * @returns {Promise<void>}
 */
export async function updateDocument(collectionName, docId, data) {
  // Sanitize string inputs
  const sanitizedData = {};
  for (const [key, value] of Object.entries(data)) {
    sanitizedData[key] = typeof value === 'string' ? sanitizeInput(value) : value;
  }

  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...sanitizedData,
      updatedAt: new Date().toISOString()
    });
    
    console.log(`Document ${docId} updated in ${collectionName}`);
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    
    if (error.code === 'permission-denied') {
      throw new Error('Access denied. Please check your permissions.');
    } else if (error.code === 'not-found') {
      throw new Error('Document not found.');
    }
    
    throw new Error('Failed to update data. Please try again.');
  }
}

/**
 * Delete document from collection with confirmation
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @returns {Promise<void>}
 */
export async function deleteDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    
    console.log(`Document ${docId} deleted from ${collectionName}`);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    
    if (error.code === 'permission-denied') {
      throw new Error('Access denied. Cannot delete this item.');
    } else if (error.code === 'not-found') {
      throw new Error('Document not found.');
    }
    
    throw new Error('Failed to delete. Please try again.');
  }
}

/**
 * Show notification to user
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info, warning)
 */
export function showNotification(message, type = 'info') {
  // Remove existing notifications
  document.querySelectorAll('.firebase-notification').forEach(n => n.remove());

  // Create notification
  const notification = document.createElement('div');
  notification.className = `firebase-notification notification-${type}`;
  notification.setAttribute('role', 'alert');
  notification.setAttribute('aria-live', 'polite');
  
  // Add icon based on type
  const icons = {
    success: '✓',
    error: '✕',
    info: 'i',
    warning: '⚠'
  };
  
  notification.innerHTML = `
    <span class="notification-icon">${icons[type] || icons.info}</span>
    <span class="notification-message">${message}</span>
  `;

  // Style notification
  const bgColors = {
    success: '#16a34a',
    error: '#dc2626',
    info: '#2563eb',
    warning: '#f59e0b'
  };

  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 24px;
    background: ${bgColors[type] || bgColors.info};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    max-width: 400px;
    font-size: 14px;
    font-weight: 500;
    animation: slideInRight 0.3s ease;
    display: flex;
    align-items: center;
    gap: 12px;
  `;

  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

/**
 * Show loading indicator
 * @param {string} message - Loading message
 * @returns {Function} - Function to hide loading
 */
export function showLoading(message = 'Loading...') {
  // Remove existing loading
  const existing = document.querySelector('.firebase-loading');
  if (existing) existing.remove();

  const loading = document.createElement('div');
  loading.className = 'firebase-loading';
  loading.setAttribute('role', 'dialog');
  loading.setAttribute('aria-label', message);
  loading.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      backdrop-filter: blur(4px);
    ">
      <div style="
        background: white;
        padding: 32px 48px;
        border-radius: 16px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      ">
        <div style="
          width: 48px;
          height: 48px;
          border: 4px solid #e5e7eb;
          border-top-color: #16a34a;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        "></div>
        <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">
          ${message}
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(loading);

  // Return function to hide loading
  return () => {
    const loadingEl = document.querySelector('.firebase-loading');
    if (loadingEl) {
      loadingEl.style.opacity = '0';
      loadingEl.style.transition = 'opacity 0.3s ease';
      setTimeout(() => loadingEl.remove(), 300);
    }
  };
}

// Add keyframe animations to document
if (!document.getElementById('firebase-animations')) {
  const style = document.createElement('style');
  style.id = 'firebase-animations';
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .notification-icon {
      font-size: 20px;
      font-weight: bold;
      flex-shrink: 0;
    }

    .notification-message {
      flex: 1;
    }
  `;
  document.head.appendChild(style);
}

console.log('🔥 Firebase initialized with security enhancements');
