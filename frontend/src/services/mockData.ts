/**
 * =============================================================================
 * MOCK DATA
 * =============================================================================
 * This file contains mock data for development and testing purposes.
 * 
 * TODO: Replace all mock data with real API calls to n8n backend.
 * See n8nClient.ts for the stub functions that will make these calls.
 * 
 * The data structures here match the types defined in src/types/
 * and align with the n8n backend schema from expense_cfg.json.
 * =============================================================================
 */

import { Expense, Policy } from "../types";

/**
 * Mock expenses for the Employee Dashboard.
 * These simulate what would be returned from the n8n backend.
 * 
 * TODO: Replace with fetchEmployeeDashboard() from n8nClient.ts
 */
export const mockEmployeeExpenses: Expense[] = [
  {
    id: "exp-001",
    transactionId: "T-001",
    employeeId: "EMP-401",
    dateIncurred: "2024-01-15",
    dateSubmitted: "2024-01-16",
    description: "Flight to NYC for client meeting",
    vendor: "Delta Airlines",
    paymentMethod: "Corporate Card",
    currency: "USD",
    amount: 450.75,
    amountUSD: 450.75,
    category: "Travel",
    receiptAttached: "Y",
    reimbursementType: "Corporate Card Issuer",
    status: "approved",
    decisionReason: "Within policy limits",
    policyUsed: "Standard Travel Policy",
    logId: "LOG-2024-001",
  },
  {
    id: "exp-002",
    transactionId: "T-002",
    employeeId: "EMP-401",
    dateIncurred: "2024-01-18",
    dateSubmitted: "2024-01-18",
    description: "Dinner with client - Project kickoff",
    vendor: "Local Bistro",
    paymentMethod: "Personal Card",
    currency: "EUR",
    amount: 85.50,
    amountUSD: 92.35,
    category: "Meals & Entertainment",
    receiptAttached: "Y",
    reimbursementType: "Employee",
    status: "approved",
    decisionReason: "Client entertainment approved",
    policyUsed: "Entertainment Policy",
    logId: "LOG-2024-002",
  },
  {
    id: "exp-003",
    transactionId: "T-003",
    employeeId: "EMP-401",
    dateIncurred: "2024-01-20",
    dateSubmitted: "2024-01-21",
    description: "Office supplies for home office",
    vendor: "Office Depot",
    paymentMethod: "Personal Card",
    currency: "USD",
    amount: 125.00,
    amountUSD: 125.00,
    category: "Office Supplies",
    receiptAttached: "Y",
    reimbursementType: "Employee",
    status: "pending",
    policyUsed: "Remote Work Policy",
    logId: "LOG-2024-003",
  },
  {
    id: "exp-004",
    transactionId: "T-004",
    employeeId: "EMP-401",
    dateIncurred: "2024-01-22",
    dateSubmitted: "2024-01-22",
    description: "Software subscription - Design tools",
    vendor: "Figma Inc",
    paymentMethod: "Corporate Card",
    currency: "USD",
    amount: 15.00,
    amountUSD: 15.00,
    category: "Software & Subscriptions",
    receiptAttached: "Y",
    reimbursementType: "Corporate Card Issuer",
    status: "denied",
    decisionReason: "Already covered by company license",
    policyUsed: "Software Policy",
    logId: "LOG-2024-004",
  },
  {
    id: "exp-005",
    transactionId: "T-005",
    employeeId: "EMP-401",
    dateIncurred: "2024-01-25",
    dateSubmitted: "2024-01-25",
    description: "Conference registration - Tech Summit 2024",
    vendor: "TechConf Inc",
    paymentMethod: "Personal Card",
    currency: "USD",
    amount: 599.00,
    amountUSD: 599.00,
    category: "Training & Education",
    receiptAttached: "Y",
    reimbursementType: "Employee",
    status: "pending",
    policyUsed: "Training Policy",
    logId: "LOG-2024-005",
  },
];

/**
 * Mock pending expenses for Admin review.
 * 
 * TODO: Replace with fetchPendingExpenses() from n8nClient.ts
 */
export const mockPendingExpenses: Expense[] = [
  {
    id: "exp-101",
    transactionId: "T-101",
    employeeId: "EMP-402",
    dateIncurred: "2024-01-24",
    dateSubmitted: "2024-01-24",
    description: "Hotel stay - 3 nights in San Francisco",
    vendor: "Marriott Hotels",
    paymentMethod: "Corporate Card",
    currency: "USD",
    amount: 750.00,
    amountUSD: 750.00,
    category: "Travel",
    receiptAttached: "Y",
    reimbursementType: "Corporate Card Issuer",
    status: "pending",
    policyUsed: "Standard Travel Policy",
    logId: "LOG-2024-101",
  },
  {
    id: "exp-102",
    transactionId: "T-102",
    employeeId: "EMP-403",
    dateIncurred: "2024-01-23",
    dateSubmitted: "2024-01-24",
    description: "Team lunch - 8 people",
    vendor: "The Cheesecake Factory",
    paymentMethod: "Personal Card",
    currency: "USD",
    amount: 285.50,
    amountUSD: 285.50,
    category: "Meals & Entertainment",
    receiptAttached: "Y",
    reimbursementType: "Employee",
    status: "pending",
    policyUsed: "Entertainment Policy",
    logId: "LOG-2024-102",
  },
  {
    id: "exp-103",
    transactionId: "T-103",
    employeeId: "EMP-401",
    dateIncurred: "2024-01-25",
    dateSubmitted: "2024-01-25",
    description: "Conference registration - Tech Summit 2024",
    vendor: "TechConf Inc",
    paymentMethod: "Personal Card",
    currency: "USD",
    amount: 599.00,
    amountUSD: 599.00,
    category: "Training & Education",
    receiptAttached: "Y",
    reimbursementType: "Employee",
    status: "pending",
    policyUsed: "Training Policy",
    logId: "LOG-2024-103",
  },
];

