# RentEase Developer Notes & Reference Guide

This file contains all color schemes, status codes, and development instructions for the RentEase project.

---

## 📋 Table of Contents
1. [Property Listing Status Color Scheme](#property-listing-status-color-scheme)
2. [Lease Status Color Scheme](#lease-status-color-scheme)
3. [Maintenance Status Color Scheme](#maintenance-status-color-scheme)
4. [Screening Status Color Scheme](#screening-status-color-scheme)
5. [HTTP Status Codes Reference](#http-status-codes-reference)
6. [Prisma Database Commands](#prisma-database-commands)
7. [Shadcn UI Commands](#shadcn-ui-commands)

---

## 🏠 Property Listing Status Color Scheme

### WAITING_REVIEW
- **Badge**: `bg-purple-50 border border-purple-200 text-purple-700`
- **Pill**: `bg-purple-100 text-purple-800`
- **Gradient**: `from-purple-600 to-indigo-600`
- **Gradient Light**: `from-purple-200/70 via-purple-100/50 to-purple-200/70`
- **Gradient Button**: `from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700`
- **Background**: `bg-purple-50 border-purple-300`
- **Background Card**: `bg-gradient-to-br from-purple-50 to-indigo-50`
- **Icon Background**: `bg-purple-500`
- **Text Colors**: `text-purple-700`, `text-purple-900`, `text-purple-600`
- **Blur Effects**: `bg-purple-200/40`, `bg-purple-300/40`
- **Borders**: `border-purple-200`, `border-purple-300`, `border-2 border-purple-300`
- **Description**: Payment complete, waiting admin review

### VISIBLE
- **Badge**: `bg-emerald-50 border border-emerald-200 text-emerald-700`
- **Pill**: `bg-emerald-100 text-emerald-800`
- **Gradient**: `from-emerald-400 to-emerald-500`
- **Gradient Light**: `from-emerald-200/70 via-emerald-100/50 to-emerald-200/70`
- **Gradient Button**: `from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800`
- **Background**: `bg-emerald-50 border-emerald-300`
- **Background Card**: `bg-gradient-to-br from-emerald-50 to-emerald-50`
- **Icon Background**: `bg-emerald-500`
- **Text Colors**: `text-emerald-700`, `text-emerald-900`, `text-emerald-600`
- **Blur Effects**: `bg-emerald-200/40`, `bg-emerald-300/40`
- **Borders**: `border-emerald-200`, `border-emerald-300`, `border-2 border-emerald-300`
- **Description**: Active and visible to tenants

### HIDDEN
- **Badge**: `bg-teal-50 border border-teal-200 text-teal-700`
- **Pill**: `bg-teal-100 text-teal-800`
- **Gradient**: `from-teal-400 to-teal-500`
- **Gradient Light**: `from-teal-200/70 via-teal-100/50 to-teal-200/70`
- **Gradient Button**: `from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800`
- **Background**: `bg-teal-50 border-teal-300`
- **Background Card**: `bg-gradient-to-br from-teal-50 to-teal-50`
- **Icon Background**: `bg-teal-500`
- **Text Colors**: `text-teal-700`, `text-teal-900`, `text-teal-600`
- **Blur Effects**: `bg-teal-200/40`, `bg-teal-300/40`
- **Borders**: `border-teal-200`, `border-teal-300`, `border-2 border-teal-300`
- **Description**: Temporarily hidden from search

### EXPIRED
- **Badge**: `bg-gray-50 border border-gray-200 text-gray-700`
- **Pill**: `bg-gray-100 text-gray-800`
- **Gradient**: `from-gray-400 to-gray-500`
- **Gradient Light**: `from-gray-200/70 via-gray-100/50 to-gray-200/70`
- **Gradient Button**: `from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800`
- **Background**: `bg-gray-50 border-gray-300`
- **Background Card**: `bg-gradient-to-br from-gray-50 to-gray-50`
- **Icon Background**: `bg-gray-500`
- **Text Colors**: `text-gray-700`, `text-gray-900`, `text-gray-600`
- **Blur Effects**: `bg-gray-200/40`, `bg-gray-300/40`
- **Borders**: `border-gray-200`, `border-gray-300`, `border-2 border-gray-300`
- **Description**: Listings that have reached expiry date

### FLAGGED
- **Badge**: `bg-amber-50 border border-amber-200 text-amber-700`
- **Pill**: `bg-amber-100 text-amber-800`
- **Gradient**: `from-amber-600 to-orange-600`
- **Gradient Light**: `from-amber-200/70 via-amber-100/50 to-amber-200/70`
- **Gradient Button**: `from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700`
- **Background**: `bg-amber-50 border-amber-300`
- **Background Card**: `bg-gradient-to-br from-amber-50 to-orange-50`
- **Icon Background**: `bg-amber-500`
- **Text Colors**: `text-amber-700`, `text-amber-900`, `text-amber-600`
- **Blur Effects**: `bg-amber-200/40`, `bg-amber-300/40`
- **Borders**: `border-amber-200`, `border-amber-300`, `border-2 border-amber-300`
- **Description**: Flagged for review

### BLOCKED
- **Badge**: `bg-red-50 border border-red-200 text-red-700`
- **Pill**: `bg-red-100 text-red-800`
- **Gradient**: `from-red-600 to-rose-600`
- **Gradient Light**: `from-red-200/70 via-red-100/50 to-red-200/70`
- **Gradient Button**: `from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700`
- **Background**: `bg-red-50 border-red-300`
- **Background Card**: `bg-gradient-to-br from-red-50 to-rose-50`
- **Icon Background**: `bg-red-500`
- **Text Colors**: `text-red-700`, `text-red-900`, `text-red-600`
- **Blur Effects**: `bg-red-200/40`, `bg-red-300/40`
- **Borders**: `border-red-200`, `border-red-300`, `border-2 border-red-300`
- **Description**: Suspended by administration

---

## 📄 Lease Status Color Scheme

### PENDING
- **Badge**: `bg-amber-50 border border-amber-200 text-amber-700`
- **Pill**: `bg-amber-100 text-amber-800`
- **Gradient**: `from-amber-500 to-orange-500`
- **Gradient Light**: `from-amber-200/70 via-amber-100/50 to-amber-200/70`
- **Gradient Button**: `from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700`
- **Background**: `bg-amber-50 border-amber-300`
- **Background Card**: `bg-gradient-to-br from-amber-50 to-orange-50`
- **Icon Background**: `bg-amber-500`
- **Text Colors**: `text-amber-700`, `text-amber-900`, `text-amber-600`
- **Blur Effects**: `bg-amber-200/40`, `bg-amber-300/40`
- **Borders**: `border-amber-200`, `border-amber-300`, `border-2 border-amber-300`
- **Timeline**: `bg-amber-500 ring-4 ring-amber-200` (active), `bg-amber-500` (completed), `bg-amber-300` (line)

### ACTIVE
- **Badge**: `bg-emerald-50 border border-emerald-200 text-emerald-700`
- **Pill**: `bg-emerald-100 text-emerald-800`
- **Gradient**: `from-emerald-500 to-emerald-600`
- **Gradient Light**: `from-emerald-200/70 via-emerald-100/50 to-emerald-200/70`
- **Gradient Button**: `from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800`
- **Background**: `bg-emerald-50 border-emerald-300`
- **Background Card**: `bg-gradient-to-br from-emerald-50 to-emerald-50`
- **Icon Background**: `bg-emerald-500`
- **Text Colors**: `text-emerald-700`, `text-emerald-900`, `text-emerald-600`
- **Blur Effects**: `bg-emerald-200/40`, `bg-emerald-300/40`
- **Borders**: `border-emerald-200`, `border-emerald-300`, `border-2 border-emerald-300`

### COMPLETED
- **Badge**: `bg-gray-50 border border-gray-200 text-gray-700`
- **Pill**: `bg-gray-100 text-gray-800`
- **Gradient**: `from-gray-500 to-gray-600`
- **Gradient Light**: `from-gray-200/70 via-gray-100/50 to-gray-200/70`
- **Gradient Button**: `from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800`
- **Background**: `bg-gray-50 border-gray-300`
- **Background Card**: `bg-gradient-to-br from-gray-50 to-gray-50`
- **Icon Background**: `bg-gray-500`
- **Text Colors**: `text-gray-700`, `text-gray-900`, `text-gray-600`
- **Blur Effects**: `bg-gray-200/40`, `bg-gray-300/40`
- **Borders**: `border-gray-200`, `border-gray-300`, `border-2 border-gray-300`

### TERMINATED
- **Badge**: `bg-red-50 border border-red-200 text-red-700`
- **Pill**: `bg-red-100 text-red-800`
- **Gradient**: `from-red-500 to-red-600`
- **Gradient Light**: `from-red-200/70 via-red-100/50 to-red-200/70`
- **Gradient Button**: `from-red-600 to-red-700 hover:from-red-700 hover:to-red-800`
- **Background**: `bg-red-50 border-red-300`
- **Background Card**: `bg-gradient-to-br from-red-50 to-red-50`
- **Icon Background**: `bg-red-500`
- **Text Colors**: `text-red-700`, `text-red-900`, `text-red-600`
- **Blur Effects**: `bg-red-200/40`, `bg-red-300/40`
- **Borders**: `border-red-200`, `border-red-300`, `border-2 border-red-300`

### CANCELLED
- **Badge**: `bg-slate-50 border border-slate-200 text-slate-700`
- **Pill**: `bg-slate-100 text-slate-800`
- **Gradient**: `from-slate-500 to-slate-600`
- **Gradient Light**: `from-slate-200/70 via-slate-100/50 to-slate-200/70`
- **Gradient Button**: `from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800`
- **Background**: `bg-slate-50 border-slate-300`
- **Background Card**: `bg-gradient-to-br from-slate-50 to-slate-50`
- **Icon Background**: `bg-slate-500`
- **Text Colors**: `text-slate-700`, `text-slate-900`, `text-slate-600`
- **Blur Effects**: `bg-slate-200/40`, `bg-slate-300/40`
- **Borders**: `border-slate-200`, `border-slate-300`, `border-2 border-slate-300`

---

## 🔧 Maintenance Status Color Scheme

### OPEN
- **Badge**: `bg-amber-50 border border-amber-200 text-amber-700`
- **Pill**: `bg-amber-100 text-amber-800`
- **Gradient**: `from-amber-500 to-orange-500`
- **Gradient Light**: `from-amber-200/70 via-amber-100/50 to-amber-200/70`
- **Gradient Button**: `from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700`
- **Background**: `bg-amber-50 border-amber-300`
- **Background Card**: `bg-gradient-to-br from-amber-50 to-orange-50`
- **Icon Background**: `bg-amber-500`
- **Text Colors**: `text-amber-700`, `text-amber-900`, `text-amber-600`
- **Blur Effects**: `bg-amber-200/40`, `bg-amber-300/40`
- **Borders**: `border-amber-200`, `border-amber-300`, `border-2 border-amber-300`

### IN_PROGRESS
- **Badge**: `bg-blue-50 border border-blue-200 text-blue-700`
- **Pill**: `bg-blue-100 text-blue-800`
- **Gradient**: `from-blue-500 to-blue-600`
- **Gradient Light**: `from-blue-200/70 via-blue-100/50 to-blue-200/70`
- **Gradient Button**: `from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800`
- **Background**: `bg-blue-50 border-blue-300`
- **Background Card**: `bg-gradient-to-br from-blue-50 to-blue-50`
- **Icon Background**: `bg-blue-500`
- **Text Colors**: `text-blue-700`, `text-blue-900`, `text-blue-600`
- **Blur Effects**: `bg-blue-200/40`, `bg-blue-300/40`
- **Borders**: `border-blue-200`, `border-blue-300`, `border-2 border-blue-300`

### RESOLVED
- **Badge**: `bg-emerald-50 border border-emerald-200 text-emerald-700`
- **Pill**: `bg-emerald-100 text-emerald-800`
- **Gradient**: `from-emerald-500 to-emerald-600`
- **Gradient Light**: `from-emerald-200/70 via-emerald-100/50 to-emerald-200/70`
- **Gradient Button**: `from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800`
- **Background**: `bg-emerald-50 border-emerald-300`
- **Background Card**: `bg-gradient-to-br from-emerald-50 to-emerald-50`
- **Icon Background**: `bg-emerald-500`
- **Text Colors**: `text-emerald-700`, `text-emerald-900`, `text-emerald-600`
- **Blur Effects**: `bg-emerald-200/40`, `bg-emerald-300/40`
- **Borders**: `border-emerald-200`, `border-emerald-300`, `border-2 border-emerald-300`

### CANCELLED
- **Badge**: `bg-gray-50 border border-gray-200 text-gray-700`
- **Pill**: `bg-gray-100 text-gray-800`
- **Gradient**: `from-gray-500 to-gray-600`
- **Gradient Light**: `from-gray-200/70 via-gray-100/50 to-gray-200/70`
- **Gradient Button**: `from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800`
- **Background**: `bg-gray-50 border-gray-300`
- **Background Card**: `bg-gradient-to-br from-gray-50 to-gray-50`
- **Icon Background**: `bg-gray-500`
- **Text Colors**: `text-gray-700`, `text-gray-900`, `text-gray-600`
- **Blur Effects**: `bg-gray-200/40`, `bg-gray-300/40`
- **Borders**: `border-gray-200`, `border-gray-300`, `border-2 border-gray-300`

### INVALID
- **Badge**: `bg-red-50 border border-red-200 text-red-700`
- **Pill**: `bg-red-100 text-red-800`
- **Gradient**: `from-red-500 to-red-600`
- **Gradient Light**: `from-red-200/70 via-red-100/50 to-red-200/70`
- **Gradient Button**: `from-red-600 to-red-700 hover:from-red-700 hover:to-red-800`
- **Background**: `bg-red-50 border-red-300`
- **Background Card**: `bg-gradient-to-br from-red-50 to-red-50`
- **Icon Background**: `bg-red-500`
- **Text Colors**: `text-red-700`, `text-red-900`, `text-red-600`
- **Blur Effects**: `bg-red-200/40`, `bg-red-300/40`
- **Borders**: `border-red-200`, `border-red-300`, `border-2 border-red-300`

---

## 🔍 Screening Status Color Scheme

### PENDING
- **Badge**: `bg-amber-50 border border-amber-200 text-amber-700`
- **Pill**: `bg-amber-100 text-amber-800`
- **Gradient**: `from-amber-500 to-orange-500`
- **Gradient Light**: `from-amber-200/70 via-amber-100/50 to-amber-200/70`
- **Gradient Button**: `from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700`
- **Background**: `bg-amber-50 border-amber-300`
- **Background Card**: `bg-gradient-to-br from-amber-50 to-orange-50`
- **Icon Background**: `bg-amber-500`
- **Text Colors**: `text-amber-700`, `text-amber-900`, `text-amber-600`
- **Blur Effects**: `bg-amber-200/40`, `bg-amber-300/40`
- **Borders**: `border-amber-200`, `border-amber-300`, `border-2 border-amber-300`
- **Timeline**: `bg-amber-500 ring-4 ring-amber-200` (active), `bg-amber-500` (completed), `bg-amber-300` (line)

### SUBMITTED
- **Badge**: `bg-blue-50 border border-blue-200 text-blue-700`
- **Pill**: `bg-blue-100 text-blue-800`
- **Gradient**: `from-blue-500 to-blue-600`
- **Gradient Light**: `from-blue-200/70 via-blue-100/50 to-blue-200/70`
- **Gradient Button**: `from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800`
- **Background**: `bg-blue-50 border-blue-300`
- **Background Card**: `bg-gradient-to-br from-blue-50 to-blue-50`
- **Icon Background**: `bg-blue-500`
- **Text Colors**: `text-blue-700`, `text-blue-900`, `text-blue-600`
- **Blur Effects**: `bg-blue-200/40`, `bg-blue-300/40`
- **Borders**: `border-blue-200`, `border-blue-300`, `border-2 border-blue-300`

### APPROVED
- **Badge**: `bg-emerald-50 border border-emerald-200 text-emerald-700`
- **Pill**: `bg-emerald-100 text-emerald-800`
- **Gradient**: `from-emerald-500 to-emerald-600`
- **Gradient Light**: `from-emerald-200/70 via-emerald-100/50 to-emerald-200/70`
- **Gradient Button**: `from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800`
- **Background**: `bg-emerald-50 border-emerald-300`
- **Background Card**: `bg-gradient-to-br from-emerald-50 to-emerald-50`
- **Icon Background**: `bg-emerald-500`
- **Text Colors**: `text-emerald-700`, `text-emerald-900`, `text-emerald-600`
- **Blur Effects**: `bg-emerald-200/40`, `bg-emerald-300/40`
- **Borders**: `border-emerald-200`, `border-emerald-300`, `border-2 border-emerald-300`

### REJECTED
- **Badge**: `bg-red-50 border border-red-200 text-red-700`
- **Pill**: `bg-red-100 text-red-800`
- **Gradient**: `from-red-500 to-red-600`
- **Gradient Light**: `from-red-200/70 via-red-100/50 to-red-200/70`
- **Gradient Button**: `from-red-600 to-red-700 hover:from-red-700 hover:to-red-800`
- **Background**: `bg-red-50 border-red-300`
- **Background Card**: `bg-gradient-to-br from-red-50 to-red-50`
- **Icon Background**: `bg-red-500`
- **Text Colors**: `text-red-700`, `text-red-900`, `text-red-600`
- **Blur Effects**: `bg-red-200/40`, `bg-red-300/40`
- **Borders**: `border-red-200`, `border-red-300`, `border-2 border-red-300`

---

## 🌐 HTTP Status Codes Reference

### 🟢 Success (2xx)

**200 OK** → Standard success. (GET success, update success)

**201 Created** → Resource successfully created. (User registered, post created)

**202 Accepted** → Request accepted but not processed yet. (Async jobs, queue)

**204 No Content** → Success, but no body. (DELETE success, empty update)

### 🟡 Redirection (3xx)

**301 Moved Permanently** → Resource permanently moved.

**302 Found** → Temporary redirect.

**304 Not Modified** → Use cached version (common with ETags / caching).

### 🔴 Client Errors (4xx)

**400 Bad Request** → Invalid input / malformed request.

**401 Unauthorized** → Not logged in / invalid token.

**403 Forbidden** → Logged in but not allowed.

**404 Not Found** → Resource doesn't exist.

**405 Method Not Allowed** → Wrong HTTP method (e.g., POST on a GET route).

**408 Request Timeout** → Client took too long to send request.

**409 Conflict** → Conflict in state (duplicate email, version mismatch).

**410 Gone** → Resource permanently deleted.

**413 Payload Too Large** → File upload/request too big.

**415 Unsupported Media Type** → Wrong content type (sent XML, expected JSON).

**422 Unprocessable Entity** → Validation failed (form errors, invalid fields).

**429 Too Many Requests** → Rate limit exceeded.

### ⚫ Server Errors (5xx)

**500 Internal Server Error** → Generic backend crash.

**501 Not Implemented** → Endpoint not ready / unsupported feature.

**502 Bad Gateway** → Invalid response from upstream (e.g., API gateway).

**503 Service Unavailable** → Server down / overloaded / maintenance.

**504 Gateway Timeout** → Upstream server didn't respond in time.

---

## 🗄️ Prisma Database Commands

### 1. Reset Schema Migration
```bash
npx prisma migrate reset
```

### 2. Generate a New Migration
```bash
npx prisma migrate dev --name your-migration-name
```

### 3. Push to Supabase (Optional)
If you want to apply schema changes without generating migrations (not ideal for teams or prod):
```bash
npx prisma db push
```

### 4. Generate Latest Prisma Client
If you're only editing Prisma schema but didn't run a migration yet:
```bash
npx prisma generate
```

---

## 🎨 Shadcn UI Commands

### Add Button Component
```bash
npx shadcn@latest add button
```

### Add Other Components
```bash
npx shadcn@latest add [component-name]
```

Common components:
- `button`
- `card`
- `dialog`
- `dropdown-menu`
- `input`
- `label`
- `select`
- `table`
- `toast`
- `badge`

---

## 📝 Notes

- All color schemes follow a consistent pattern for badges, pills, gradients, backgrounds, icons, text, blur effects, and borders
- When implementing a new status, follow the same structure as existing statuses
- Use Tailwind CSS classes for all styling
- Status colors should be semantically meaningful (green for success, red for errors, amber for pending, etc.)

