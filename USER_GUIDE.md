# User Guide

## **System Overview**
Lighthouse.ai is an enterprise AI Copilot that automates:
* Expense submission and validation
* Reimbursement approvals
* Policy storage and retrieval
* Email notifications
* Anomaly detection and flagging
* Human-in-the-loop governance
* Real-time system monitoring and logging
* Prompt injection detection and security filtering

---

## **Internal AI Agents:**

### **Expense (Sheets) Agent**
Validates expenses, parses CSVs, checks policies, flags anomalies, updates Google Sheets.

### **Document (Drive) Agent**
Stores receipts, files, and policies in Google Drive.

### **Email Agent**
Sends decision notifications (approved/denied), and alerts admins of flagged cases.

### **Security Filter Agent**
Scans all user inputs for prompt injection attempts, malicious payloads, and security threats before processing.

All interactions begin with a user submitting an expense or uploading a policy.

---

## **User Roles**

### **Employee**
* Submit expenses (manual form or CSV)
* Upload receipt files
* View pending/approved/denied requests
* Receive approval/denial emails
* Chat with AI assistant for expense queries
* View expense history and statistics on dashboard

### **Admin**
* Upload reimbursement policies
* Review flagged expenses
* Approve/deny expenses (HITL)
* Toggle active/inactive policies
* Monitor anomalies/logs
* View real-time system logs from Grafana Loki
* Monitor security threats and prompt injection attempts
* Access system health dashboard

---

## **System Architecture**

### **Frontend (React + TypeScript)**
* Employee Dashboard – expense history, stats, submission status
* Admin Dashboard – system overview, quick actions, real-time stats
* Logs Page – Loki integration, security threat highlighting, filtering
* HITL Page – pending expense review, approve/deny actions
* Flagged Expenses Page – denied/flagged expenses display
* Policies Page – policy management, upload, activate/deactivate
* Chat Widget – AI-powered assistant for both roles

### **Backend Services (Docker)**
| Service | Port | Description |
|---------|------|-------------|
| n8n | 5678 | Workflow orchestration engine |
| Loki | 3100 | Log aggregation |
| Grafana | 3000 | Monitoring dashboards |
| Qdrant | 6333 | Vector database for RAG |
| Filter Service | 5001 | Prompt injection detection |
| Loki Proxy | 3101 | CORS-enabled Loki access |

### **External Integrations**
* **Firebase** – Authentication & user management
* **Google Sheets** – Expense data storage
* **Google Drive** – Receipt & policy file storage
* **Gmail** – Email notifications

---

## **Employee Expense Submission Methods**

Employees can submit expenses in two ways:

### **A. Manual Expense Form Submission**
The employee fills the following required fields:

| Field | Required? | Description |
|-------|-----------|-------------|
| EmployeeID | Yes (Auto-filled) | Unique employee identifier |
| Category | Yes | Must match active policy categories |
| Amount | Yes | Numeric, original currency |
| Currency | Yes | ISO currency code (USD, EUR, INR, etc.) |
| Description | Yes | Reason for the expense |
| Vendor | Optional | Merchant/vendor name |
| PaymentMethod | Yes | "Corporate Card" or "Personal Card" |
| Receipt Upload | Required if policy demands | Upload PDF/JPG/PNG |

#### **System Behavior:**
1. Receipt stored via **Drive Agent**
2. Expense row created by **Sheets Agent**
3. Policy applied automatically
4. Status initially **Pending**
5. If suspicious → **Flagged for admin review**
6. Email sent to employee via **Email Agent**
7. All actions logged to Loki for monitoring

### **B. CSV Upload (Multiple Expenses at Once)**
Employees may upload a CSV file following this exact header:

```
TransactionID,EmployeeID,DateIncurred,DateSubmitted,Description,Vendor,PaymentMethod,Currency,Amount,AmountUSD,Category,ReceiptAttached,ReimbursementType
```

| Column | Description | Rules |
|--------|-------------|-------|
| TransactionID | Unique ID for each row | Must be unique |
| EmployeeID | Employee identifier | Must match HR database |
| DateIncurred | When expense happened | ISO (2024-10-22) or Excel serial |
| DateSubmitted | Submission date | Same formats accepted |
| Description | Expense details | Free text |
| Vendor | Merchant | Optional |
| PaymentMethod | Payment type | Corporate Card / Personal Card |
| Currency | ISO code | USD/EUR/INR/etc |
| Amount | Original currency amount | Numeric only |
| AmountUSD | Converted amount | Optional |
| Category | Expense category | Must match active policies |
| ReceiptAttached | Receipt present? | Y/N |
| ReimbursementType | Who gets reimbursed | Employee / Corporate Card Issuer |

---

## **What Happens After Expense Submission**

Once an employee submits via form or CSV, the system triggers:

