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
 * These are your Firebase project credentials from the Firebase Console.
 */
const firebaseConfig = {
  apiKey: "AIzaSyD8qh6HtQiBAxMl0wct1nwQbQHikjYUIIA",
  authDomain: "lighthouse-ai-b3f45.firebaseapp.com",
  projectId: "lighthouse-ai-b3f45",
  storageBucket: "lighthouse-ai-b3f45.firebasestorage.app",
  messagingSenderId: "1943513045",
  appId: "1:1943513045:web:518a6f85d4c52cffe9ff5c",
  measurementId: "G-Q5K8XC5K3K",
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
