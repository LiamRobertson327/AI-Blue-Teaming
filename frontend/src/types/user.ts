/**
 * =============================================================================
 * USER TYPES
 * =============================================================================
 * Type definitions for user-related data structures.
 * These types are used throughout the application for authentication,
 * authorization, and user profile management.
 * =============================================================================
 */

/**
 * UserRole - The two possible roles in the system.
 * - "employee": Regular users who submit expenses
 * - "admin": Users who review, approve, or deny expenses and manage policies
 */
export type UserRole = "employee" | "admin";

/**
 * AppUser - Represents a user in the Lighthouse AI system.
 * This is stored in Firestore under the "users" collection.
 * 
 * @property uid - Firebase Auth UID (unique identifier)
 * @property fullName - User's display name
 * @property email - User's email address (used for login)
 * @property role - User's role determining their access level
 * @property employeeId - Unique employee ID in format EMP-XXX (for employees only)
 * @property bankAccountNumber - Unique bank account number for reimbursements
 */
export interface AppUser {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  employeeId?: string;  // Format: EMP-XXX (only for employees)
  bankAccountNumber?: string;  // Unique bank account for reimbursements
}

/**
 * UserProfile - Extended user information stored in Firestore.
 * Includes metadata like creation timestamp.
 */
export interface UserProfile extends AppUser {
  createdAt: Date | string;
  lastLoginAt?: Date | string;
}
