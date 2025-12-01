/**
 * =============================================================================
 * POLICIES PAGE
 * =============================================================================
 * Admin page for managing expense policies.
 * 
 * Features:
 * - Create new policies via form
 * - View list of existing policies
 * - Activate/deactivate policies
 * 
 * DATA SOURCE:
 * Sends policy data to n8n webhook which stores in Firestore.
 * =============================================================================
 */

import React, { useEffect, useState, FormEvent } from "react";
import { MainLayout } from "../../layouts/MainLayout";
import { Policy } from "../../types";
import {
  fetchPolicies,
  createPolicy,
  updatePolicyStatus,
} from "../../services/n8nClient";
import "../../styles/Dashboard.css";
import "../../styles/Forms.css";

// Expense categories matching the employee form
const EXPENSE_CATEGORIES = [
  "Global",
  "Travel",
  "Meals & Entertainment",
  "Office Supplies",
  "Software & Subscriptions",
  "Equipment",
  "Training & Education",
  "Utilities",
  "Marketing",
  "Other",
];

/**
 * PolicyFormData - Form data for creating a new policy
 */
interface PolicyFormData {
  name: string;
  category: string;
  maxAmount: number;
  currency: string;
  requiresReceipt: boolean;
  requiresApproval: boolean;
  approvalThreshold: number;
  description: string;
}

const initialFormData: PolicyFormData = {
  name: "",
  category: "Global",
  maxAmount: 0,
  currency: "USD",
  requiresReceipt: true,
  requiresApproval: true,
  approvalThreshold: 100,
  description: "",
};

/**
 * PoliciesPage - Admin page for policy management.
 */
