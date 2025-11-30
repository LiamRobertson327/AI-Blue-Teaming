/**
 * =============================================================================
 * LOGIN PAGE
 * =============================================================================
 * Single login page for all users.
 * After login, users are automatically redirected to the correct dashboard
 * based on their role stored in Firestore.
 * =============================================================================
 */

import React, { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Auth.css";

/**
 * LoginPage - Single login page for employees and admins.
 */
export function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const { login, user, role } = useAuth();

  // === Form State ===
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
   * Handle form submission.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Login and get the user's role from Firestore
      const result = await login(email, password);
      
      // Redirect based on role
      if (result.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/employee/dashboard", { replace: true });
      }
    } catch (err: any) {
      console.error("Login error:", err);
      
      const errorCode = err.code || "";
      let errorMessage = "An error occurred during login. Please try again.";

      switch (errorCode) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email. Please sign up first.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password. Please try again.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password. Please check and try again.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
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
    <div className="auth-page">
      <div className="auth-container">
        {/* Logo */}
        <div className="auth-logo">
          <span className="logo-icon">🏠</span>
          <h1 className="logo-text">Lighthouse AI</h1>
        </div>

        {/* Title */}
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>

        {/* Error Message */}
        {error && (
          <div className="auth-error">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
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

          {/* Password Field */}
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
              placeholder="Enter your password"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Sign Up Links */}
        <div className="auth-footer">
          <p>Don't have an account?</p>
          <div className="signup-links">
            <Link to="/signup/employee" className="auth-link">
              Sign up as Employee
            </Link>
            <span className="link-separator">|</span>
            <Link to="/signup/admin" className="auth-link">
              Sign up as Admin
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <Link to="/" className="auth-back-link">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;
