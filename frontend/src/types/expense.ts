/**
 * =============================================================================
 * EXPENSE TYPES
 * =============================================================================
 * Type definitions for expense-related data structures.
 * These types align with the n8n backend schema defined in:
 * - n8n/expense_cfg.json (expense_report_paradigm)
 * 
 * The field names match the backend exactly to ensure seamless integration.
 * =============================================================================
 */

/**
 * ExpenseStatus - Possible states of an expense submission.
 * - "pending": Awaiting admin review
 * - "approved": Approved by admin, ready for reimbursement
 * - "denied": Rejected by admin
 * - "flagged": Marked for additional review (anomaly detected)
 */
export type ExpenseStatus = "pending" | "approved" | "denied" | "flagged";

/**
 * ExpenseCategory - Common expense categories.
 * These should match what the backend/policy expects.
 */
export type ExpenseCategory =
  | "Travel"
  | "Meals & Entertainment"
  | "Office Supplies"
  | "Software & Subscriptions"
  | "Equipment"
  | "Training & Education"
  | "Utilities"
  | "Marketing"
  | "Other";

/**
 * PaymentMethod - How the expense was paid.
 */
export type PaymentMethod =
  | "Corporate Card"
  | "Personal Card"
  | "Cash"
  | "Bank Transfer"
  | "Other";

/**
 * ReimbursementType - Who should be reimbursed.
 */
export type ReimbursementType =
  | "Employee"
  | "Corporate Card Issuer"
  | "Vendor Direct"
  | "N/A";

/**
 * Expense - Main expense record structure.
 * Field names match the n8n backend schema for seamless integration.
 * 
 * Required fields (per expense_cfg.json):
 * - TransactionID, EmployeeID, DateIncurred, PaymentMethod, Currency, Amount, Category, ReimbursementType
 * 
 * Optional fields:
 * - DateSubmitted, Description, Vendor, AmountUSD, ReceiptAttached
 */
export interface Expense {
  // === Core Identifiers ===
  id: string;                          // Internal frontend ID
  transactionId?: string;              // TransactionID from backend
  employeeId: string;                  // EmployeeID - who submitted this

  // === Dates ===
  dateIncurred: string;                // DateIncurred - when expense occurred (ISO string)
  dateSubmitted?: string;              // DateSubmitted - when submitted (ISO string)

  // === Description ===
  description: string;                 // Description - what the expense is for
  vendor?: string;                     // Vendor - where the expense was made

  // === Payment Details ===
  paymentMethod: string;               // PaymentMethod - how it was paid
  currency: string;                    // Currency - e.g., "USD", "EUR"
  amount: number;                      // Amount - in original currency
  amountUSD?: number;                  // AmountUSD - converted to USD

  // === Categorization ===
  category: string;                    // Category - expense type
  receiptAttached: "Y" | "N";          // ReceiptAttached - whether receipt is uploaded
  reimbursementType: string;           // ReimbursementType - who gets reimbursed

  // === Status & Review (frontend-specific) ===
  status: ExpenseStatus;               // Current status in workflow
  decisionReason?: string;             // Reason for approval/denial
  policyUsed?: string;                 // Which policy was applied
  logId?: string;                      // Audit log reference

  // === Flagging & Risk (for anomaly detection) ===
  riskScore?: number;                  // Risk score from AI analysis (0-100)
  flagReason?: string;                 // Why it was flagged
}

/**
 * ExpenseFormData - Data structure for the new expense form.
 * This is what the user fills out before submission.
 */
export interface ExpenseFormData {
  employeeId: string;
  category: ExpenseCategory | string;
  amount: number;
  currency: string;
  description: string;
  vendor: string;
  paymentMethod: PaymentMethod | string;
  dateIncurred: string;
  reimbursementType: ReimbursementType | string;
  receiptFile?: File | null;
}

/**
 * ExpenseSubmissionPayload - What we send to the n8n backend.
 * Includes auth token and role for routing.
 */
export interface ExpenseSubmissionPayload {
  idToken: string | null;
  role: "employee" | "admin";
  submissionType: "manual" | "csv";
  expense?: ExpenseFormData;
  csvFileMetadata?: {
    fileName: string;
    rowCount: number;
  };
}

/**
 * CSVExpenseRow - Structure of a row in the CSV upload.
 * Headers must match exactly:
 * TransactionID,EmployeeID,DateIncurred,DateSubmitted,Description,Vendor,PaymentMethod,Currency,Amount,AmountUSD,Category,ReceiptAttached,ReimbursementType
 */
export interface CSVExpenseRow {
  TransactionID: string;
  EmployeeID: string;
  DateIncurred: string;
  DateSubmitted?: string;
  Description?: string;
  Vendor?: string;
  PaymentMethod: string;
  Currency: string;
  Amount: number;
  AmountUSD?: number;
  Category: string;
  ReceiptAttached?: "Y" | "N";
  ReimbursementType: string;
}
