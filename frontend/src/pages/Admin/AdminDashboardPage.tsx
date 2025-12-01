/**
 * =============================================================================
 * ADMIN DASHBOARD PAGE
 * =============================================================================
 * The main dashboard for administrators after login.
 * 
 * Features:
 * - Summary cards showing key metrics
 * - Quick action buttons for common tasks
 * - Overview of system status
 * 
 * DATA SOURCE:
 * Currently uses mock data from mockData.ts.
 * TODO: Replace with fetchAdminDashboard() from n8nClient.ts
 * =============================================================================
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "../../layouts/MainLayout";
import { fetchAdminDashboard } from "../../services/n8nClient";
import "../../styles/Dashboard.css";

/**
 * Admin dashboard statistics interface.
 */
interface AdminStats {
  activePolicies: number;
  pendingExpenses: number;
  flaggedSubmissions: number;
  anomaliesDetected: number;
}

/**
 * AdminDashboardPage - Main dashboard for administrators.
 */
export function AdminDashboardPage(): JSX.Element {
  // === State ===
  const [stats, setStats] = useState<AdminStats>({
    activePolicies: 0,
    pendingExpenses: 0,
    flaggedSubmissions: 0,
    anomaliesDetected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch dashboard data on component mount.
   * 
   * TODO: This currently uses mock data.
   * Replace with real API call when n8n backend is ready.
   */
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard data (currently returns mock data)
        const data = await fetchAdminDashboard();
        setStats(data);
      } catch (err) {
        console.error("Error loading admin dashboard:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <MainLayout>
      <div className="dashboard-page">
        {/* === Page Header === */}
        <div className="page-header">
          <div className="page-header-content">
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">
              Manage policies, review expenses, and monitor system health
            </p>
          </div>
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
              <div className="stat-card stat-card--policies">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <span className="stat-value">{stats.activePolicies}</span>
                  <span className="stat-label">Active Policies</span>
                </div>
              </div>

              <div className="stat-card stat-card--pending">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <span className="stat-value">{stats.pendingExpenses}</span>
                  <span className="stat-label">Pending Expenses</span>
                </div>
              </div>

              <div className="stat-card stat-card--flagged">
                <div className="stat-icon">🚩</div>
                <div className="stat-content">
                  <span className="stat-value">{stats.flaggedSubmissions}</span>
                  <span className="stat-label">Flagged Submissions</span>
                </div>
              </div>

              <div className="stat-card stat-card--anomalies">
                <div className="stat-icon">⚠️</div>
                <div className="stat-content">
                  <span className="stat-value">{stats.anomaliesDetected}</span>
                  <span className="stat-label">Anomalies Detected</span>
                </div>
              </div>
            </div>

            {/* === Quick Actions === */}
            <div className="quick-actions-section">
              <h2 className="section-title">Quick Actions</h2>
              
              <div className="quick-actions-grid">
                <Link to="/admin/policies" className="action-card">
                  <div className="action-icon">📄</div>
                  <div className="action-content">
                    <h3 className="action-title">Upload Policy</h3>
                    <p className="action-description">
                      Add new expense policies or update existing ones
                    </p>
                  </div>
                  <span className="action-arrow">→</span>
                </Link>

                <Link to="/admin/expenses/pending" className="action-card">
                  <div className="action-icon">✅</div>
                  <div className="action-content">
                    <h3 className="action-title">Review Pending Expenses</h3>
                    <p className="action-description">
                      Approve or deny {stats.pendingExpenses} pending submissions
                    </p>
                  </div>
                  <span className="action-arrow">→</span>
                </Link>

                <Link to="/admin/expenses/flagged" className="action-card action-card--warning">
                  <div className="action-icon">🚩</div>
                  <div className="action-content">
                    <h3 className="action-title">Review Flagged Submissions</h3>
                    <p className="action-description">
                      Investigate {stats.flaggedSubmissions} flagged expenses
                    </p>
                  </div>
                  <span className="action-arrow">→</span>
                </Link>

                <Link to="/admin/logs" className="action-card">
                  <div className="action-icon">📋</div>
                  <div className="action-content">
                    <h3 className="action-title">View System Logs</h3>
                    <p className="action-description">
                      Monitor workflow executions and system events
                    </p>
                  </div>
                  <span className="action-arrow">→</span>
                </Link>
              </div>
            </div>

            {/* === System Status === */}
            <div className="status-section">
              <h2 className="section-title">System Status</h2>
              
              <div className="status-grid">
                <div className="status-item">
                  <span className="status-indicator status-indicator--active"></span>
                  <span className="status-text">n8n Backend</span>
                  <span className="status-value">Connected</span>
                </div>
                
                <div className="status-item">
                  <span className="status-indicator status-indicator--active"></span>
                  <span className="status-text">Firebase Auth</span>
                  <span className="status-value">Active</span>
                </div>
                
                <div className="status-item">
                  <span className="status-indicator status-indicator--active"></span>
                  <span className="status-text">Policy Engine</span>
                  <span className="status-value">{stats.activePolicies} policies loaded</span>
                </div>
              </div>
            </div>

          </>
        )}
      </div>
    </MainLayout>
  );
}

export default AdminDashboardPage;
