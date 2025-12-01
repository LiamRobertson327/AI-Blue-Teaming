/**
 * =============================================================================
 * NEW EXPENSE PAGE
 * =============================================================================
 * Allows employees to submit new expenses via:
 * 1. Manual form entry
 * 2. CSV file upload
 * 
 * INTEGRATION NOTES:
 * - Manual form calls submitExpense() from n8nClient.ts
 * - CSV upload calls submitExpenseCSV() from n8nClient.ts
 * - Both are currently stubbed and log to console
 * 
 * TODO: Wire up to real n8n webhooks when backend is ready
 * =============================================================================
 */

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../layouts/MainLayout";
import { useAuth } from "../../context/AuthContext";
import { ExpenseFormData, UserProfile } from "../../types";
import { submitExpense, submitExpenseCSV } from "../../services/n8nClient";
import { getUserProfile } from "../../services/authService";
import {
  expenseCategories,
  paymentMethods,
  reimbursementTypes,
  currencies,
} from "../../services/mockData";
import "../../styles/Forms.css";

/**
 * Tab type for switching between manual and CSV upload.
 */
type SubmissionTab = "manual" | "csv";

/**
 * NewExpensePage - Form for submitting new expenses.
 */
/**
 * Generate unique Transaction ID in format T-XXX
 */
function generateTransactionId(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `T-${timestamp.slice(-3)}${random.slice(-3)}`;
}

