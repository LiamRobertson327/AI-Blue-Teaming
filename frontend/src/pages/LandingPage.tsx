/**
 * =============================================================================
 * LANDING PAGE
 * =============================================================================
 * The public landing page for Lighthouse AI.
 * Features a beautiful split layout with branding on the left and login form
 * on the right. Login form is embedded directly for seamless UX.
 * =============================================================================
 */

import React, { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Landing.css";

/**
 * LandingPage - The public entry point to the application.
 */
export function LandingPage(): JSX.Element {
  const navigate = useNavigate();
  const { login, user, role } = useAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to appropriate dashboard
  if (user && role) {
    if (role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/employee/dashboard", { replace: true });
    }
  }

  /**
   * Handle login form submission.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/employee/dashboard", { replace: true });
      }
    } catch (err: any) {
      console.error("Login error:", err);
      
      const errorCode = err.code || "";
      let errorMessage = "Invalid email or password.";

      switch (errorCode) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email.";
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many attempts. Try again later.";
          break;
        default:
          errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      {/* === Main Split Layout === */}
      <div className="landing-split">
        
        {/* Left Side - Branding */}
        <div className="landing-branding">
          <div className="branding-content">
            {/* Logo */}
            <div className="branding-logo">
              <span className="logo-icon-large">🏠</span>
              <h1 className="logo-title">Lighthouse AI</h1>
            </div>

            {/* Tagline */}
            <h2 className="branding-tagline">
              Your AI Copilot for<br />Enterprise Efficiency
            </h2>

            {/* Description */}
            <p className="branding-description">
              Streamline expense management with intelligent automation.
              Submit, track, and manage—all powered by AI.
            </p>

            {/* Feature Pills */}
            <div className="feature-pills">
              <span className="feature-pill">⚡ Fast Processing</span>
              <span className="feature-pill">🤖 AI-Powered</span>
              <span className="feature-pill">📋 Policy Compliant</span>
              <span className="feature-pill">📊 Real-time Insights</span>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="branding-decoration">
            <div className="decoration-circle decoration-circle--1"></div>
            <div className="decoration-circle decoration-circle--2"></div>
            <div className="decoration-circle decoration-circle--3"></div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="landing-form-section">
          <div className="login-card">
            <div className="login-card-header">
              <h2 className="login-title">Welcome back</h2>
              <p className="login-subtitle">Sign in to your account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="login-error">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <span className="button-loading">
                    <span className="spinner"></span>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="login-divider">
              <span>New to Lighthouse AI?</span>
            </div>

            {/* Sign Up Links */}
            <div className="signup-options">
              <Link to="/signup/employee" className="signup-option signup-option--employee">
                <span className="signup-icon">👤</span>
                <span className="signup-text">
                  <span className="signup-title">Sign up as Employee</span>
                  <span className="signup-desc">Submit & track expenses</span>
                </span>
              </Link>
              <Link to="/signup/admin" className="signup-option signup-option--admin">
                <span className="signup-icon">🛡️</span>
                <span className="signup-text">
                  <span className="signup-title">Sign up as Admin</span>
                  <span className="signup-desc">Manage & review</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* === Footer === */}
      <footer className="landing-footer">
        <p className="footer-text">
          © {new Date().getFullYear()} Lighthouse AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default LandingPage;