/**
 * Mock flagged expenses for Admin review.
 * These have been flagged by the AI for potential issues.
 * 
 * TODO: Replace with fetchFlaggedExpenses() from n8nClient.ts
 */
export const mockFlaggedExpenses: Expense[] = [
  {
    id: "exp-201",
    transactionId: "T-201",
    employeeId: "EMP-405",
    dateIncurred: "2024-01-20",
    dateSubmitted: "2024-01-21",
    description: "Client dinner - high-end restaurant",
    vendor: "The French Laundry",
    paymentMethod: "Personal Card",
    currency: "USD",
    amount: 1250.00,
    amountUSD: 1250.00,
    category: "Meals & Entertainment",
    receiptAttached: "Y",
    reimbursementType: "Employee",
    status: "flagged",
    policyUsed: "Entertainment Policy",
    logId: "LOG-2024-201",
    riskScore: 85,
    flagReason: "Amount exceeds typical meal expense by 400%",
  },
  {
    id: "exp-202",
    transactionId: "T-202",
    employeeId: "EMP-406",
    dateIncurred: "2024-01-19",
    dateSubmitted: "2024-01-22",
    description: "Equipment purchase - laptop",
    vendor: "Best Buy",
    paymentMethod: "Personal Card",
    currency: "USD",
    amount: 2499.00,
    amountUSD: 2499.00,
    category: "Equipment",
    receiptAttached: "N",
    reimbursementType: "Employee",
    status: "flagged",
    policyUsed: "Equipment Policy",
    logId: "LOG-2024-202",
    riskScore: 92,
    flagReason: "No receipt attached for high-value purchase; requires pre-approval",
  },
  {
    id: "exp-203",
    transactionId: "T-203",
    employeeId: "EMP-407",
    dateIncurred: "2024-01-15",
    dateSubmitted: "2024-01-23",
    description: "Travel expenses - personal trip",
    vendor: "United Airlines",
    paymentMethod: "Corporate Card",
    currency: "USD",
    amount: 890.00,
    amountUSD: 890.00,
    category: "Travel",
    receiptAttached: "Y",
    reimbursementType: "Corporate Card Issuer",
    status: "flagged",
    policyUsed: "Standard Travel Policy",
    logId: "LOG-2024-203",
    riskScore: 78,
    flagReason: "Submitted 8 days after incurred; description mentions 'personal'",
  },
];

/**
 * Mock policies for Admin management.
 * 
 * TODO: Replace with fetchPolicies() from n8nClient.ts
 */
export const mockPolicies: Policy[] = [
  {
    id: "pol-001",
    name: "Standard Travel Policy",
    uploadedBy: "admin@lighthouse.ai",
    dateUploaded: "2024-01-01",
    status: "active",
    limitsSummary: "Max $500/day for hotels, $100/day for meals, economy class flights only",
  },
  {
    id: "pol-002",
    name: "Entertainment Policy",
    uploadedBy: "admin@lighthouse.ai",
    dateUploaded: "2024-01-01",
    status: "active",
    limitsSummary: "Max $75/person for client meals, requires client name in description",
  },
  {
    id: "pol-003",
    name: "Equipment Policy",
    uploadedBy: "admin@lighthouse.ai",
    dateUploaded: "2024-01-05",
    status: "active",
    limitsSummary: "Pre-approval required for items over $500, receipt mandatory",
  },
  {
    id: "pol-004",
    name: "Remote Work Policy",
    uploadedBy: "admin@lighthouse.ai",
    dateUploaded: "2024-01-10",
    status: "active",
    limitsSummary: "Up to $500/year for home office supplies, internet reimbursement up to $50/month",
  },
  {
    id: "pol-005",
    name: "Training Policy",
    uploadedBy: "admin@lighthouse.ai",
    dateUploaded: "2024-01-10",
    status: "active",
    limitsSummary: "Up to $2000/year for conferences and courses, manager approval required",
  },
  {
    id: "pol-006",
    name: "Legacy Travel Policy (2023)",
    uploadedBy: "admin@lighthouse.ai",
    dateUploaded: "2023-01-01",
    status: "inactive",
    limitsSummary: "Superseded by Standard Travel Policy",
  },
];

/**
 * Mock dashboard statistics for Employee.
 * 
 * TODO: Replace with fetchEmployeeDashboard() from n8nClient.ts
 */
export const mockEmployeeDashboardStats = {
  pendingCount: 2,
  approvedCount: 2,
  deniedCount: 1,
  reimbursementTotal: 542.35, // Sum of approved expenses in USD
};

/**
 * Mock dashboard statistics for Admin.
 * 
 * TODO: Replace with fetchAdminDashboard() from n8nClient.ts
 */
export const mockAdminDashboardStats = {
  activePolicies: 5,
  pendingExpenses: 3,
  flaggedSubmissions: 3,
  anomaliesDetected: 3,
};

/**
 * Expense categories for form dropdowns.
 * These should match what the backend/policy expects.
 */
export const expenseCategories = [
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
 * Payment methods for form dropdowns.
 */
export const paymentMethods = [
  "Corporate Card",
  "Personal Card",
  "Cash",
  "Bank Transfer",
  "Other",
];

/**
 * Reimbursement types for form dropdowns.
 */
export const reimbursementTypes = [
  "Employee",
  "Corporate Card Issuer",
  "Vendor Direct",
  "N/A",
];

/**
 * Currency options for form dropdowns.
 */
export const currencies = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "JPY",
  "CHF",
  "INR",
];
