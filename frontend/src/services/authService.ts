/**
 * =============================================================================
 * AUTHENTICATION SERVICE
 * =============================================================================
 * This service handles all Firebase Authentication operations.
 * It provides a clean API for:
 * - User signup with role assignment
 * - User login with role retrieval
 * - Getting the current user's ID token (for n8n API calls)
 * 
 * ARCHITECTURE NOTES:
 * - This service is used by AuthContext to manage auth state
 * - Components should NOT call this service directly; use useAuth() hook instead
 * - The role is stored in Firestore, not in Firebase Auth custom claims
 *   (custom claims require a backend to set, which we're avoiding for simplicity)
 * 
 * TODO: Future improvements
 * - Add password reset functionality
 * - Add email verification
 * - Consider using Firebase custom claims for role (requires Cloud Functions)
 * =============================================================================
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { UserRole, UserProfile } from "../types";

/**
 * Result returned from signup and login operations.
 * Contains the Firebase user, their ID token, and their role.
 */
export interface AuthResult {
  user: User;
  idToken: string;
  role: UserRole;
}

/**
 * Sign up a new user with email and password.
 * 
 * This function:
 * 1. Creates a new Firebase Auth user
 * 2. Creates a user profile document in Firestore with the specified role
 * 3. Returns the user, their ID token, and role
 * 
 * @param fullName - User's display name
 * @param email - User's email address
 * @param password - User's password (min 6 characters for Firebase)
 * @param role - User's role ("employee" or "admin")
 * @returns Promise<AuthResult> - The authenticated user data
 * 
 * @throws FirebaseError if signup fails (e.g., email already in use)
 * 
 * TODO: Add input validation before calling Firebase
 * TODO: Add error handling with user-friendly messages
 * TODO: Consider sending welcome email after signup
 */
/**
 * Generate the next unique Employee ID in format EMP-XXX.
 * Queries Firestore to find the highest existing employee ID and increments it.
 */
async function generateEmployeeId(): Promise<string> {
  try {
    // Query all users with employeeId, ordered descending to get the highest
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("employeeId", "desc"), limit(1));
    const snapshot = await getDocs(q);
    
    let nextNumber = 1;
    
    if (!snapshot.empty) {
      const lastUser = snapshot.docs[0].data();
      if (lastUser.employeeId) {
        // Extract the number from EMP-XXX format
        const match = lastUser.employeeId.match(/EMP-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      }
    }
    
    // Format as EMP-XXX with leading zeros (e.g., EMP-001, EMP-042, EMP-999)
    return `EMP-${nextNumber.toString().padStart(3, "0")}`;
  } catch (error) {
    console.error("Error generating employee ID:", error);
    // Fallback: use timestamp-based ID
    return `EMP-${Date.now().toString().slice(-6)}`;
  }
}

/**
 * Generate a unique bank account number.
 * Format: 10-digit number starting with 1.
 */
function generateBankAccountNumber(): string {
  // Generate a random 9-digit number and prepend with 1
  const randomPart = Math.floor(100000000 + Math.random() * 900000000);
  return `1${randomPart}`;
}

export async function signUp(
  fullName: string,
  email: string,
  password: string,
  role: UserRole
): Promise<AuthResult> {
  // Step 1: Create the Firebase Auth user
  const userCredential: UserCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  // Step 2: Generate unique identifiers for employees
  let employeeId: string | undefined;
  let bankAccountNumber: string | undefined;
  
  if (role === "employee") {
    employeeId = await generateEmployeeId();
    bankAccountNumber = generateBankAccountNumber();
  }

  // Step 3: Create the user profile in Firestore
  // The document ID is the user's UID for easy lookup
  // Note: serverTimestamp() returns a FieldValue, which Firestore converts to a Timestamp
  const userProfile: Record<string, any> = {
    fullName,
    email,
    role,
    createdAt: serverTimestamp(),
  };
  
  // Add employee-specific fields
  if (employeeId) {
    userProfile.employeeId = employeeId;
  }
  if (bankAccountNumber) {
    userProfile.bankAccountNumber = bankAccountNumber;
  }

  await setDoc(doc(db, "users", user.uid), userProfile);

  // Step 4: Get the ID token for API calls
  const idToken = await user.getIdToken();

  return {
    user,
    idToken,
    role,
  };
}

/**
 * Log in an existing user with email and password.
 * 
 * This function:
 * 1. Authenticates the user with Firebase Auth
 * 2. Retrieves their role from Firestore
 * 3. Returns the user, their ID token, and role
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise<AuthResult> - The authenticated user data
 * 
 * @throws FirebaseError if login fails (e.g., wrong password)
 * @throws Error if user profile not found in Firestore
 * 
 * IMPORTANT: The role is read from Firestore, not from user input.
 * This ensures users cannot claim a role they don't have.
 * 
 * TODO: Add rate limiting for failed login attempts
 * TODO: Add "remember me" functionality
 * TODO: Update lastLoginAt in Firestore
 */
export async function login(
  email: string,
  password: string
): Promise<AuthResult> {
  // Step 1: Authenticate with Firebase
  const userCredential: UserCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  // Step 2: Get the user's role from Firestore
  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (!userDoc.exists()) {
    // This shouldn't happen if signup was done correctly
    // But we handle it gracefully
    throw new Error("User profile not found. Please contact support.");
  }

  const userData = userDoc.data() as Omit<UserProfile, "uid">;
  const role = userData.role;

  // Step 3: Get the ID token for API calls
  const idToken = await user.getIdToken();

  return {
    user,
    idToken,
    role,
  };
}

/**
 * Get the current user's role from Firestore.
 * 
 * @param uid - The user's Firebase UID
 * @returns Promise<UserRole | null> - The user's role, or null if not found
 * 
 * TODO: Add caching to avoid repeated Firestore reads
 */
export async function getUserRole(uid: string): Promise<UserRole | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const userData = userDoc.data() as Omit<UserProfile, "uid">;
      return userData.role;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}

/**
 * Get the full user profile from Firestore.
 * Includes employeeId and bankAccountNumber for employees.
 * 
 * @param uid - The user's Firebase UID
 * @returns Promise<UserProfile | null> - The user profile, or null if not found
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
        employeeId: userData.employeeId,
        bankAccountNumber: userData.bankAccountNumber,
        createdAt: userData.createdAt?.toDate?.() || userData.createdAt,
        lastLoginAt: userData.lastLoginAt?.toDate?.() || userData.lastLoginAt,
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/**
 * Get a fresh ID token for the current user.
 * 
 * This should be called before making API requests to n8n.
 * Firebase ID tokens expire after 1 hour, so always get a fresh one.
 * 
 * @returns Promise<string | null> - The ID token, or null if no user is logged in
 * 
 * USAGE IN N8N CALLS:
 * ```typescript
 * const idToken = await getCurrentUserIdToken();
 * const payload = {
 *   idToken,
 *   role: userRole,
 *   // ... other data
 * };
 * await fetch(n8nWebhookUrl, {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(payload),
 * });
 * ```
 */
export async function getCurrentUserIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  // Force refresh to ensure token is valid
  return user.getIdToken(true);
}

/**
 * Sign out the current user.
 * 
 * This clears the Firebase Auth session.
 * The AuthContext will detect this and update the app state.
 */
export async function logout(): Promise<void> {
  await signOut(auth);
}

/**
 * Get the current Firebase user synchronously.
 * 
 * Note: This may return null immediately after page load
 * because Firebase Auth state is loaded asynchronously.
 * Use onAuthStateChanged for reliable auth state.
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
