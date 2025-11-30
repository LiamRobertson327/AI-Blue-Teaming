/**
 * =============================================================================
 * EMPLOYEE SIGN UP PAGE
 * =============================================================================
 * Dedicated signup page for employees.
 * Role is hardcoded to "employee" - no selection needed.
 * =============================================================================
 */

import React, { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Auth.css";

/**
 * EmployeeSignUpPage - Signup page specifically for employees.
 */
export function EmployeeSignUpPage(): JSX.Element {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();

  // === Form State ===
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  if (user) {
    navigate("/dashboard", { replace: true });
  }

  /**
   * Validate the form before submission.
   */
  const validateForm = (): string | null => {
    if (fullName.trim().length < 2) {
      return "Please enter your full name (at least 2 characters).";
    }
    if (!email.includes("@") || !email.includes(".")) {
      return "Please enter a valid email address.";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match. Please try again.";
    }
    return null;
  };

  /**
   * Handle form submission.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Signup with role hardcoded to "employee"
      await signUp(fullName.trim(), email.trim(), password, "employee");
      
      // Signup successful - redirect to employee dashboard
      navigate("/employee/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Signup error:", err);
      
      const errorCode = err.code || "";
      let errorMessage = "An error occurred during signup. Please try again.";

      switch (errorCode) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists. Please log in instead.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak. Please use at least 6 characters.";
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
          <span className="logo-icon">👤</span>
          <h1 className="logo-text">Lighthouse AI</h1>
        </div>

        {/* Title */}
        <h2 className="auth-title">Create Employee Account</h2>
        <p className="auth-subtitle">Sign up to submit and track your expenses</p>

        {/* Error Message */}
        {error && (
          <div className="auth-error">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Full Name Field */}
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={loading}
              autoComplete="name"
            />
          </div>

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
              placeholder="At least 6 characters"
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              disabled={loading}
              autoComplete="new-password"
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
                Creating account...
              </>
            ) : (
              "Create Employee Account"
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login/employee" className="auth-link">
            Sign in as Employee
          </Link>
        </p>

        {/* Back to Home */}
        <Link to="/" className="auth-back-link">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default EmployeeSignUpPage;
