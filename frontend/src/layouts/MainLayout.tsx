/**
 * =============================================================================
 * MAIN LAYOUT COMPONENT
 * =============================================================================
 * This layout wraps authenticated pages with a consistent header and navigation.
 * It provides:
 * - Header with logo and user info
 * - Navigation links based on user role
 * - Logout functionality
 * - Responsive sidebar for mobile
 * 
 * USAGE:
 * Wrap your page content with this layout:
 * ```tsx
 * <MainLayout>
 *   <YourPageContent />
 * </MainLayout>
 * ```
 * =============================================================================
 */

import React, { ReactNode, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ChatWidget } from "../components";
import "../styles/Layout.css";

/**
 * Props for the MainLayout component.
 */
interface MainLayoutProps {
  children: ReactNode;
}

/**
 * MainLayout - Provides consistent header, navigation, and footer.
 */
export function MainLayout({ children }: MainLayoutProps): JSX.Element {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /**
   * Handle logout button click.
   * Signs out the user and redirects to landing page.
   */
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  /**
   * Check if a nav link is active.
   */
  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  /**
   * Toggle mobile menu.
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="main-layout">
      {/* === Header === */}
      <header className="main-header">
        <div className="header-container">
          {/* Logo */}
          <Link to="/dashboard" className="header-logo">
            <span className="logo-icon">🏠</span>
            <span className="logo-text">Lighthouse AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="header-nav desktop-nav">
            {role === "employee" && (
              <>
                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/expenses/new"
                  className={`nav-link ${isActive("/expenses/new") ? "active" : ""}`}
                >
                  New Expense
                </Link>
              </>
            )}

            {role === "admin" && (
              <>
                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/policies"
                  className={`nav-link ${isActive("/admin/policies") ? "active" : ""}`}
                >
                  Policies
                </Link>
                <Link
                  to="/admin/expenses/pending"
                  className={`nav-link ${isActive("/admin/expenses/pending") ? "active" : ""}`}
                >
                  Pending
                </Link>
                <Link
                  to="/admin/expenses/flagged"
                  className={`nav-link ${isActive("/admin/expenses/flagged") ? "active" : ""}`}
                >
                  Flagged
                </Link>
              </>
            )}
          </nav>

          {/* User Info & Logout */}
          <div className="header-user">
            <div className="user-info">
              <span className="user-email">{user?.email}</span>
              <span className={`user-role role-${role}`}>{role}</span>
            </div>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="mobile-nav">
            {role === "employee" && (
              <>
                <Link
                  to="/dashboard"
                  className={`mobile-nav-link ${isActive("/dashboard") ? "active" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/expenses/new"
                  className={`mobile-nav-link ${isActive("/expenses/new") ? "active" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  New Expense
                </Link>
              </>
            )}

            {role === "admin" && (
              <>
                <Link
                  to="/dashboard"
                  className={`mobile-nav-link ${isActive("/dashboard") ? "active" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/policies"
                  className={`mobile-nav-link ${isActive("/admin/policies") ? "active" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Policies
                </Link>
                <Link
                  to="/admin/expenses/pending"
                  className={`mobile-nav-link ${isActive("/admin/expenses/pending") ? "active" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pending Expenses
                </Link>
                <Link
                  to="/admin/expenses/flagged"
                  className={`mobile-nav-link ${isActive("/admin/expenses/flagged") ? "active" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Flagged Expenses
                </Link>
              </>
            )}

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="mobile-logout-button"
            >
              Logout
            </button>
          </nav>
        )}
      </header>

      {/* === Main Content === */}
      <main className="main-content">
        <div className="content-container">{children}</div>
      </main>

      {/* === Footer === */}
      <footer className="main-footer">
        <div className="footer-container">
          <p className="footer-text">
            © {new Date().getFullYear()} Lighthouse AI. All rights reserved.
          </p>
          <p className="footer-tagline">
            Your AI Copilot for Enterprise Efficiency
          </p>
        </div>
      </footer>

      {/* === AI Chat Widget === */}
      <ChatWidget />
    </div>
  );
}

export default MainLayout;
