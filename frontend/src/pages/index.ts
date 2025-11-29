/**
 * =============================================================================
 * PAGES INDEX
 * =============================================================================
 * Central export file for all page components.
 * Allows cleaner imports throughout the application.
 * =============================================================================
 */

// Public Pages
export { LandingPage } from "./LandingPage";

// Auth Pages
export { LoginPage } from "./Auth/LoginPage";
export { EmployeeSignUpPage } from "./Auth/EmployeeSignUpPage";
export { AdminSignUpPage } from "./Auth/AdminSignUpPage";

// Employee Pages
export { EmployeeDashboardPage } from "./Employee/EmployeeDashboardPage";
export { NewExpensePage } from "./Employee/NewExpensePage";

// Admin Pages
export { AdminDashboardPage } from "./Admin/AdminDashboardPage";
export { PoliciesPage } from "./Admin/PoliciesPage";
export { PendingExpensesPage } from "./Admin/PendingExpensesPage";
export { FlaggedExpensesPage } from "./Admin/FlaggedExpensesPage";
