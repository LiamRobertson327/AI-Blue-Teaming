/**
 * =============================================================================
 * FIREBASE CONFIGURATION
 * =============================================================================
 * This file initializes the Firebase app and exports the auth and Firestore
 * instances for use throughout the application.
 * 
 * SECURITY NOTE:
 * - Firebase security rules protect your data
 * - Make sure to configure Firestore security rules in Firebase Console
 * =============================================================================
 */

import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, Analytics } from "firebase/analytics";

/**
 * Firebase configuration object.
 * These are loaded from environment variables for security.
 * Set these in your .env file.
 */
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "",
};

/**
 * Initialize Firebase app.
 * This should only be called once in the application lifecycle.
 */
const app: FirebaseApp = initializeApp(firebaseConfig);

/**
 * Firebase Authentication instance.
 * Use this for all authentication operations:
 * - Sign up, login, logout
 * - Get current user
 * - Listen to auth state changes
 */
export const auth: Auth = getAuth(app);

/**
 * Firestore Database instance.
 * Use this for all database operations:
 * - Store user profiles (users collection)
 * - Store expense data (if needed client-side)
 * - Store policy configurations
 */
export const db: Firestore = getFirestore(app);

/**
 * Firebase Analytics instance.
 * Used for tracking user behavior and app usage.
 * Note: Analytics only works in browser environment, not in SSR.
 */
export const analytics: Analytics = getAnalytics(app);

/**
 * Export the app instance in case it's needed elsewhere.
 */
export default app;
