/**
 * =============================================================================
 * POLICIES PAGE
 * =============================================================================
 * Admin page for managing expense policies.
 * 
 * Features:
 * - Upload new policy documents (JSON/PDF)
 * - View list of existing policies
 * - Activate/deactivate policies
 * 
 * DATA SOURCE:
 * Currently uses mock data from mockData.ts.
 * TODO: Replace with fetchPolicies(), uploadPolicy(), updatePolicyStatus() from n8nClient.ts
 * =============================================================================
 */

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { MainLayout } from "../../layouts/MainLayout";
import { Policy } from "../../types";
import {
  fetchPolicies,
  uploadPolicy,
  updatePolicyStatus,
} from "../../services/n8nClient";
import "../../styles/Dashboard.css";
import "../../styles/Forms.css";

/**
 * PoliciesPage - Admin page for policy management.
 */
export function PoliciesPage(): JSX.Element {
  // === State ===
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Upload form state
  const [policyName, setPolicyName] = useState("");
  const [policyFile, setPolicyFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
   * Handle file selection for policy upload.
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPolicyFile(file);
  };

  /**
   * Handle policy upload form submission.
   * 
   * TODO: Replace stub call with real n8n webhook.
   * The payload should include the policy file and metadata.
   */
  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!policyName.trim()) {
      setError("Please enter a policy name.");
      return;
    }

    if (!policyFile) {
      setError("Please select a policy file.");
      return;
    }

    setUploading(true);

    try {
      const result = await uploadPolicy(policyFile, policyName.trim());

      if (result.success) {
        setSuccess(result.message);
        setPolicyName("");
        setPolicyFile(null);
        // Refresh policies list
        await loadPolicies();
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Error uploading policy:", err);
      setError("Failed to upload policy. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  /**
   * Toggle policy status (active/inactive).
   * 
   * TODO: Replace stub call with real n8n webhook.
   */
  const handleToggleStatus = async (policy: Policy) => {
    const newStatus = policy.status === "active" ? "inactive" : "active";

    try {
      const result = await updatePolicyStatus(policy.id, newStatus);

      if (result.success) {
        // Update local state
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
            Upload and manage expense policies
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

        {/* === Upload Section === */}
        <div className="card">
          <h2 className="card-title">Upload New Policy</h2>
          
          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="policyName" className="form-label">
                  Policy Name *
                </label>
                <input
                  type="text"
                  id="policyName"
                  className="form-input"
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                  placeholder="e.g., Travel Expense Policy 2024"
                  disabled={uploading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="policyFile" className="form-label">
                  Policy File (JSON or PDF) *
                </label>
                <input
                  type="file"
                  id="policyFile"
                  className="form-file-input"
                  onChange={handleFileChange}
                  accept=".json,.pdf"
                  disabled={uploading}
                />
              </div>

              <div className="form-group form-group--button">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload Policy"}
                </button>
              </div>
            </div>
          </form>

          {/* Integration notice */}
          <p className="form-hint">
            {/* 
              TODO: Connect to n8n webhook for policy upload.
              The webhook should validate the policy format and store it.
            */}
            Accepted formats: JSON (structured rules) or PDF (document)
          </p>
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
              <p className="empty-hint">Upload your first policy above.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Policy ID</th>
                    <th>Name</th>
                    <th>Date Uploaded</th>
                    <th>Status</th>
                    <th>Limits / Rules Summary</th>
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
                      <td>{formatDate(policy.dateUploaded)}</td>
                      <td>
                        <span
                          className={`status-badge status-badge--${policy.status}`}
                        >
                          {policy.status}
                        </span>
                      </td>
                      <td className="limits-cell">{policy.limitsSummary}</td>
                      <td>
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

        {/* === Data Source Notice === */}
        <div className="data-notice">
          <p>
            <strong>Note:</strong> Policy management is currently using mock data.
            {/* 
              TODO: Connect to n8n webhooks:
              - GET /webhook/admin/policies - Fetch all policies
              - POST /webhook/admin/policy-upload - Upload new policy
              - POST /webhook/admin/policy-status - Update policy status
            */}
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

export default PoliciesPage;
