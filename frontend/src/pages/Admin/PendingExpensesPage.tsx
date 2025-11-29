/**
 * =============================================================================
 * PENDING EXPENSES PAGE
 * =============================================================================
 * Admin page for reviewing and processing pending expense submissions.
 * 
 * Features:
 * - View all pending expenses in a table
 * - Click to view expense details in a modal
 * - Approve or deny expenses with optional reason
 * 
 * DATA SOURCE:
 * Currently uses mock data from mockData.ts.
 * TODO: Replace with fetchPendingExpenses(), sendAdminDecision() from n8nClient.ts
 * =============================================================================
 */

import React, { useEffect, useState } from "react";
import { MainLayout } from "../../layouts/MainLayout";
import { Expense } from "../../types";
import { fetchPendingExpenses, sendAdminDecision } from "../../services/n8nClient";
import "../../styles/Dashboard.css";
import "../../styles/Modal.css";

/**
 * PendingExpensesPage - Admin page for reviewing pending expenses.
 */
export function PendingExpensesPage(): JSX.Element {
  // === State ===
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal state
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [decisionReason, setDecisionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  /**
   * Fetch pending expenses on component mount.
   */
  useEffect(() => {
    loadExpenses();
  }, []);

  /**
   * Load pending expenses from backend.
   */
  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPendingExpenses();
      setExpenses(data);
    } catch (err) {
      console.error("Error loading pending expenses:", err);
      setError("Failed to load pending expenses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle expense row click - open detail modal.
   */
  const handleRowClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setDecisionReason("");
  };

  /**
   * Close the detail modal.
   */
  const closeModal = () => {
    setSelectedExpense(null);
    setDecisionReason("");
  };

  /**
   * Handle approve/deny decision.
   * 
   * TODO: Replace stub call with real n8n webhook.
   * The payload should include:
   * {
   *   idToken: string,
   *   role: "admin",
   *   expenseId: string,
   *   decision: "approve" | "deny",
   *   reason?: string
   * }
   */
  const handleDecision = async (decision: "approve" | "deny") => {
    if (!selectedExpense) return;

    setProcessing(true);
    setError(null);

    try {
      const result = await sendAdminDecision(
        selectedExpense.id,
        decision,
        decisionReason || undefined
      );

      if (result.success) {
        setSuccess(result.message);
        // Remove the expense from the list
        setExpenses((prev) =>
          prev.filter((e) => e.id !== selectedExpense.id)
        );
        closeModal();
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Error processing decision:", err);
      setError("Failed to process decision. Please try again.");
    } finally {
      setProcessing(false);
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
          <h1 className="page-title">Pending Expenses</h1>
          <p className="page-subtitle">
            Review and process {expenses.length} pending expense submissions
          </p>
        </div>

        {/* === Messages === */}
        {error && (
          <div className="message message--error">
            <span className="message-icon">⚠️</span>
            <span>{error}</span>
            <button className="message-close" onClick={() => setError(null)}>
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="message message--success">
            <span className="message-icon">✅</span>
            <span>{success}</span>
            <button className="message-close" onClick={() => setSuccess(null)}>
              ×
            </button>
          </div>
        )}

        {/* === Expenses Table === */}
        <div className="table-section">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading pending expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">✅</span>
              <p className="empty-text">No pending expenses!</p>
              <p className="empty-hint">All submissions have been processed.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table data-table--clickable">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Policy Used</th>
                    <th>Status</th>
                    <th>Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      onClick={() => handleRowClick(expense)}
                      className="clickable-row"
                    >
                      <td>{expense.employeeId}</td>
                      <td>{formatCurrency(expense.amount, expense.currency)}</td>
                      <td>{expense.category}</td>
                      <td>{expense.policyUsed || "-"}</td>
                      <td>
                        <span className="status-badge status-badge--pending">
                          {expense.status}
                        </span>
                      </td>
                      <td>
                        {expense.flagReason ? (
                          <span className="flag-indicator" title={expense.flagReason}>
                            🚩
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* === Detail Modal === */}
        {selectedExpense && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Expense Details</h2>
                <button className="modal-close" onClick={closeModal}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                {/* Expense Details */}
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Transaction ID</span>
                    <span className="detail-value">
                      {selectedExpense.transactionId || selectedExpense.id}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Employee ID</span>
                    <span className="detail-value">{selectedExpense.employeeId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date Incurred</span>
                    <span className="detail-value">
                      {formatDate(selectedExpense.dateIncurred)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date Submitted</span>
                    <span className="detail-value">
                      {selectedExpense.dateSubmitted
                        ? formatDate(selectedExpense.dateSubmitted)
                        : "-"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Amount</span>
                    <span className="detail-value detail-value--amount">
                      {formatCurrency(selectedExpense.amount, selectedExpense.currency)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Category</span>
                    <span className="detail-value">{selectedExpense.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Vendor</span>
                    <span className="detail-value">
                      {selectedExpense.vendor || "-"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Payment Method</span>
                    <span className="detail-value">
                      {selectedExpense.paymentMethod}
                    </span>
                  </div>
                  <div className="detail-item detail-item--full">
                    <span className="detail-label">Description</span>
                    <span className="detail-value">
                      {selectedExpense.description}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Receipt Attached</span>
                    <span className="detail-value">
                      {selectedExpense.receiptAttached === "Y" ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Policy Used</span>
                    <span className="detail-value">
                      {selectedExpense.policyUsed || "-"}
                    </span>
                  </div>
                </div>

                {/* Decision Reason Input */}
                <div className="decision-section">
                  <label htmlFor="decisionReason" className="form-label">
                    Decision Reason (optional)
                  </label>
                  <textarea
                    id="decisionReason"
                    className="form-textarea"
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    placeholder="Enter reason for approval or denial..."
                    rows={3}
                    disabled={processing}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  className="danger-button"
                  onClick={() => handleDecision("deny")}
                  disabled={processing}
                >
                  {processing ? "Processing..." : "Deny"}
                </button>
                <button
                  className="success-button"
                  onClick={() => handleDecision("approve")}
                  disabled={processing}
                >
                  {processing ? "Processing..." : "Approve"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === Data Source Notice === */}
        <div className="data-notice">
          <p>
            <strong>Note:</strong> This page is currently showing mock data.
            {/* 
              TODO: Connect to n8n webhooks:
              - GET /webhook/admin/pending-expenses - Fetch pending expenses
              - POST /webhook/admin/decision - Send approve/deny decision
            */}
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

export default PendingExpensesPage;
