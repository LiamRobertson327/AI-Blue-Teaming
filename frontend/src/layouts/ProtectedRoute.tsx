/**
 * =============================================================================
 * PROTECTED ROUTE COMPONENT
 * =============================================================================
 * This component wraps routes that require authentication.
 * It handles:
 * - Redirecting unauthenticated users to login
 * - Role-based access control (employee vs admin)
 * - Loading states while auth is being checked
 * 
 * USAGE:
 * ```tsx
 * // Protect a route for any authenticated user
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <DashboardPage />
 *   </ProtectedRoute>
 * } />
 * 
 * // Protect a route for admins only
 * <Route path="/admin/policies" element={
 *   <ProtectedRoute requiredRole="admin">
 *     <PoliciesPage />
 *   </ProtectedRoute>
 * } />
 * 
 * // Protect a route for employees only
 * <Route path="/expenses/new" element={
 *   <ProtectedRoute requiredRole="employee">
 *     <NewExpensePage />
 *   </ProtectedRoute>
 * } />
 * ```
 * =============================================================================
 */

import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";

/**
 * Props for the ProtectedRoute component.
 */
interface ProtectedRouteProps {
  /** The content to render if access is granted */
  children: ReactNode;
  
  /**
   * Optional role requirement.
   * If set, only users with this role can access the route.
   * If not set, any authenticated user can access.
   */
  requiredRole?: UserRole;
}

/**
 * ProtectedRoute - Wrapper component for authenticated routes.
 * 
 * BEHAVIOR:
 * 1. While loading auth state → Show loading indicator
 * 2. If not logged in → Redirect to /login
 * 3. If logged in but wrong role → Redirect to /dashboard or show 403
 * 4. If logged in with correct role → Render children
 * 
 * @param children - The protected content to render
 * @param requiredRole - Optional role requirement
 */
export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps): JSX.Element {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  // === Loading State ===
  // Show a loading indicator while Firebase checks auth state.
  // This prevents a flash of the login page on page refresh.
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  // === Not Authenticated ===
  // Redirect to login page, preserving the intended destination.
  // After login, we can redirect back to where they wanted to go.
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // === Role Check ===
  // If a specific role is required, check if the user has it.
  if (requiredRole && role !== requiredRole) {
    // User is logged in but doesn't have the required role.
    // Option 1: Redirect to their appropriate dashboard
    // Option 2: Show a 403 Forbidden page
    
    // We'll redirect to /dashboard which will then redirect to the
    // appropriate dashboard based on their actual role.
    console.warn(
      `Access denied: User role "${role}" tried to access route requiring "${requiredRole}"`
    );
    
    return (
      <div className="access-denied-container">
        <div className="access-denied-content">
          <h1 className="access-denied-title">403 - Access Denied</h1>
          <p className="access-denied-message">
            You don't have permission to access this page.
          </p>
          <p className="access-denied-role">
            Your role: <strong>{role}</strong>
          </p>
          <p className="access-denied-required">
            Required role: <strong>{requiredRole}</strong>
          </p>
          <a href="/dashboard" className="access-denied-link">
            Go to your dashboard
          </a>
        </div>
      </div>
    );
  }

  // === Access Granted ===
  // User is authenticated and has the required role (if any).
  // Render the protected content.
  return <>{children}</>;
}

/**
 * Default export for convenience.
 */
export default ProtectedRoute;
