/**
 * =============================================================================
 * N8N CLIENT SERVICE
 * =============================================================================
 * This file centralizes ALL communication with the n8n backend.
 * 
 * CURRENT STATE: STUB IMPLEMENTATIONS
 * All functions currently log payloads to console and return mock data.
 * 
 * INTEGRATION INSTRUCTIONS:
 * When the n8n backend is ready, replace the stub implementations with
 * actual HTTP calls. Each function has a commented example of the expected
 * fetch call.
 * 
 * PAYLOAD STRUCTURE:
 * All requests to n8n should include:
 * - idToken: Firebase ID token for authentication
 * - role: "employee" | "admin" for workflow routing
 * - ...additional data specific to the endpoint
 * 
 * N8N WEBHOOK ENDPOINTS (from n8n workflow analysis):
 * 
 * MAIN ENDPOINT: POST /webhook/Lighthouse-input
 * This single endpoint handles both file uploads and chat messages:
 * - If binary data (file) is present → Routes to file handling (XLS parsing, validation)
 * - If text/JSON is present → Routes to chat handling (prompt filter → AI agents)
 * 
 * The workflow includes these AI agents:
 * - Sheet Agent: Expense management, Google Sheets operations
 * - Drive Agent: Google Drive file operations
 * - Email Agent: Gmail operations
 * - RAG Agent: Question answering with vector database
 * 
 * Guardrails:
 * - Prompt injection detection via filter-service
 * - Malicious prompts get safe responses
 * 
 * SECURITY NOTE:
 * The n8n backend should validate the Firebase ID token before processing.
 * Never trust the role sent from the client without server-side verification.
 * =============================================================================
 */

import { auth } from "../config/firebase";
import {
  Expense,
  Policy,
  ExpenseFormData,
  ExpenseSubmissionPayload,
} from "../types";
import {
  mockEmployeeExpenses,
  mockPendingExpenses,
  mockFlaggedExpenses,
  mockPolicies,
  mockEmployeeDashboardStats,
  mockAdminDashboardStats,
} from "./mockData";

/**
 * Base URL for n8n webhooks.
 * Set this in your .env file as REACT_APP_N8N_BASE_URL.
 * Default is localhost:5678 for local development.
 */
const N8N_BASE_URL =
  process.env.REACT_APP_N8N_BASE_URL || "http://localhost:5678";

/**
 * Helper function to get the current user's ID token.
 * Call this before every API request to ensure a fresh token.
 */
async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) {
    console.warn("No user logged in, cannot get ID token");
    return null;
  }
  return user.getIdToken(true); // Force refresh
}

// =============================================================================
// EMPLOYEE ENDPOINTS
// =============================================================================

/**
 * Submit a new expense (manual form submission).
 * 
 * @param expenseData - The expense form data
 * @param role - The user's role (should be "employee")
 * @returns Promise with submission result
 * 
 * EXPECTED N8N WEBHOOK: POST /webhook/submit-expense
 * 
 * PAYLOAD STRUCTURE:
 * {
 *   idToken: string,
 *   role: "employee",
 *   submissionType: "manual",
 *   expense: {
 *     employeeId: string,
 *     category: string,
 *     amount: number,
 *     currency: string,
 *     description: string,
 *     vendor: string,
 *     paymentMethod: string,
 *     dateIncurred: string,
 *     reimbursementType: string,
 *     // receiptFile would be handled separately via file upload
 *   }
 * }
 */
