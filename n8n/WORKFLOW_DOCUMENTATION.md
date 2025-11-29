# n8n Workflow Documentation - CSEN 296B Blue Team Model

This document explains the n8n workflow architecture, components, and recent changes made for the Lighthouse AI expense management system.

## Table of Contents
- [Workflow Overview](#workflow-overview)
- [Architecture Diagram](#architecture-diagram)
- [Main Components](#main-components)
- [Webhook Endpoints](#webhook-endpoints)
- [Recent Changes](#recent-changes)
- [Data Flow](#data-flow)

---

## Workflow Overview

The **CSEN 296B Blue Team Model** is an AI-powered enterprise automation workflow that handles:
1. **Expense Management** - Processing and validating expense reports
2. **Document Management** - Google Drive file operations
3. **Email Automation** - Sending notifications via Gmail
4. **RAG-based Q&A** - Answering questions using vector database knowledge
5. **Security** - Prompt injection detection and filtering

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INPUT LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Data Input   │  │ Fetch        │  │ Submit       │  │ Terminal     │     │
│  │ Webhook      │  │ Expenses     │  │ Expense      │  │ Chat Input   │     │
│  │ /Lighthouse  │  │ Webhook      │  │ Webhook      │  │              │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼──────────────────┼──────────┘
          │                  │                  │                  │
          ▼                  ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SECURITY & VALIDATION LAYER                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐       │
│  │ File/Text        │    │ Prompt Filtering │    │ Document         │       │
│  │ Detection (If4)  │    │ Check            │    │ Verification     │       │
│  └────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘       │
│           │                       │                       │                  │
│           ▼                       ▼                       ▼                  │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐       │
│  │ XLS to JSON      │    │ Prompt Injection │    │ Filter Service   │       │
│  │ Conversion       │    │ Detection        │    │ (Python API)     │       │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TASK DECOMPOSITION LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │                    Task Decomposition Agent                       │       │
│  │  (GPT-4.1-mini) - Identifies required tasks: sheet/drive/email   │       │
│  └────────────────────────────────┬─────────────────────────────────┘       │
│                                   │                                          │
│                                   ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │                       Agent Router (Switch)                       │       │
│  │         Routes to: Sheet | Drive | Email | Question              │       │
│  └──────────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AGENT LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Expense Mgmt    │  │ Google Drive    │  │ Email Mgmt      │              │
│  │ Agent           │  │ Agent           │  │ Agent           │              │
│  │ (Sheets)        │  │ (Files/Folders) │  │ (Gmail)         │              │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘              │
│           │                    │                    │                        │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │                     RAG Agent (Q&A)                              │        │
│  │              Uses Qdrant Vector Store for knowledge              │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Google       │  │ Google       │  │ Gmail        │  │ Qdrant       │     │
│  │ Sheets       │  │ Drive        │  │              │  │ Vector DB    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐                                         │
│  │ Loki         │  │ OpenAI       │                                         │
│  │ (Logging)    │  │ API          │                                         │
│  └──────────────┘  └──────────────┘                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Main Components

### 1. Vector Database Manager (Red Section)
Manages the Qdrant vector database for RAG functionality.

| Node | Purpose |
|------|---------|
| `Schedule Trigger` | Runs every 2 minutes to check for new files |
| `Search files and folders` | Scans Google Drive "Input Files" folder |
| `Loop Over Items` | Processes files one by one |
| `Download file1` | Downloads file from Google Drive |
| `Qdrant Vector Store` | Inserts document embeddings into vector DB |
| `Move file` | Moves processed files to "Vector DB" folder |
| `Embeddings OpenAI2` | Generates embeddings using OpenAI |
| `Recursive Character Text Splitter` | Chunks documents (400 chars, 100 overlap) |

### 2. Input Data Handler (Brown Section)
Handles incoming data from webhooks - both files and text.

| Node | Purpose |
|------|---------|
| `Data Input` | Main webhook at `/webhook/Lighthouse-input` |
| `If4` | Detects if input contains binary file data |
| `xls to json` | Converts Excel files to JSON |
| `Format json into json string` | Prepares data for validation |
| `Verify Document` | Calls Python filter service at `http://filter-service:5001/verifyfile` |
| `Prompt Filtering Check` | Checks for prompt injection attacks |

### 3. Task Decomposition (Purple Section)
AI-powered task routing system.

| Node | Purpose |
|------|---------|
| `Task Decomposition` | GPT-4.1-mini agent that identifies required tasks |
| `SubTasks Split Function` | Splits multi-task responses into individual items |
| `Agent Router` | Switch node routing to: sheet, drive, email, or question |

**Task Types:**
- `sheet` - Expense reports, HR/finance data
- `drive` - Document upload/retrieval from Google Drive
- `email` - Compose and send emails via Gmail
- `question` - RAG-based Q&A (no external tools)

### 4. Expense Management Agent (Green Section - Top)
Handles expense-related operations.

| Node | Purpose |
|------|---------|
| `Expense Management Agent` | AI agent for expense processing |
| `Sheet Router` | Routes to: append, update, create, or retrieve |
| `Append row in sheet` | Adds new expense to Master Expense sheet |
| `Update row in sheet` | Updates existing expense records |
| `Get row(s) in sheet` | Retrieves expense data |

**Master Expense Sheet Columns:**
- TransactionID, EmployeeID, DateIncurred, DateSubmitted
- Description, Vendor, PaymentMethod, Currency
- Amount, AmountUSD, Category, ReceiptAttached, ReimbursementType

### 5. Google Drive Management Agent (Green Section - Middle)
Handles file and folder operations.

| Node | Purpose |
|------|---------|
| `Google Drive Agent` | AI agent for Drive operations |
| `Switch` | Routes to: createf (folder), create (file), openf, open |
| `Create folder` | Creates new folders in Drive |
| `Create file from text` | Creates files with content |
| `Search files and folders1` | Searches for files by name |

### 6. Email Management Agent (Green Section - Lower)
Handles email composition and sending.

| Node | Purpose |
|------|---------|
| `Gmail Agent` | AI agent that parses email requests |
| `If3` | Checks if attachment is needed |
| `Search files and folders2` | Finds attachment file in Drive |
| `Download file` | Downloads attachment |
| `Send a message` / `Send a message3` | Sends email via Gmail |

### 7. RAG Agent (Green Section - Bottom)
Answers questions using vector database knowledge.

| Node | Purpose |
|------|---------|
| `Edit Fields` | Prepares chat input |
| `RAG Agent` | AI agent with Qdrant tool access |
| `Qdrant Vector Store2` | Retrieves relevant documents |
| `Embeddings OpenAI` | Generates query embeddings |

---

## Webhook Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/webhook/Lighthouse-input` | POST | Main input - handles both files and text |
| `/webhook/fetch-expenses` | POST | Fetch expenses by employeeId |
| `/webhook/submit-expense` | POST | Submit a single expense |
| `/webhook/expenseUpload` | POST | Upload expense file (disabled) |

### Fetch Expenses Request
```json
{
  "employeeId": "EMP-401"
}
```

### Submit Expense Request
```json
{
  "expense": {
    "transactionId": "T-001",
    "employeeId": "EMP-401",
    "dateIncurred": "2025-09-10",
    "dateSubmitted": "2025-09-11",
    "description": "Flight to NYC",
    "vendor": "Delta Airlines",
    "paymentMethod": "Corporate Card",
    "currency": "USD",
    "amount": 450.75,
    "category": "Travel",
    "receiptAttached": "Y",
    "reimbursementType": "Corporate Card Issuer"
  }
}
```

---

## Recent Changes

### 1. New Webhook Endpoints Added
**Added two new dedicated webhooks for frontend integration:**

```javascript
// Fetch WebHook - /webhook/fetch-expenses
// Retrieves expenses filtered by employeeId from Google Sheets

// Submit Expense - /webhook/submit-expense  
// Appends a single expense to the Master Expense sheet
```

### 2. Direct Expense Submission Flow
**New simplified flow for single expense submission:**

```
Submit Expense Webhook → Append row in sheet1 → Edit Fields1 (success response)
```

This bypasses the AI task decomposition for simple CRUD operations.

### 3. Expense Fetch by Employee
**New flow to retrieve employee-specific expenses:**

```
Fetch WebHook → Get row(s) in sheet1 (filtered by EmployeeID)
```

### 4. Response Formatting
**Added success response node:**

```javascript
// Edit Fields1 node returns:
{
  "success": "true",
  "message": "Expense submitted successfully"
}
```

### 5. File Validation Integration
**Enhanced file upload validation:**

- XLS files are converted to JSON
- Sent to Python filter service for validation
- `Code in JavaScript4` parses validation response (handles NaN values)
- `If1` routes based on `allowed` boolean

### 6. Validated Data Processing
**New code node for processing validated expenses:**

```javascript
// Code in JavaScript3
// Extracts validated_data array and maps to individual expense items
// Each item is then appended to the Master Expense sheet
```

### 7. Logging Integration
All major operations log to Loki for monitoring:
- File input events
- Prompt injection detection
- Document validation results
- Task decomposition outputs

---

## Data Flow

### Flow 1: File Upload (Expense Report)
```
1. Data Input webhook receives file
2. If4 detects binary data → File handling branch
3. xls to json converts Excel to JSON
4. Format json prepares data array
5. Verify Document calls filter-service API
6. Code in JavaScript4 parses response
7. If1 checks if allowed=true
8. Code in JavaScript3 extracts validated rows
9. Append row in sheet adds to Master Expense
10. Respond to Webhook2 returns result
```

### Flow 2: Text Input (Chat/Command)
```
1. Data Input webhook receives text
2. If4 detects no binary → Text handling branch
3. Chat Webhook Input Log records input
4. Normalize Webhook Input formats data
5. Prompt Filtering Check validates input
6. If No prompt Injection routes:
   - Safe → Task Decomposition
   - Unsafe → LLM To answer malicious questions
7. Task Decomposition identifies agents needed
8. Agent Router sends to appropriate agent
9. Agent processes and returns result
```

### Flow 3: Direct Expense Submit
```
1. Submit Expense webhook receives expense JSON
2. Append row in sheet1 adds to Master Expense
3. Edit Fields1 creates success response
4. Response returned to frontend
```

### Flow 4: Fetch Expenses
```
1. Fetch WebHook receives employeeId
2. Get row(s) in sheet1 filters by EmployeeID
3. Matching rows returned as JSON array
```

---

## Environment Requirements

- **n8n**: Running on port 5678
- **Filter Service**: Python API on port 5001
- **Qdrant**: Vector database on port 6333
- **Loki**: Log aggregation on port 3100
- **Grafana**: Monitoring on port 3000

## Credentials Required

| Service | Credential Name |
|---------|-----------------|
| OpenAI | `OpenAi account` |
| Google Drive | `Google Drive account` |
| Google Sheets | `Google Sheets account` |
| Gmail | `Gmail account` |
| Qdrant | `QdrantApi account` |

---

## Troubleshooting

### Common Issues

1. **File upload fails**: Check filter-service is running at `http://filter-service:5001`
2. **Expenses not saving**: Verify Google Sheets OAuth credentials
3. **RAG not working**: Ensure Qdrant has documents indexed
4. **Emails not sending**: Check Gmail OAuth token hasn't expired

### Logs Location
- n8n execution logs: Grafana → Loki datasource
- Filter by `workflow`, `node`, `execution_id` labels