export function NewExpensePage(): JSX.Element {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  // === User Profile State ===
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // === Tab State ===
  const [activeTab, setActiveTab] = useState<SubmissionTab>("manual");

  // === Manual Form State ===
  const [formData, setFormData] = useState<ExpenseFormData>({
    employeeId: "",
    category: "",
    amount: 0,
    currency: "USD",
    description: "",
    vendor: "",
    paymentMethod: "",
    dateIncurred: new Date().toISOString().split("T")[0],
    reimbursementType: "",
    receiptFile: null,
  });

  // Fetch user profile to get employee ID
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.uid) {
        const profile = await getUserProfile(user.uid);
        if (profile?.employeeId) {
          setUserProfile(profile);
          setFormData(prev => ({ ...prev, employeeId: profile.employeeId || "" }));
        }
      }
    };
    loadUserProfile();
  }, [user?.uid]);

  // === CSV Upload State ===
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvFileData, setCsvFileData] = useState<ArrayBuffer | null>(null);

  // === UI State ===
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Handle form field changes.
   */
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  /**
   * Handle receipt file selection.
   */
  const handleReceiptChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      receiptFile: file,
    }));
  };

  /**
   * Handle CSV file selection.
   * Reads file into memory immediately to prevent ERR_UPLOAD_FILE_CHANGED errors.
   */
  const handleCsvChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCsvFile(file);
    
    if (file) {
      try {
        // Read file into memory immediately to prevent stale file reference
        const arrayBuffer = await file.arrayBuffer();
        setCsvFileData(arrayBuffer);
      } catch (err) {
        console.error("Error reading file:", err);
        setError("Failed to read file. Please try again.");
        setCsvFile(null);
        setCsvFileData(null);
      }
    } else {
      setCsvFileData(null);
    }
  };

  /**
   * Validate manual form before submission.
   */
  const validateManualForm = (): string | null => {
    if (!formData.category) {
      return "Please select a category.";
    }
    if (formData.amount <= 0) {
      return "Amount must be greater than 0.";
    }
    if (!formData.description.trim()) {
      return "Description is required.";
    }
    if (!formData.paymentMethod) {
      return "Please select a payment method.";
    }
    if (!formData.reimbursementType) {
      return "Please select a reimbursement type.";
    }
    return null;
  };

  /**
   * Handle manual form submission.
   * 
   * TODO: Replace stub call with real n8n webhook.
   * The payload should include:
   * {
   *   idToken: string,
   *   role: "employee",
   *   submissionType: "manual",
   *   expense: { ...formData }
   * }
   */
  const handleManualSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate form
    const validationError = validateManualForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Build complete expense data with auto-generated fields
      const completeExpenseData = {
        ...formData,
        transactionId: generateTransactionId(),
        dateSubmitted: new Date().toISOString().split("T")[0],
        receiptAttached: formData.receiptFile ? "Y" : "N",
      };
      
      console.log("Submitting expense:", completeExpenseData);
      const result = await submitExpense(completeExpenseData, role || "employee");

      if (result.success) {
        setSuccess(result.message);
        // Navigate back to dashboard after short delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Error submitting expense:", err);
      setError("Failed to submit expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle CSV upload submission.
   * 
   * TODO: Replace stub call with real n8n webhook.
   * The existing n8n workflow at /webhook/expenseUpload expects
   * the file as 'excel_file' in FormData.
   */
  const handleCsvSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!csvFile || !csvFileData) {
      setError("Please select a CSV file to upload.");
      return;
    }

    setLoading(true);

    try {
      // Create a new File from the stored ArrayBuffer to avoid stale file reference
      const freshFile = new File([csvFileData], csvFile.name, { type: csvFile.type });
      const result = await submitExpenseCSV(freshFile, role || "employee");

      if (result.success) {
        setSuccess(`${result.message} (${result.validatedRows} rows processed)`);
        // Navigate back to dashboard after short delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Error uploading CSV:", err);
      setError("Failed to upload CSV. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="form-page">
        {/* === Page Header === */}
        <div className="page-header">
          <h1 className="page-title">Submit New Expense</h1>
          <p className="page-subtitle">
            Enter expense details manually or upload a CSV file
          </p>
        </div>

        {/* === Tab Navigation === */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === "manual" ? "active" : ""}`}
            onClick={() => setActiveTab("manual")}
          >
            📝 Manual Form
          </button>
          <button
            className={`tab-button ${activeTab === "csv" ? "active" : ""}`}
            onClick={() => setActiveTab("csv")}
          >
            📄 CSV Upload
          </button>
        </div>

        {/* === Messages === */}
        {error && (
          <div className="message message--error">
            <span className="message-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="message message--success">
            <span className="message-icon">✅</span>
            <span>{success}</span>
          </div>
        )}

        {/* === Manual Form Tab === */}
        {activeTab === "manual" && (
          <form onSubmit={handleManualSubmit} className="expense-form">
            <div className="form-grid">
              {/* Employee ID - Read Only */}
              <div className="form-group">
                <label htmlFor="employeeId" className="form-label">
                  Employee ID
                </label>
                <input
                  type="text"
                  id="employeeId"
                  name="employeeId"
                  className="form-input form-input--readonly"
                  value={formData.employeeId || "Loading..."}
                  readOnly
                  disabled
                />
              </div>

              {/* Category */}
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
                  required
                  disabled={loading}
                >
                  <option value="">Select category...</option>
                  {expenseCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="form-group">
                <label htmlFor="amount" className="form-label">
                  Amount *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  className="form-input"
                  value={formData.amount || ""}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>

              {/* Currency */}
              <div className="form-group">
                <label htmlFor="currency" className="form-label">
                  Currency *
                </label>
                <select
                  id="currency"
                  name="currency"
                  className="form-select"
                  value={formData.currency}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  {currencies.map((cur) => (
                    <option key={cur} value={cur}>
                      {cur}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Incurred */}
              <div className="form-group">
                <label htmlFor="dateIncurred" className="form-label">
                  Date Incurred *
                </label>
                <input
                  type="date"
                  id="dateIncurred"
                  name="dateIncurred"
                  className="form-input"
                  value={formData.dateIncurred}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              {/* Vendor */}
              <div className="form-group">
                <label htmlFor="vendor" className="form-label">
                  Vendor
                </label>
                <input
                  type="text"
                  id="vendor"
                  name="vendor"
                  className="form-input"
                  value={formData.vendor}
                  onChange={handleInputChange}
                  placeholder="e.g., Delta Airlines"
                  disabled={loading}
                />
              </div>

              {/* Payment Method */}
              <div className="form-group">
                <label htmlFor="paymentMethod" className="form-label">
                  Payment Method *
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  className="form-select"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select method...</option>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reimbursement Type */}
              <div className="form-group">
                <label htmlFor="reimbursementType" className="form-label">
                  Reimbursement Type *
                </label>
                <select
                  id="reimbursementType"
                  name="reimbursementType"
                  className="form-select"
                  value={formData.reimbursementType}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select type...</option>
                  {reimbursementTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description - Full Width */}
            <div className="form-group form-group--full">
              <label htmlFor="description" className="form-label">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the expense..."
                rows={3}
                required
                disabled={loading}
              />
            </div>

            {/* Receipt Upload */}
            <div className="form-group form-group--full">
              <label htmlFor="receipt" className="form-label">
                Receipt (optional)
              </label>
              <input
                type="file"
                id="receipt"
                name="receipt"
                className="form-file-input"
                onChange={handleReceiptChange}
                accept="image/*,.pdf"
                disabled={loading}
              />
              <p className="form-hint">
                Accepted formats: Images (JPG, PNG) or PDF
              </p>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/dashboard")}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Expense"}
              </button>
            </div>
          </form>
        )}

        {/* === CSV Upload Tab === */}
        {activeTab === "csv" && (
          <form onSubmit={handleCsvSubmit} className="expense-form">
            <div className="csv-upload-section">
              <div className="csv-info">
                <h3>CSV File Requirements</h3>
                <p>Your CSV file must include the following headers:</p>
                <code className="csv-headers">
                  TransactionID,EmployeeID,DateIncurred,DateSubmitted,Description,Vendor,PaymentMethod,Currency,Amount,AmountUSD,Category,ReceiptAttached,ReimbursementType
                </code>
                <p className="form-hint">
                  Required fields: TransactionID, EmployeeID, DateIncurred,
                  PaymentMethod, Currency, Amount, Category, ReimbursementType
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="csvFile" className="form-label">
                  Select File (CSV, XLS, XLSX) *
                </label>
                <input
                  type="file"
                  id="csvFile"
                  name="csvFile"
                  className="form-file-input"
                  onChange={handleCsvChange}
                  accept=".csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  required
                  disabled={loading}
                />
              </div>

              {csvFile && (
                <div className="file-preview">
                  <span className="file-icon">📄</span>
                  <span className="file-name">{csvFile.name}</span>
                  <span className="file-size">
                    ({(csvFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/dashboard")}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={loading || !csvFile}
              >
                {loading ? "Uploading..." : "Upload File"}
              </button>
            </div>
          </form>
        )}

        {/* === Integration Notice === */}
        <div className="data-notice">
          <p>
            <strong>Note:</strong> Form submissions are currently logged to
            console (stub implementation).
            {/* 
              TODO: Replace with actual n8n webhook calls.
              See n8nClient.ts for the expected payload structure.
            */}
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

export default NewExpensePage;