export async function submitExpense(
  expenseData: ExpenseFormData,
  role: "employee" | "admin"
): Promise<{ success: boolean; message: string; expenseId?: string }> {
  const idToken = await getIdToken();

  const payload: ExpenseSubmissionPayload = {
    idToken,
    role,
    submissionType: "manual",
    expense: expenseData,
  };

  console.log("=== submitExpense ===");
  console.log("Sending to:", `${N8N_BASE_URL}/webhook/submit-expense`);
  console.log("Payload:", JSON.stringify(payload, null, 2));

  try {
    // Use dedicated webhook for manual expense submission
    const response = await fetch(`${N8N_BASE_URL}/webhook/submit-expense`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Response:", result);
    
    return {
      success: true,
      message: result.message || "Expense submitted successfully",
      expenseId: result.expenseId || result.TransactionID,
    };
  } catch (error) {
    console.error("Error submitting expense:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to submit expense. Please try again.",
    };
  }
}

/**
 * Submit expenses via CSV upload.
 * 
 * @param file - The CSV file to upload
 * @param role - The user's role
 * @returns Promise with submission result
 * 
 * EXPECTED N8N WEBHOOK: POST /webhook/expenseUpload
 * This endpoint already exists in the n8n workflow!
 * 
 * The existing workflow:
 * 1. Receives XLS/CSV file
 * 2. Converts to JSON
 * 3. Validates against expense_cfg.json schema
 * 4. Returns validation result
 * 
 * PAYLOAD: FormData with file as 'excel_file' (binary)
 */
export async function submitExpenseCSV(
  file: File,
  role: "employee" | "admin"
): Promise<{ success: boolean; message: string; validatedRows?: number; errors?: string[] }> {
  const idToken = await getIdToken();

  console.log("=== submitExpenseCSV ===");
  console.log("File:", file.name, "Size:", file.size, "bytes");
  console.log("Role:", role);
  console.log("Sending to:", `${N8N_BASE_URL}/webhook/Lighthouse-input`);

  try {
    // Create FormData and append the file as binary
    // Try with "data" which is n8n's default binary property name
    const formData = new FormData();
    formData.append("data", file, file.name);
    
    // Add metadata as additional fields
    if (idToken) {
      formData.append("idToken", idToken);
    }
    formData.append("role", role);

    const response = await fetch(`${N8N_BASE_URL}/webhook/Lighthouse-input`, {
      method: "POST",
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary for multipart
    });

    // Get raw response text first to handle empty responses
    const responseText = await response.text();
    console.log("Raw response:", responseText);

    if (!response.ok) {
      console.error("Server error:", responseText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle empty response
    if (!responseText || responseText.trim() === "") {
      return {
        success: true,
        message: "File uploaded and processed successfully.",
      };
    }

    // Try to parse as JSON
    let result: any;
    try {
      result = JSON.parse(responseText);
    } catch {
      // Plain text response
      return {
        success: true,
        message: responseText,
      };
    }

    console.log("Parsed response:", result);

    // Handle the response from n8n/filter service
    // Response can be: array [{body: {...}}] or object {body: {...}} or direct {allowed: ...}
    let body: any;
    
    if (Array.isArray(result) && result.length > 0) {
      // n8n returns array like [{body: {...}, statusCode: 200}]
      body = result[0].body || result[0];
    } else if (result.body) {
      body = result.body;
    } else {
      body = result;
    }

    console.log("Extracted body:", body);
    
    if (body.allowed === false) {
      return {
        success: false,
        message: body.messages?.join(", ") || body.error || "Validation failed",
        errors: body.messages || [body.error],
      };
    }

    // Check if we have validated_data (success case)
    const validatedCount = body.validated_data?.length || 0;
    
    return {
      success: true,
      message: validatedCount > 0 
        ? `Successfully processed ${validatedCount} expense(s)` 
        : "File uploaded and processed successfully",
      validatedRows: validatedCount,
    };
  } catch (error) {
    console.error("Error uploading CSV:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to upload file. Please try again.",
    };
  }
}

/**
 * Fetch employee expense history from the Master Expense Sheet.
 * Queries n8n which fetches from Google Sheets filtered by Employee ID.
 * 
 * @param employeeId - The employee's unique ID (e.g., "EMP-001")
 * @returns Promise with array of expenses for this employee
 */
export async function fetchEmployeeExpenses(employeeId: string): Promise<Expense[]> {
  const idToken = await getIdToken();

  console.log("=== fetchEmployeeExpenses ===");
  console.log("Employee ID:", employeeId);
  console.log("ID Token:", idToken ? "Present" : "Missing");

  try {
    // Use production webhook for fetching expenses (separate workflow)
    const response = await fetch(`${N8N_BASE_URL}/webhook/fetch-expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "fetch_expenses",
        employeeId: employeeId,
        role: "employee",
        idToken,
      }),
    });

    const responseText = await response.text();
    console.log("Raw response:", responseText);

    if (!responseText || responseText.trim() === "") {
      console.log("Empty response, returning empty array");
      return [];
    }

    let data = JSON.parse(responseText);
    
    // Handle n8n array wrapper
    if (Array.isArray(data)) {
      // If it's an array of expense objects directly
      if (data.length > 0 && data[0].TransactionID) {
        console.log("Found expense array directly");
        return data.map(mapSheetRowToExpense);
      }
      // If wrapped in response object
      if (data.length > 0) {
        data = data[0];
      }
    }

    // Extract expenses from various response formats
    if (data.expenses && Array.isArray(data.expenses)) {
      return data.expenses.map(mapSheetRowToExpense);
    }

    if (data.body?.expenses && Array.isArray(data.body.expenses)) {
      return data.body.expenses.map(mapSheetRowToExpense);
    }

    // Check if data itself is an expense object
    if (data.TransactionID || data.EmployeeID) {
      console.log("Single expense object found");
      return [mapSheetRowToExpense(data)];
    }

    // Try to parse if it's a string response containing JSON
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.map(mapSheetRowToExpense);
        }
      } catch {
        // Not JSON, ignore
      }
    }

    console.log("No expenses found in response");
    return [];
  } catch (error) {
    console.error("Error fetching employee expenses:", error);
    return [];
  }
}

/**
 * Map a row from Google Sheets to our Expense type.
 */
function mapSheetRowToExpense(row: any): Expense {
  return {
    id: row.TransactionID || row.id || `exp-${Date.now()}`,
    transactionId: row.TransactionID || row.transactionId,
    employeeId: row.EmployeeID || row.employeeId || "",
    category: row.Category || row.category || "Other",
    amount: parseFloat(row.Amount || row.amount || 0),
    amountUSD: row.AmountUSD ? parseFloat(row.AmountUSD) : undefined,
    currency: row.Currency || row.currency || "USD",
    description: row.Description || row.description || "",
    vendor: row.Vendor || row.vendor,
    dateIncurred: row.DateIncurred || row.dateIncurred || new Date().toISOString(),
    dateSubmitted: row.DateSubmitted || row.dateSubmitted,
    status: mapStatus(row.Status || row.status),
    paymentMethod: row.PaymentMethod || row.paymentMethod || "",
    reimbursementType: row.ReimbursementType || row.reimbursementType || "",
    receiptAttached: row.ReceiptAttached === "Y" || row.receiptAttached === "Y" ? "Y" : "N",
  };
}

/**
 * Map status string to our ExpenseStatus type.
 */
function mapStatus(status: string | undefined): "pending" | "approved" | "denied" | "flagged" {
  if (!status) return "pending";
  const s = status.toLowerCase();
  if (s === "approved") return "approved";
  if (s === "denied" || s === "rejected") return "denied";
  if (s === "flagged") return "flagged";
  return "pending";
}

/**
 * Fetch employee dashboard data.
 * Returns expense history and statistics for the logged-in employee.
 * 
 * @param employeeId - The employee's unique ID (e.g., "EMP-001")
 * @returns Promise with dashboard data
 */
export async function fetchEmployeeDashboard(employeeId?: string): Promise<{
  expenses: Expense[];
  stats: typeof mockEmployeeDashboardStats;
}> {
  const idToken = await getIdToken();

  console.log("=== fetchEmployeeDashboard ===");
  console.log("Employee ID:", employeeId || "Not provided");
  console.log("ID Token:", idToken ? "Present" : "Missing");

  // If employeeId is provided, fetch real data
  if (employeeId) {
    try {
      const expenses = await fetchEmployeeExpenses(employeeId);
      
      // Calculate stats from real expenses
      const stats = {
        pendingCount: expenses.filter(e => e.status === "pending").length,
        approvedCount: expenses.filter(e => e.status === "approved").length,
        deniedCount: expenses.filter(e => e.status === "denied").length,
        reimbursementTotal: expenses
          .filter(e => e.status === "approved")
          .reduce((sum, e) => sum + e.amount, 0),
      };

      return { expenses, stats };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Fall back to mock data on error
    }
  }

  // Fallback: Return mock data
  console.log("Using mock data for dashboard");
  return {
    expenses: mockEmployeeExpenses,
    stats: mockEmployeeDashboardStats,
  };
}

// =============================================================================
// ADMIN ENDPOINTS
// =============================================================================

/**
 * Fetch admin dashboard data.
 * Returns summary statistics for the admin dashboard.
 * 
 * @returns Promise with dashboard statistics
 * 
 * TODO: Create n8n webhook endpoint for this
 * EXPECTED N8N WEBHOOK: GET /webhook/admin-dashboard
 */
export async function fetchAdminDashboard(): Promise<
  typeof mockAdminDashboardStats
> {
  const idToken = await getIdToken();

  console.log("=== STUB: fetchAdminDashboard ===");
  console.log("ID Token:", idToken ? "Present" : "Missing");
  console.log("Target URL:", `${N8N_BASE_URL}/webhook/admin-dashboard`);

  // TODO: Implement actual API call
  // STUB: Return mock data
  return mockAdminDashboardStats;
}

/**
 * Fetch all pending expenses for admin review.
 * 
 * @returns Promise with list of pending expenses
 * 
 * TODO: Create n8n webhook endpoint for this
 * EXPECTED N8N WEBHOOK: GET /webhook/admin/pending-expenses
 */
export async function fetchPendingExpenses(): Promise<Expense[]> {
  const idToken = await getIdToken();

  console.log("=== STUB: fetchPendingExpenses ===");
  console.log("ID Token:", idToken ? "Present" : "Missing");
  console.log("Target URL:", `${N8N_BASE_URL}/webhook/admin/pending-expenses`);

  // TODO: Implement actual API call
  // STUB: Return mock data
  return mockPendingExpenses;
}

/**
 * Fetch all flagged expenses for admin review.
 * 
 * @returns Promise with list of flagged expenses
 * 
 * TODO: Create n8n webhook endpoint for this
 * EXPECTED N8N WEBHOOK: GET /webhook/admin/flagged-expenses
 */
export async function fetchFlaggedExpenses(): Promise<Expense[]> {
  const idToken = await getIdToken();

  console.log("=== STUB: fetchFlaggedExpenses ===");
  console.log("ID Token:", idToken ? "Present" : "Missing");
  console.log("Target URL:", `${N8N_BASE_URL}/webhook/admin/flagged-expenses`);

  // TODO: Implement actual API call
  // STUB: Return mock data
  return mockFlaggedExpenses;
}

/**
 * Send admin decision (approve/deny) for an expense.
 * 
 * @param expenseId - The expense to approve/deny
 * @param decision - "approve" or "deny"
 * @param reason - Optional reason for the decision
 * @returns Promise with result
 * 
 * TODO: Create n8n webhook endpoint for this
 * EXPECTED N8N WEBHOOK: POST /webhook/admin/decision
 * 
 * PAYLOAD STRUCTURE:
 * {
 *   idToken: string,
 *   role: "admin",
 *   expenseId: string,
 *   decision: "approve" | "deny",
 *   reason?: string
 * }
 */
export async function sendAdminDecision(
  expenseId: string,
  decision: "approve" | "deny",
  reason?: string
): Promise<{ success: boolean; message: string }> {
  const idToken = await getIdToken();

  const payload = {
    idToken,
    role: "admin",
    expenseId,
    decision,
    reason,
  };

  console.log("=== STUB: sendAdminDecision ===");
  console.log("Payload:", JSON.stringify(payload, null, 2));
  console.log("Target URL:", `${N8N_BASE_URL}/webhook/admin/decision`);

  // TODO: Implement actual API call
  // try {
  //   const response = await fetch(`${N8N_BASE_URL}/webhook/admin/decision`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(payload),
  //   });
  //
  //   if (!response.ok) {
  //     throw new Error(`HTTP error! status: ${response.status}`);
  //   }
  //
  //   return { success: true, message: `Expense ${decision}d successfully` };
  // } catch (error) {
  //   console.error("Error sending decision:", error);
  //   return { success: false, message: "Failed to process decision" };
  // }

  // STUB: Return mock success
  return {
    success: true,
    message: `Expense ${decision}d successfully (MOCK)`,
  };
}

// =============================================================================
// POLICY ENDPOINTS
// =============================================================================

/**
 * Fetch all policies.
 * 
 * @returns Promise with list of policies
 * 
 * TODO: Create n8n webhook endpoint for this
 * EXPECTED N8N WEBHOOK: GET /webhook/admin/policies
 */
export async function fetchPolicies(): Promise<Policy[]> {
  const idToken = await getIdToken();

  console.log("=== STUB: fetchPolicies ===");
  console.log("ID Token:", idToken ? "Present" : "Missing");
  console.log("Target URL:", `${N8N_BASE_URL}/webhook/admin/policies`);

  // TODO: Implement actual API call
  // STUB: Return mock data
  return mockPolicies;
}

/**
 * Upload a new policy document.
 * 
 * @param file - The policy file (JSON or PDF)
 * @param policyName - Name for the policy
 * @returns Promise with upload result
 * 
 * TODO: Create n8n webhook endpoint for this
 * EXPECTED N8N WEBHOOK: POST /webhook/admin/policy-upload
 */
export async function uploadPolicy(
  file: File,
  policyName: string
): Promise<{ success: boolean; message: string; policyId?: string }> {
  const idToken = await getIdToken();

  console.log("=== STUB: uploadPolicy ===");
  console.log("File:", file.name, "Size:", file.size, "bytes");
  console.log("Policy Name:", policyName);
  console.log("ID Token:", idToken ? "Present" : "Missing");
  console.log("Target URL:", `${N8N_BASE_URL}/webhook/admin/policy-upload`);

  // TODO: Implement actual API call with FormData
  // STUB: Return mock success
  return {
    success: true,
    message: "Policy uploaded successfully (MOCK)",
    policyId: `pol-${Date.now()}`,
  };
}

/**
 * Update policy status (activate/deactivate).
 * 
 * @param policyId - The policy to update
 * @param status - New status ("active" or "inactive")
 * @returns Promise with result
 * 
 * TODO: Create n8n webhook endpoint for this
 * EXPECTED N8N WEBHOOK: POST /webhook/admin/policy-status
 */
export async function updatePolicyStatus(
  policyId: string,
  status: "active" | "inactive"
): Promise<{ success: boolean; message: string }> {
  const idToken = await getIdToken();

  const payload = {
    idToken,
    role: "admin",
    policyId,
    status,
  };

  console.log("=== STUB: updatePolicyStatus ===");
  console.log("Payload:", JSON.stringify(payload, null, 2));
  console.log("Target URL:", `${N8N_BASE_URL}/webhook/admin/policy-status`);

  // TODO: Implement actual API call
  // STUB: Return mock success
  return {
    success: true,
    message: `Policy ${status === "active" ? "activated" : "deactivated"} successfully (MOCK)`,
  };
}

// =============================================================================
// CHAT ENDPOINT
// =============================================================================

/**
 * Send a chat message to the AI assistant.
 * 
 * @param message - The user's message
 * @param role - The user's role (affects context/permissions)
 * @returns Promise with AI response
 * 
 * TODO: Connect to n8n chat webhook
 * EXPECTED N8N WEBHOOK: POST /webhook/chat
 */
export async function sendChatMessage(
  message: string,
  role: "employee" | "admin"
): Promise<{ success: boolean; message: string }> {
  const idToken = await getIdToken();

  // The n8n workflow expects { text: "..." } for chat messages
  const payload = {
    text: message,
    // Include additional context that n8n can use
    role,
    idToken,
  };

  console.log("=== sendChatMessage ===");
  console.log("Sending to:", `${N8N_BASE_URL}/webhook/Lighthouse-input`);
  console.log("Payload:", JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${N8N_BASE_URL}/webhook/Lighthouse-input`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Get the raw response text first
    const responseText = await response.text();
    console.log("Raw response:", responseText);

    if (!response.ok) {
      console.error("Server error:", responseText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle empty response
    if (!responseText || responseText.trim() === "") {
      return {
        success: true,
        message: "Request processed, but no response was returned.",
      };
    }

    // Try to parse as JSON, otherwise use as plain text
    let result: string;
    try {
      const jsonResult = JSON.parse(responseText);
      // Handle different response formats from different agents
      result = jsonResult.output || jsonResult.text || jsonResult.message || jsonResult.response || JSON.stringify(jsonResult);
    } catch {
      // Plain text response
      result = responseText;
    }

    console.log("Parsed response:", result);

    return {
      success: true,
      message: result,
    };
  } catch (error) {
    console.error("Chat error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Sorry, I couldn't process your request. Please try again.",
    };
  }
}
