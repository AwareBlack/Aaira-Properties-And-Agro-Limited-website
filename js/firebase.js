/**
 * FIREBASE CONFIGURATION & INITIALIZATION
 * Aaira Properties & Agro Limited
 * 
 * This file initializes Firebase services and exports utilities
 * for authentication, database, and storage operations.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase configuration
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

// Cloudinary configuration for image uploads
export const cloudinaryConfig = {
  cloudName: "dlt29pmfq",
  uploadPreset: "aaira_upload"
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
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export function checkAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
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
    onAuthStateChanged(auth, (user) => {
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
    throw error;
  }
}

/**
 * Upload image to Cloudinary
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} - URL of uploaded image
 */
export async function uploadImage(file) {
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 5MB.');
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Image upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
}

/**
 * Get all documents from a collection
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
    throw error;
  }
}

/**
 * Add document to collection
 * @param {string} collectionName - Name of the collection
 * @param {Object} data - Data to add
 * @returns {Promise<string>} - ID of created document
 */
export async function addDocument(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log(`Document added to ${collectionName} with ID:`, docRef.id);
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Update document in collection
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @param {Object} data - Data to update
 * @returns {Promise<void>}
 */
export async function updateDocument(collectionName, docId, data) {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    console.log(`Document ${docId} updated in ${collectionName}`);
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Delete document from collection
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
    throw error;
  }
}

/**
 * Show notification to user
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info)
 */
export function showNotification(message, type = 'info') {
  // Remove existing notification
  const existing = document.querySelector('.firebase-notification');
  if (existing) {
    existing.remove();
  }

  // Create notification
  const notification = document.createElement('div');
  notification.className = `firebase-notification notification-${type}`;
  notification.textContent = message;

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
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    max-width: 400px;
    font-size: 14px;
    font-weight: 500;
    animation: slideInRight 0.3s ease;
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
  const loading = document.createElement('div');
  loading.className = 'firebase-loading';
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
    ">
      <div style="
        background: white;
        padding: 32px 48px;
        border-radius: 12px;
        text-align: center;
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
      loadingEl.remove();
    }
  };
}

// Add keyframe animations to document
const style = document.createElement('style');
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
`;
document.head.appendChild(style);

console.log('🔥 Firebase initialized successfully');