### **Phase 1 — Security Filtering**
* **Prompt injection detection** – Scans all text fields for malicious instructions
* **Input sanitization** – Removes hidden commands and suspicious patterns
* **Threat logging** – All security events logged to Loki with severity levels

### **Phase 2 — Document Handling (Drive Agent)**
* Receipts uploaded to Google Drive
* CSV stored with metadata
* File references recorded

### **Phase 3 — Validation (Sheets Agent)**

#### **Policy Validation**
* Category check against active policies
* Receipt verification (if required)
* Spending limits enforcement
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

**If safe → Auto-approve**  
**If unclear → Flag for human admin review (HITL)**

### **Phase 4 — Sheet Update**
Valid expenses appended to Google Sheet with:
* Status ("Pending", "Approved", "Denied", "Flagged")
* Decision reason
* Policy applied
* Log ID
* Timestamp and execution ID

### **Phase 5 — Notification (Email Agent)**

#### **Employee receives:**
* **Pending** (immediate confirmation)
* **Approved** (auto or admin decision)
* **Denied** (auto or admin decision with reason)
* **Flagged → Requires Admin Review**

#### **Admins receive email alerts for:**
* Flagged expenses requiring review
* Anomalies detected
* Security threats detected

---

## **Admin Dashboard Features**

### **Quick Stats**
* Active Policies count
* Pending Expenses (HITL queue)
* Flagged Submissions
* Anomalies Detected

### **System Status**
* n8n Backend connection status
* Firebase Auth status
* Policy Engine status (policies loaded)

### **Quick Actions**
* Manage Policies → Upload, activate/deactivate policies
* Review Pending Expenses → Approve/deny HITL queue
* Review Flagged Submissions → Investigate denied expenses
* View System Logs → Real-time Loki log viewer

---

## **Logs & Monitoring**

### **Real-Time Log Viewer**
Admins can view all system logs with:
* **Time range filtering** – 15 min, 1 hour, 6 hours, 24 hours, 7 days
* **Workflow filtering** – Filter by specific n8n workflow
* **Event type filtering** – Filter by log level/event type
* **Search** – Full-text search across all logs
* **Auto-refresh** – Optional live updates

### **Security Threat Highlighting**
Logs automatically highlight:
* 🚨 **PROMPT INJECTION DETECTED** – Malicious input attempts
* ⚠️ **VULNERABILITY DETECTED** – Security vulnerabilities
* ⚠️ **EXPLOIT ATTEMPT** – Attempted system exploits
* ⚠️ **SECURITY THREAT** – General security alerts

### **Log Entry Details**
Each log shows:
* Timestamp
* Workflow name
* Node name
* Event type badge
* Message content
* User ID (Employee ID or shortened UID)

---

## **AI Governance & Safety Guardrails**

### **Guardrails on Employee Inputs**
* Sanitization of text fields
* Prevention of embedded instructions
* File scanning to avoid malicious JSON/PDF payloads
* Enforced required fields
* Real-time prompt injection detection via Filter Service

### **AI Safety Controls**
* Detects hallucination cascades
* Blocks unsupported tool actions
* Prevents unauthorized access (RBAC)
* Rate limits heavy requests
* Logs all AI model interactions

### **Human-in-the-Loop (HITL)**
Admin MUST approve:
* Flagged expenses
* High-value transactions
* Policy mismatches
* Unusual vendor patterns
* Security-flagged submissions

### **Observability**
The system logs to Grafana Loki:
* All expense submissions
* All approvals/denials
* All anomalies detected
* All agent calls
* All admin actions
* All security events
* All prompt injection attempts

---

## **Deployment Architecture**

### **Production Environment**
* **Server**: Ubuntu 22.04 LTS (KVM VPS)
* **Containerization**: Docker & Docker Compose
* **Reverse Proxy**: Nginx
* **Frontend**: React production build served via Nginx
* **Backend**: n8n workflows with webhook endpoints

### **Security**
* Firebase Authentication with role-based access
* Environment variables for sensitive credentials
* CORS configuration for API access
* Nginx reverse proxy for secure routing

---

## **Userflow Guide**
![logo](/images/userflow.jpg)

---

## **Access URLs**

| Service | URL |
|---------|-----|
| Frontend App | http://YOUR_SERVER_IP |
| n8n Workflows | http://YOUR_SERVER_IP:5678 |
| Grafana Dashboards | http://YOUR_SERVER_IP:3000 |
| Loki Logs API | http://YOUR_SERVER_IP:3100 |

---

## **Quick Start**

### **For Employees:**
1. Login with your employee credentials
2. Navigate to "Submit Expense" 
3. Fill the form or upload CSV
4. Attach receipts if required
5. Submit and track status on Dashboard

### **For Admins:**
1. Login with admin credentials
2. Review pending expenses in HITL queue
3. Approve or deny with reason
4. Monitor system logs for anomalies
5. Manage policies as needed
