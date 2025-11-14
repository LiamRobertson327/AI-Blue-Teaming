# User Guide

## **System Overview**
Lighthouse.ai is an enterprise AI Copilot that automates:
* Expense submission and validation
* Reimbursement approvals
* Policy storage and retrieval
* Email notifications
* Anomaly detection and flagging
* Human-in-the-loop governance

## **Internal AI Agents:**

### **Expense (Sheets) Agent**
Validates expenses, parses CSVs, checks policies, flags anomalies, updates Google Sheets.

### **Document (Drive) Agent**
Stores receipts, files, and policies in Google Drive.

### **Email Agent**
Sends decision notifications (approved/denied), and alerts admins of flagged cases.  
All interactions begin with a user submitting an expense or uploading a policy.

## **User Roles**
### **Employee**
* Submit expenses (manual form or CSV)
* Upload receipt files
* View pending/approved/denied requests
* Receive approval/denial emails

### **Admin**
* Upload reimbursement policies
* Review flagged expenses
* Approve/deny expenses
* Toggle active/inactive policies
* Monitor anomalies/logs

## **Employee Expense Submission Methods**
Employees can submit expenses in two ways:
### **A. Manual Expense Form Submission**
The employee fills the following required fields:
```
Field               Required?                       Description
──────────────────────────────────────────────────────────────────────────────
EmployeeID          Yes                             Unique employee identifier
Category            Yes                             Must match active policy categories
Amount              Yes                             Numeric, original currency
Currency            Yes                             ISO currency code
Description         Yes                             Reason for the expense
Vendor              Optional                        Merchant/vendor name
PaymentMethod       Yes                             "Corporate Card" or "Personal Card"
Receipt Upload      Required if policy demands      Upload PDF/JPG/PNG

```

#### **System Behavior:**
* Receipt stored via **Drive Agent**
* Expense row created by **Sheets Agent**
* Policy applied
* Status initially **Pending**
* If suspicious → **Flagged for admin review**
* Email sent to employee via **Email Agent**

### **B. CSV Upload (Multiple Expenses at Once)**
Employees may upload a CSV file following this exact header:  
TransactionID, EmployeeID, DateIncurred, DateSubmitted, Description, Vendor, PaymentMethod,Currency ,Amount, AmountUSD, Category, ReceiptAttached, ReimbursementType

```
Column                      Description                             Rules
──────────────────────────────────────────────────────────────────────────────────────────────────────
TransactionID               Unique ID for each row                  Must be unique
EmployeeID                  Employee identifier                     Must match HR database
DateIncurred                When expense happened                   ISO (2024-10-22) or Excel serial
DateSubmitted               Submission date                         Same formats accepted
Description                 Expense details                         Free text
Vendor                      Merchant                                Optional
PaymentMethod               Payment type                            Corporate Card / Personal Card
Currency                    ISO code                                USD/EUR/INR/etc
Amount                      Original currency amount                Numeric only
AmountUSD                   Converted amount                        Optional
Category                    Expense category                        Must match active policies
ReceiptAttached             Receipt present?                        Y/N
ReimbursementType           Who gets reimbursed                     Employee / Corporate Card Issuer
```

## **What Happens After Expense Submission**
Once an employee submits via form or CSV, the system triggers:
### **Phase 1 — Document Handling (Drive Agent)**
* Receipts uploaded
* CSV stored
* Metadata recorded

### **Phase 2 — Validation (Sheets Agent)**
The Expense Agent automatically:
#### **Policy Validation**
* Category check
* Receipt verification
* Spending limits
* Date validation
* Daily/Monthly caps

#### **Data Sanitation**
* Removes hidden instructions
* Prevents prompt injection attempts
* Ensures numeric and structured fields

#### **Anomaly Detection**
Flags expenses if:
* Extremely high amounts
* Impossible or future dates
* Duplicate TransactionIDs
* Wrong category
* Currency mismatch
* Suspicious descriptions (e.g., embedded instructions)

If safe → **auto-approve**  
If unclear → **flag for human admin review**

### **Phase 3 — Sheet Update**
#### **Valid expenses appended to Google Sheet with:**
* Status ("Pending", "Approved", "Denied", "Flagged")
* Decision reason
* Policy applied
* Log ID

### **Phase 4 — Notification (Email Agent)**
#### **Employee receives:**
* **Pending** (immediate)
* **Approved** (auto or admin)
* **Denied** (auto or admin)
* **Flagged → Requires Admin Review**

#### **Admins receive email alerts for:**
* Flagged expenses
* Anomalies detected

## **AI Governance & Safety Guardrails (Built Into System)**

### **Guardrails on Employee Inputs**
* Sanitization of text fields
* Prevention of embedded instructions
* File scanning to avoid malicious JSON/PDF payloads
* Enforced required fields

### **AI Safety Controls**
* Detects hallucination cascades
* Blocks unsupported tool actions
* Prevents unauthorized access (RBAC)
* Rate limits heavy requests

### **Human-in-the-loop - Admin MUST approve:**
* Flagged expenses
* High-value transactions
* Policy mismatches
* Unusual vendor patterns

### **Observability - The system logs:**
* All submissions
* All approvals/denials
* All anomalies
* All agent calls
* All admin actions


## Userflow Guide:
![logo](/images/userflow.jpg)