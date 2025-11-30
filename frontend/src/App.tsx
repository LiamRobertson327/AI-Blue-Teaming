/**
 * =============================================================================
 * APP.TSX - Main Application Component
 * =============================================================================
 * The root component that sets up routing and authentication context.
 * 
 * ROUTING STRUCTURE:
 * - / : Landing page (public)
 * - /login/employee : Employee login page
 * - /login/admin : Admin login page
 * - /signup/employee : Employee signup page
 * - /signup/admin : Admin signup page
 * - /dashboard : Redirects to role-appropriate dashboard
 * - /employee/dashboard : Employee dashboard
 * - /expenses/new : New expense form (employee only)
 * - /admin/dashboard : Admin dashboard
 * - /admin/policies : Policy management (admin only)
 * - /admin/expenses/pending : Pending expenses review (admin only)
 * - /admin/expenses/flagged : Flagged expenses review (admin only)
 * 
 * AUTHENTICATION:
 * - AuthProvider wraps the entire app to provide auth context
 * - ProtectedRoute components enforce authentication and role requirements
 * =============================================================================
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./layouts/ProtectedRoute";
import {
  LandingPage,
  LoginPage,
  EmployeeSignUpPage,
  AdminSignUpPage,
  EmployeeDashboardPage,
  NewExpensePage,
  AdminDashboardPage,
  PoliciesPage,
  PendingExpensesPage,
  FlaggedExpensesPage,
  LogsPage,
} from "./pages";

/**
 * DashboardRedirect - Redirects to the appropriate dashboard based on user role.
 * 
 * This component is used at /dashboard to automatically redirect users
 * to either the employee or admin dashboard based on their role.
 */
function DashboardRedirect(): JSX.Element {
  const { role, loading } = useAuth();

  // Show loading while determining role
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect based on role
  if (role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Default to employee dashboard
  return <Navigate to="/employee/dashboard" replace />;
}

/**
 * AppRoutes - Defines all application routes.
 * 
 * Separated from App to allow useAuth hook usage (must be inside AuthProvider).
 */
function AppRoutes(): JSX.Element {
  return (
    <Routes>
      {/* === Public Routes === */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* === Signup Routes (separate for employee and admin) === */}
      <Route path="/signup/employee" element={<EmployeeSignUpPage />} />
      <Route path="/signup/admin" element={<AdminSignUpPage />} />

      {/* === Dashboard Redirect === */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* === Employee Routes === */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute requiredRole="employee">
            <EmployeeDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses/new"
        element={
          <ProtectedRoute requiredRole="employee">
            <NewExpensePage />
          </ProtectedRoute>
        }
      />

      {/* === Admin Routes === */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/policies"
        element={
          <ProtectedRoute requiredRole="admin">
            <PoliciesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/expenses/pending"
        element={
          <ProtectedRoute requiredRole="admin">
            <PendingExpensesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/expenses/flagged"
        element={
          <ProtectedRoute requiredRole="admin">
            <FlaggedExpensesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/logs"
        element={
          <ProtectedRoute requiredRole="admin">
            <LogsPage />
          </ProtectedRoute>
        }
      />

      {/* === Catch-all: Redirect to landing === */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * App - The root application component.
 * 
 * Wraps the entire application with:
 * - BrowserRouter for client-side routing
 * - AuthProvider for authentication state management
 */
function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
