/**
 * =============================================================================
 * EMPLOYEE DASHBOARD PAGE
 * =============================================================================
 * The main dashboard for employees after login.
 * 
 * Features:
 * - Summary cards showing expense statistics
 * - Table of expense history (fetched from Master Expense Sheet via n8n)
 * - Quick action button to submit new expense
 * - Displays employee ID and bank account info
 * =============================================================================
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "../../layouts/MainLayout";
import { Expense, UserProfile } from "../../types";
import { fetchEmployeeDashboard } from "../../services/n8nClient";
import { getUserProfile } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Dashboard.css";

/**
 * Dashboard statistics interface.
 */
interface DashboardStats {
  pendingCount: number;
  approvedCount: number;
  deniedCount: number;
  reimbursementTotal: number;
}

/**
 * EmployeeDashboardPage - Main dashboard for employees.
 */
export function EmployeeDashboardPage(): JSX.Element {
  const { user } = useAuth();
  
  // === State ===
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    pendingCount: 0,
    approvedCount: 0,
    deniedCount: 0,
    reimbursementTotal: 0,
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user profile and dashboard data on component mount.
   * Uses the employee's ID to fetch their expenses from the Master Expense Sheet.
   */
  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.uid) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // First, get the user's profile to get their employee ID
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);

        if (profile?.employeeId) {
          // Fetch dashboard data using the employee ID
          console.log("Fetching expenses for employee:", profile.employeeId);
          const data = await fetchEmployeeDashboard(profile.employeeId);
          
          setExpenses(data.expenses);
          
          // Calculate stats from expenses
          const pendingCount = data.expenses.filter(e => e.status === "pending").length;
          const approvedCount = data.expenses.filter(e => e.status === "approved").length;
          const deniedCount = data.expenses.filter(e => e.status === "denied").length;
          const reimbursementTotal = data.expenses
            .filter(e => e.status === "approved")
            .reduce((sum, e) => sum + e.amount, 0);
          
          setStats({
            pendingCount,
            approvedCount,
            deniedCount,
            reimbursementTotal,
          });
        } else {
          console.log("No employee ID found, using mock data");
          const data = await fetchEmployeeDashboard();
          setExpenses(data.expenses);
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user?.uid]);

  /**
   * Get CSS class for status badge.
   */
  const getStatusClass = (status: string): string => {
    switch (status) {
      case "approved":
        return "status-badge status-badge--approved";
      case "denied":
        return "status-badge status-badge--denied";
      case "pending":
        return "status-badge status-badge--pending";
      case "flagged":
        return "status-badge status-badge--flagged";
      default:
        return "status-badge";
    }
  };

  /**
   * Format currency amount.
   */
  const formatCurrency = (amount: number, currency: string = "USD"): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  /**
   * Format date string.
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <MainLayout>
      <div className="dashboard-page">
        {/* === Page Header === */}
        <div className="page-header">
          <div className="page-header-content">
            <h1 className="page-title">Employee Dashboard</h1>
            <p className="page-subtitle">
              Track your expenses and reimbursements
            </p>
            {userProfile && (
              <div className="employee-info">
                <span className="employee-badge">
                  <strong>Employee ID:</strong> {userProfile.employeeId || "Not assigned"}
                </span>
                <span className="employee-badge">
                  <strong>Bank Account:</strong> ****{userProfile.bankAccountNumber?.slice(-4) || "N/A"}
                </span>
              </div>
            )}
          </div>
          <Link to="/expenses/new" className="primary-button">
            + Submit New Expense
          </Link>
        </div>

        {/* === Error Message === */}
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* === Loading State === */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* === Statistics Cards === */}
            <div className="stats-grid">
              <div className="stat-card stat-card--pending">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <span className="stat-value">{stats.pendingCount}</span>
                  <span className="stat-label">Pending Requests</span>
                </div>
              </div>

              <div className="stat-card stat-card--approved">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <span className="stat-value">{stats.approvedCount}</span>
                  <span className="stat-label">Approved Requests</span>
                </div>
              </div>

              <div className="stat-card stat-card--denied">
                <div className="stat-icon">❌</div>
                <div className="stat-content">
                  <span className="stat-value">{stats.deniedCount}</span>
                  <span className="stat-label">Denied Requests</span>
                </div>
              </div>

              <div className="stat-card stat-card--total">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <span className="stat-value">
                    {formatCurrency(stats.reimbursementTotal)}
                  </span>
                  <span className="stat-label">Total Reimbursed</span>
                </div>
              </div>
            </div>

            {/* === Expense History Table === */}
            <div className="table-section">
              <h2 className="section-title">My Expense History</h2>
              
              {expenses.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📋</span>
                  <p className="empty-text">No expenses submitted yet.</p>
                  <Link to="/expenses/new" className="secondary-button">
                    Submit your first expense
                  </Link>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Submission Date</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Decision Reason</th>
                        <th>Log ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense) => (
                        <tr key={expense.id}>
                          <td>{formatDate(expense.dateSubmitted || expense.dateIncurred)}</td>
                          <td>{expense.category}</td>
                          <td>{formatCurrency(expense.amount, expense.currency)}</td>
                          <td>
                            <span className={getStatusClass(expense.status)}>
                              {expense.status}
                            </span>
                          </td>
                          <td>{expense.decisionReason || "-"}</td>
                          <td>
                            <code className="log-id">{expense.logId || "-"}</code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* === Data Source Notice === */}
            {!userProfile?.employeeId && (
              <div className="data-notice">
                <p>
                  <strong>Note:</strong> Showing sample data. Your expenses will appear once you submit them.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default EmployeeDashboardPage;
