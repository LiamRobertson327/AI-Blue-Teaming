# Lighthouse AI Frontend

A React + TypeScript frontend for the Lighthouse AI expense management system. This application provides separate interfaces for employees and administrators to manage expense submissions, approvals, and policy management.

## 🚀 Quick Start

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Firebase credentials

# 4. Start the development server
npm start

# App runs at http://localhost:3001
```

> **Note:** Make sure n8n is running at `http://localhost:5678` for backend integration.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Features](#features)
- [Integration with n8n Backend](#integration-with-n8n-backend)
- [Smoke Test Checklist](#smoke-test-checklist)
- [Development Notes](#development-notes)

## Overview

Lighthouse AI is an AI-powered expense management system that helps organizations:
- **Employees**: Submit expenses (manual or CSV upload), track approval status
- **Admins**: Review pending/flagged expenses, manage policies, monitor system health

This frontend is designed to work with an n8n backend that handles expense processing, policy validation, and AI-powered anomaly detection.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router v6** - Client-side routing
- **Firebase** - Authentication and user role storage
- **Axios** - HTTP client for API calls
- **Plain CSS** - Styling (no Tailwind, CSS Modules optional)

## Project Structure

```
frontend/
├── public/
│   ├── index.html          # HTML template
│   └── manifest.json       # PWA manifest
├── src/
│   ├── config/
│   │   └── firebase.ts     # Firebase initialization
│   ├── context/
│   │   └── AuthContext.tsx # Authentication state management
│   ├── layouts/
│   │   ├── MainLayout.tsx  # Header, nav, and content wrapper
│   │   └── ProtectedRoute.tsx # Auth and role-based route guard
│   ├── pages/
│   │   ├── LandingPage.tsx # Public landing page
│   │   ├── Auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── SignUpPage.tsx
│   │   ├── Employee/
│   │   │   ├── EmployeeDashboardPage.tsx
│   │   │   └── NewExpensePage.tsx
│   │   └── Admin/
│   │       ├── AdminDashboardPage.tsx
│   │       ├── PoliciesPage.tsx
│   │       ├── PendingExpensesPage.tsx
│   │       └── FlaggedExpensesPage.tsx
│   ├── services/
│   │   ├── authService.ts  # Firebase auth functions
│   │   ├── n8nClient.ts    # n8n API client (stubs)
│   │   └── mockData.ts     # Mock data for development
│   ├── styles/
│   │   ├── global.css      # CSS variables and reset
│   │   ├── Layout.css      # Header and navigation
│   │   ├── Landing.css     # Landing page
│   │   ├── Auth.css        # Login/signup pages
│   │   ├── Dashboard.css   # Dashboard pages
│   │   ├── Forms.css       # Form components
│   │   └── Modal.css       # Modal dialogs
│   ├── types/
│   │   ├── user.ts         # User and role types
│   │   ├── expense.ts      # Expense types
│   │   ├── policy.ts       # Policy types
│   │   └── index.ts        # Re-exports
│   ├── App.tsx             # Main app with routing
│   ├── index.tsx           # Entry point
│   └── react-app-env.d.ts  # CRA type declarations
├── .env.example            # Environment variable template
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- A Firebase project with Authentication and Firestore enabled

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your Firebase configuration values.

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Open the app:**
   Navigate to [http://localhost:3001](http://localhost:3001)

## Environment Variables

Create a `.env` file in the `frontend/` directory with the following variables:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# n8n Backend URL
REACT_APP_N8N_BASE_URL=http://localhost:5678
```

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable **Authentication** with Email/Password provider
4. Enable **Firestore Database**
5. Copy your web app configuration to `.env`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server on port 1 |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm run eject` | Eject from Create React App (irreversible) |

## Features

### Employee Features
- **Dashboard**: View expense history, statistics, and submission status
- **Submit Expense**: Manual form entry or CSV file upload
- **Track Status**: See pending, approved, denied, and flagged expenses

### Admin Features
- **Dashboard**: Overview of system metrics and quick actions
- **Policy Management**: Upload, activate, and deactivate expense policies
- **Pending Review**: Approve or deny pending expense submissions
- **Flagged Review**: Investigate AI-flagged suspicious expenses

### Authentication
- Email/password authentication via Firebase
- Role-based access control (employee/admin)
- Protected routes with automatic redirects
- Persistent sessions

## Integration with n8n Backend

### Current Status: Stub Implementation

The `n8nClient.ts` service contains stub functions that:
- Log the payload that would be sent to the backend
- Return mock data for development
- Include detailed TODO comments for integration

### Expected Webhook Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/webhook/submit-expense` | POST | Submit a single expense |
| `/webhook/expenseUpload` | POST | Upload CSV/XLS expense file |
| `/webhook/admin/decision` | POST | Admin approve/deny decision |
| `/webhook/admin/policy-upload` | POST | Upload new policy |
| `/webhook/admin/policies` | GET | Fetch all policies |
| `/webhook/admin/pending-expenses` | GET | Fetch pending expenses |
| `/webhook/admin/flagged-expenses` | GET | Fetch flagged expenses |

### Payload Structure

All authenticated requests should include:
```json
{
  "idToken": "firebase-id-token",
  "role": "employee|admin",
  "data": { ... }
}
```

## Smoke Test Checklist

After setup, verify the following:

### Public Pages
- [ ] Landing page loads at `/`
- [ ] Login page loads at `/login`
- [ ] Signup page loads at `/signup`

### Authentication
- [ ] Can create a new account
- [ ] Can log in with existing account
- [ ] Logout works correctly
- [ ] Protected routes redirect to login

### Employee Flow
- [ ] Employee dashboard shows mock data
- [ ] Can navigate to new expense form
- [ ] Manual expense form validates inputs
- [ ] CSV upload accepts files

### Admin Flow
- [ ] Admin dashboard shows mock data
- [ ] Can navigate to policies page
- [ ] Can navigate to pending expenses
- [ ] Can navigate to flagged expenses
- [ ] Modal opens when clicking expense row

### Responsive Design
- [ ] Mobile menu works on small screens
- [ ] Forms are usable on mobile
- [ ] Tables scroll horizontally on mobile

## Development Notes

### Styling Conventions
- Use CSS custom properties from `global.css`
- Follow BEM-like naming: `.component`, `.component__element`, `.component--modifier`
- Keep styles in dedicated CSS files per feature

### TypeScript
- Strict mode enabled
- All components have explicit return types
- Props interfaces defined for all components

### Code Comments
- All files have header comments explaining purpose
- Complex logic includes inline comments
- TODO comments mark integration points

### Mock Data
- Located in `src/services/mockData.ts`
- Matches expected n8n backend response structure
- Remove or replace when connecting to real backend

## Troubleshooting

### Common Issues

**Firebase errors on startup:**
- Ensure all `REACT_APP_FIREBASE_*` variables are set in `.env`
- Check that Firebase project has Auth and Firestore enabled

**Type errors:**
- Run `npm install` to ensure all dependencies are installed
- Check that `@types/react` and `@types/react-dom` are installed

**Blank page:**
- Check browser console for errors
- Ensure `public/index.html` has `<div id="root"></div>`

## License

This project is part of the Lighthouse AI system. All rights reserved.
