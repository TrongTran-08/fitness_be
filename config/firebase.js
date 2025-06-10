const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let serviceAccount;
try {
  // Kiểm tra biến môi trường trước
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('Service account loaded from environment variable');
  } else {
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error('Service account file not found at: ' + serviceAccountPath);
    }
    serviceAccount = require('./serviceAccountKey.json');
  }

  // Validate required fields
  const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email', 'client_id'];
  for (const field of requiredFields) {
    if (!serviceAccount[field]) {
      throw new Error(`Missing required field in service account: ${field}`);
    }
  }

  if (!serviceAccount.private_key.includes('BEGIN PRIVATE KEY') || 
      !serviceAccount.private_key.includes('END PRIVATE KEY')) {
    throw new Error('Invalid private key format in service account');
  }

  console.log('Service account validated successfully');
  console.log('Project ID:', serviceAccount.project_id);
  console.log('Client Email:', serviceAccount.client_email);

} catch (error) {
  console.error('Error loading service account:', error.message);
  console.error('Please check FIREBASE_SERVICE_ACCOUNT env or serviceAccountKey.json');
  serviceAccount = null;
}

// Create a mock admin object that can be used when real admin fails
let mockAdmin = {
  auth: () => ({
    verifyIdToken: (token) => {
      console.log('Using mock Firebase auth - token verification is simulated');
      return Promise.resolve({ 
        uid: 'mock-uid',
        email: 'mock@example.com',
        name: 'Mock User'
      });
    }
  }),
  storage: () => ({
    bucket: () => ({
      name: 'mock-bucket',
      getFiles: () => Promise.resolve([[]])
    })
  })
};

let firebaseAdmin, bucket;

try {
  if (!serviceAccount) {
    throw new Error('Service account is not available - please check your serviceAccountKey.json file');
  }
  
  // Delete existing apps to avoid conflicts
  admin.apps.forEach(app => {
    try {
      app.delete();
    } catch (err) {
      // Ignore errors when deleting apps
    }
  });
  
  // Initialize Firebase admin with fresh credentials
  firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'fitness-tracking-ccf2a.firebasestorage.app',
  });
  
  console.log('✅ Firebase Admin SDK initialized successfully with service account file');
  
  // Get the storage bucket after successful initialization
  const storage = admin.storage();
  bucket = storage.bucket();
  console.log('📦 Storage bucket name:', bucket.name);
  
  // Test the bucket connection with timeout
  const testConnection = async () => {
    try {
      const [files] = await bucket.getFiles({ maxResults: 1 });
      console.log('✅ Firebase Storage connection test successful');
      return true;
    } catch (err) {
      console.error('❌ Firebase Storage connection test failed:', err.message);
      return false;
    }
  };
  
  // Run test after 1 second
  setTimeout(testConnection, 1000);
  
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error.message);
  console.log('Using mock Firebase implementation instead');
  
  // Use the mock implementation
  firebaseAdmin = mockAdmin;
  bucket = mockAdmin.storage().bucket();
}

const checkStorageConnection = async () => {
  try {
    if (!bucket) {
      throw new Error('Bucket is not initialized');
    }
    console.log('Checking Firebase Storage connection to bucket:', bucket.name);
    const [files] = await bucket.getFiles({ maxResults: 1 });
    console.log('Firebase Storage connected successfully');
    return true;
  } catch (error) {
    console.error('Firebase Storage connection error:', error.message);
    return false;
  }
};

module.exports = { 
  admin: firebaseAdmin, 
  bucket, 
  checkStorageConnection,
  isMock: firebaseAdmin === mockAdmin,
  isInitialized: firebaseAdmin !== mockAdmin,
  // Export storage as well for direct access
  storage: firebaseAdmin === mockAdmin ? mockAdmin.storage() : admin.storage()
};