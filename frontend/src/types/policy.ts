/**
 * =============================================================================
 * POLICY TYPES
 * =============================================================================
 * Type definitions for expense policy management.
 * Policies define the rules for expense approval, limits, and categories.
 * Admins can upload, activate, and deactivate policies.
 * =============================================================================
 */

/**
 * PolicyStatus - Whether a policy is currently active.
 * - "active": Policy is being used for expense validation
 * - "inactive": Policy is stored but not applied
 */
export type PolicyStatus = "active" | "inactive";

/**
 * Policy - Represents an expense policy document.
 * 
 * @property id - Unique identifier for the policy
 * @property name - Human-readable policy name
 * @property uploadedBy - Admin who uploaded this policy
 * @property dateUploaded - When the policy was uploaded (ISO string)
 * @property status - Whether the policy is active or inactive
 * @property limitsSummary - Brief description of limits/rules
 */
export interface Policy {
  id: string;
  name: string;
  category?: string;
  uploadedBy: string;
  dateUploaded: string;
  status: PolicyStatus;
  limitsSummary: string;
  maxAmount?: number;
  currency?: string;
  requiresReceipt?: boolean;
  requiresApproval?: boolean;
  approvalThreshold?: number;
  description?: string;
}

/**
 * PolicyRule - Individual rule within a policy.
 * Used for detailed policy configuration.
 */
export interface PolicyRule {
  id: string;
  category: string;
  maxAmount: number;
  currency: string;
  requiresReceipt: boolean;
  requiresApproval: boolean;
  description?: string;
}

/**
 * PolicyUploadPayload - Data sent when uploading a new policy.
 */
export interface PolicyUploadPayload {
  idToken: string | null;
  role: "admin";
  policyFile: {
    fileName: string;
    fileType: "json" | "pdf";
    fileSize: number;
  };
  policyName: string;
}
