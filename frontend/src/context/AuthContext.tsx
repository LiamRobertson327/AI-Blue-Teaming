/**
 * =============================================================================
 * AUTHENTICATION CONTEXT
 * =============================================================================
 * This is the SINGLE SOURCE OF TRUTH for authentication state in the app.
 * 
 * ARCHITECTURE:
 * - Wraps the entire app in <AuthProvider>
 * - Provides user, role, and loading state to all components
 * - Exposes login, logout, and signUp functions
 * - Automatically syncs with Firebase Auth state changes
 * 
 * USAGE:
 * ```tsx
 * // In a component
 * import { useAuth } from '../context/AuthContext';
 * 
 * function MyComponent() {
 *   const { user, role, loading, login, logout } = useAuth();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return <div>Please log in</div>;
 *   
 *   return <div>Welcome, {user.email}! You are a {role}.</div>;
 * }
 * ```
 * 
 * IMPORTANT:
 * - Components should NOT import from authService directly
 * - All auth operations should go through this context
 * - This ensures consistent state across the app
 * =============================================================================
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import {
  signUp as authSignUp,
  login as authLogin,
  logout as authLogout,
  getUserRole,
  getCurrentUserIdToken,
} from "../services/authService";
import { UserRole } from "../types";

/**
 * Shape of the authentication context.
 * This defines what's available to components using useAuth().
 */
interface AuthContextType {
  // === State ===
  /** The currently logged-in Firebase user, or null if not logged in */
  user: User | null;
  
  /** The user's role ("employee" or "admin"), or null if not logged in */
  role: UserRole | null;
  
  /** True while checking auth state on app load */
  loading: boolean;

  // === Actions ===
  /**
   * Sign up a new user.
   * @param fullName - User's display name
   * @param email - User's email
   * @param password - User's password
   * @param role - User's role
   */
  signUp: (
    fullName: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<void>;

  /**
   * Log in an existing user.
   * @param email - User's email
   * @param password - User's password
   * @returns The user's role after login
   */
  login: (email: string, password: string) => Promise<{ role: UserRole }>;

  /**
   * Log out the current user.
   */
  logout: () => Promise<void>;

  /**
   * Get a fresh ID token for API calls.
   * Call this before making requests to n8n.
   */
  getIdToken: () => Promise<string | null>;
}

/**
 * Create the context with undefined as default.
 * We'll throw an error if useAuth is called outside of AuthProvider.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Props for the AuthProvider component.
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider - Wraps the app and provides auth state to all children.
 * 
 * This component:
 * 1. Listens to Firebase Auth state changes
 * 2. Fetches the user's role from Firestore when they log in
 * 3. Provides auth state and actions to all child components
 * 
 * Place this at the root of your app:
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  // === State ===
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Listen to Firebase Auth state changes.
   * This runs once on mount and cleans up on unmount.
   * 
   * When auth state changes:
   * - If user logs in: fetch their role from Firestore
   * - If user logs out: clear user and role state
   */
  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is logged in
        setUser(firebaseUser);
        
        // Fetch their role from Firestore
        const userRole = await getUserRole(firebaseUser.uid);
        setRole(userRole);
      } else {
        // User is logged out
        setUser(null);
        setRole(null);
      }
      
      // Done loading initial auth state
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Sign up a new user.
   * Updates local state after successful signup.
   */
  const signUp = async (
    fullName: string,
    email: string,
    password: string,
    userRole: UserRole
  ): Promise<void> => {
    const result = await authSignUp(fullName, email, password, userRole);
    setUser(result.user);
    setRole(result.role);
  };

  /**
   * Log in an existing user.
   * Updates local state after successful login.
   * @returns The user's role after login
   */
  const login = async (email: string, password: string): Promise<{ role: UserRole }> => {
    const result = await authLogin(email, password);
    setUser(result.user);
    setRole(result.role);
    return { role: result.role };
  };

  /**
   * Log out the current user.
   * State is automatically cleared by onAuthStateChanged listener.
   */
  const logout = async (): Promise<void> => {
    await authLogout();
    // State will be cleared by the onAuthStateChanged listener
  };

  /**
   * Get a fresh ID token for API calls.
   */
  const getIdToken = async (): Promise<string | null> => {
    return getCurrentUserIdToken();
  };

  // === Context Value ===
  const value: AuthContextType = {
    user,
    role,
    loading,
    signUp,
    login,
    logout,
    getIdToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth - Hook to access auth state and actions.
 * 
 * Must be used within an AuthProvider.
 * 
 * @returns AuthContextType - The auth context value
 * @throws Error if used outside of AuthProvider
 * 
 * EXAMPLE:
 * ```tsx
 * function Dashboard() {
 *   const { user, role, logout } = useAuth();
 *   
 *   return (
 *     <div>
 *       <p>Logged in as: {user?.email}</p>
 *       <p>Role: {role}</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider. " +
      "Make sure your component is wrapped in <AuthProvider>."
    );
  }
  
  return context;
}