export function PoliciesPage(): JSX.Element {
  // === State ===
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<PolicyFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  
  // Edit mode state
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  /**
   * Fetch policies on component mount.
   */
  useEffect(() => {
    loadPolicies();
  }, []);

  /**
   * Load policies from backend.
   */
  const loadPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPolicies();
      setPolicies(data);
    } catch (err) {
      console.error("Error loading policies:", err);
      setError("Failed to load policies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle form input changes
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      // Round to 2 decimal places to avoid floating-point precision issues
      const numValue = parseFloat(value) || 0;
      const roundedValue = Math.round(numValue * 100) / 100;
      setFormData((prev) => ({ ...prev, [name]: roundedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  /**
   * Handle edit button click - populate form with policy data
   */
  const handleEditClick = (policy: Policy) => {
    setEditingPolicy(policy);
    setIsEditMode(true);
    setFormData({
      name: policy.name,
      category: policy.category || "Global",
      maxAmount: Math.round(Number(policy.maxAmount || 0) * 100) / 100,
      currency: policy.currency || "USD",
      requiresReceipt: policy.requiresReceipt || false,
      requiresApproval: policy.requiresApproval || false,
      approvalThreshold: Math.round(Number(policy.approvalThreshold || 100) * 100) / 100,
      description: policy.description || "",
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Cancel edit mode
   */
  const handleCancelEdit = () => {
    setEditingPolicy(null);
    setIsEditMode(false);
    setFormData(initialFormData);
  };

  /**
   * Handle policy form submission (create or update).
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Please enter a policy name.");
      return;
    }

    if (formData.maxAmount <= 0) {
      setError("Please enter a valid maximum amount.");
      return;
    }

    setSubmitting(true);

    try {
      // Round numeric values to avoid floating-point precision issues
      const cleanedFormData = {
        ...formData,
        maxAmount: Math.round(Number(formData.maxAmount)),
        approvalThreshold: Math.round(Number(formData.approvalThreshold)),
      };
      
      // If editing, include the existing policy ID
      const policyData = isEditMode && editingPolicy 
        ? { ...cleanedFormData, id: editingPolicy.id }
        : cleanedFormData;
      
      const result = await createPolicy(policyData as any);

      if (result.success) {
        setSuccess(isEditMode ? "Policy updated successfully!" : "Policy created successfully!");
        setFormData(initialFormData);
        setEditingPolicy(null);
        setIsEditMode(false);
        // Refresh policies list
        await loadPolicies();
      } else {
        setError(result.message || "Failed to save policy.");
      }
    } catch (err) {
      console.error("Error saving policy:", err);
      setError("Failed to save policy. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Toggle policy status (active/inactive).
   */
  const handleToggleStatus = async (policy: Policy) => {
    const newStatus = policy.status === "active" ? "inactive" : "active";

    try {
      const result = await updatePolicyStatus(policy.id, newStatus);

      if (result.success) {
        setPolicies((prev) =>
          prev.map((p) =>
            p.id === policy.id ? { ...p, status: newStatus } : p
          )
        );
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Error updating policy status:", err);
      setError("Failed to update policy status.");
    }
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
          <h1 className="page-title">Policy Management</h1>
          <p className="page-subtitle">
            Create and manage expense policies
          </p>
        </div>

        {/* === Messages === */}
        {error && (
          <div className="message message--error">
            <span className="message-icon">⚠️</span>
            <span>{error}</span>
            <button
              className="message-close"
              onClick={() => setError(null)}
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="message message--success">
            <span className="message-icon">✅</span>
            <span>{success}</span>
            <button
              className="message-close"
              onClick={() => setSuccess(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* === Create/Edit Policy Form === */}
        <div className="card">
          <div className="card-header-row">
            <h2 className="card-title">
              {isEditMode ? `Edit Policy: ${editingPolicy?.name}` : "Create New Policy"}
            </h2>
            {isEditMode && (
              <button
                type="button"
                className="secondary-button"
                onClick={handleCancelEdit}
              >
                Cancel Edit
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="policy-form">
            {/* Row 1: Name and Category */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Policy Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Global Expense Limit Policy"
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={submitting}
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Max Amount and Currency */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="maxAmount" className="form-label">
                  Maximum Amount *
                </label>
                <input
                  type="number"
                  id="maxAmount"
                  name="maxAmount"
                  className="form-input"
                  value={formData.maxAmount || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., 5000"
                  min="0"
                  step="0.01"
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="currency" className="form-label">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  className="form-select"
                  value={formData.currency}
                  onChange={handleInputChange}
                  disabled={submitting}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="approvalThreshold" className="form-label">
                  Approval Threshold
                </label>
                <input
                  type="number"
                  id="approvalThreshold"
                  name="approvalThreshold"
                  className="form-input"
                  value={formData.approvalThreshold || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., 100"
                  min="0"
                  step="0.01"
                  disabled={submitting}
                />
                <span className="form-hint">Expenses above this require approval</span>
              </div>
            </div>

            {/* Row 3: Checkboxes */}
            <div className="form-row">
              <div className="form-group form-group--checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="requiresReceipt"
                    checked={formData.requiresReceipt}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                  <span>Requires Receipt</span>
                </label>
              </div>

              <div className="form-group form-group--checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="requiresApproval"
                    checked={formData.requiresApproval}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                  <span>Requires Approval</span>
                </label>
              </div>
            </div>

            {/* Row 4: Description */}
            <div className="form-row">
              <div className="form-group form-group--full">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the policy rules and conditions..."
                  rows={3}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={submitting}
              >
                {submitting 
                  ? (isEditMode ? "Updating..." : "Creating...") 
                  : (isEditMode ? "Update Policy" : "Create Policy")}
              </button>
              {isEditMode && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* === Policies Table === */}
        <div className="table-section">
          <h2 className="section-title">Existing Policies</h2>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading policies...</p>
            </div>
          ) : policies.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📋</span>
              <p className="empty-text">No policies found.</p>
              <p className="empty-hint">Create your first policy above.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Policy ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Max Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map((policy) => (
                    <tr key={policy.id}>
                      <td>
                        <code className="policy-id">{policy.id}</code>
                      </td>
                      <td>{policy.name}</td>
                      <td>{policy.category || "Global"}</td>
                      <td>{policy.limitsSummary}</td>
                      <td>
                        <span
                          className={`status-badge status-badge--${policy.status}`}
                        >
                          {policy.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="edit-button"
                          onClick={() => handleEditClick(policy)}
                          title="Edit policy"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className={`toggle-button ${
                            policy.status === "active"
                              ? "toggle-button--deactivate"
                              : "toggle-button--activate"
                          }`}
                          onClick={() => handleToggleStatus(policy)}
                        >
                          {policy.status === "active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default PoliciesPage;
