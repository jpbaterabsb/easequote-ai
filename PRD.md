# 📋 PRODUCT REQUIREMENTS DOCUMENT (PRD)
## EaseQuote AI - Quote Management System for Construction Professionals

**Version:** 1.0 MVP  
**Date:** November 3, 2025  
**Document Owner:** Senior Business Requirements Analyst  
**Project Status:** Pre-Development  

---

## 📑 TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [Target Users & Personas](#3-target-users--personas)
4. [Business Model & Monetization](#4-business-model--monetization)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Technical Architecture](#7-technical-architecture)
8. [Database Schema](#8-database-schema)
9. [API Endpoints](#9-api-endpoints)
10. [User Interface & User Experience](#10-user-interface--user-experience)
11. [Integrations & Third-Party Services](#11-integrations--third-party-services)
12. [Security & Compliance](#12-security--compliance)
13. [Testing Strategy](#13-testing-strategy)
14. [Deployment Plan](#14-deployment-plan)
15. [Timeline & Milestones](#15-timeline--milestones)
16. [Risks & Mitigation](#16-risks--mitigation)
17. [Success Metrics](#17-success-metrics)
18. [Future Enhancements](#18-future-enhancements)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Product Overview
**EaseQuote AI** is a web-based SaaS platform designed to digitize and streamline the quote/estimate creation process for small construction professionals specializing in flooring and tile installation. The platform replaces traditional pen-and-paper methods with an intuitive digital solution that generates professional, multilingual PDF quotes.

### 1.2 Problem Statement
Micro-entrepreneurs in the construction industry (primarily Hispanic and Brazilian contractors in the US) currently rely on manual pen-and-paper methods to create quotes. This process is:
- Time-consuming and error-prone
- Unprofessional in presentation
- Difficult to track and manage
- Limited in reach (language barriers)
- Lacks historical data and analytics

### 1.3 Solution
A mobile-first, multilingual web application that:
- Simplifies quote creation with guided forms
- Auto-calculates totals and costs
- Generates professional, translated PDF quotes
- Sends quotes via WhatsApp or Email
- Tracks quote history and status
- Provides intelligent add-on suggestions

### 1.4 Key Success Factors
- **Mobile-first design**: 80% of users will access via smartphone
- **Multilingual support**: English, Spanish, Portuguese (UI + PDF)
- **Low learning curve**: Maximum 5 minutes to create first quote
- **Accessibility**: Designed for users with limited digital literacy
- **Affordability**: Competitive pricing for micro-entrepreneurs

---

## 2. PRODUCT VISION & GOALS

### 2.1 Vision Statement
*"Empower construction micro-entrepreneurs with professional digital tools that break language barriers and elevate their business presence."*

### 2.2 Product Goals (MVP)

**Primary Goals:**
1. Enable users to create professional quotes in <5 minutes
2. Generate multilingual PDF quotes (EN/ES/PT)
3. Distribute quotes via WhatsApp and Email
4. Track up to 30 quotes/month (Basic Plan)
5. Achieve 90%+ user satisfaction on ease of use

**Secondary Goals:**
1. Reduce quote creation time by 70% vs. pen-and-paper
2. Improve quote acceptance rate by 15%
3. Enable tracking of quote status through lifecycle
4. Provide customer history for repeat clients

### 2.3 Out of Scope (MVP)
- ❌ Voice input for dictation
- ❌ Camera/photo attachments
- ❌ Offline mode
- ❌ Automatic area calculation from photos
- ❌ CRM features (contact management)
- ❌ Calendar/scheduling integration
- ❌ Payment processing
- ❌ Team collaboration features
- ❌ Mobile native apps (iOS/Android)

---

## 3. TARGET USERS & PERSONAS

### 3.1 Primary Persona: "José - The Tile Installer"

**Demographics:**
- Age: 35-55
- Location: United States (FL, TX, CA, NY)
- Language: Spanish (primary), English (basic)
- Education: High school or less
- Digital literacy: Low to medium
- Annual revenue: $30K - $80K

**Behaviors:**
- Uses smartphone for 80% of business tasks
- Relies on WhatsApp for customer communication
- Currently uses pen/paper for quotes
- Works 6 days/week, on job sites
- Has limited time for admin tasks

**Pain Points:**
- Struggles to create professional-looking quotes
- Loses track of verbal quotes given to customers
- Cannot easily calculate complex pricing
- Difficulty communicating with English-speaking clients
- No record of past quotes for repeat customers

**Goals:**
- Look more professional to clients
- Spend less time on paperwork
- Win more jobs with clear quotes
- Track which quotes convert to jobs
- Easily communicate with diverse clientele

**Quote from José:**
*"I know my work is good, but my quotes look like a child wrote them. I want something simple that makes me look professional, even if I don't speak perfect English."*

### 3.2 Secondary Persona: "Maria - The Growing Contractor"

**Demographics:**
- Age: 30-45
- Location: United States
- Language: Bilingual (Spanish/English or Portuguese/English)
- Education: Some college
- Digital literacy: Medium
- Annual revenue: $80K - $150K
- Team size: 2-4 employees

**Behaviors:**
- Sends 10-20 quotes per week
- Uses smartphone + tablet/laptop
- Active on social media for marketing
- Starting to track business metrics
- Wants to scale operations

**Pain Points:**
- Managing increasing volume of quotes
- Inconsistent quote formatting across team
- No centralized quote history
- Difficult to follow up on pending quotes
- Manual calculation errors cost money

**Goals:**
- Scale business efficiently
- Standardize quote process across team
- Track quote-to-job conversion rates
- Build professional brand image
- Reduce administrative overhead

---

## 4. BUSINESS MODEL & MONETIZATION

### 4.1 Pricing Strategy

#### **Basic Plan: $30/month**
- Up to 30 quotes per month
- Unlimited customers
- PDF generation in 3 languages
- WhatsApp & Email delivery
- Quote history (12 months)
- Basic analytics
- Email support

#### **Pro Plan: $50/month** (Future Features TBD)
*Potential features for Pro tier:*
- Unlimited quotes
- Advanced analytics dashboard
- Custom branding (logo on PDFs)
- Quote templates
- Priority support
- Team collaboration (2-3 users)
- API access

### 4.2 Revenue Model
- **Primary**: Monthly recurring subscriptions
- **Secondary**: Annual subscriptions (10% discount)
- **Discount Coupons**: Promotional campaigns for customer acquisition

### 4.3 Cost Structure (Monthly)

**Fixed Costs:**
- Hosting (Supabase/Cloud): ~$50-100
- Domain & SSL: ~$2
- Email service (SendGrid): $0-20
- Monitoring tools: $0-10
- **Subtotal**: ~$52-132/month

**Variable Costs per User:**
- WhatsApp API (if used): ~$0.005-0.01 per message
- LLM API (Gemini): ~$0.02 per translation
- Google Maps API: ~$0.005 per geocode
- Storage: ~$0.02/GB
- **Est. per user**: ~$1-3/month

**Break-even Analysis:**
- Fixed + Variable: ~$150/month
- Break-even: **6 paying customers** at $30/month
- Target Y1: 100 customers = $3,000/month revenue

### 4.4 Customer Acquisition Strategy
1. **Organic**: SEO targeting "quote app for contractors"
2. **Social Media**: Spanish/Portuguese Facebook groups
3. **Referrals**: 20% discount for both referrer/referee
4. **Partnerships**: Home improvement stores (flyers)
5. **Content Marketing**: YouTube tutorials in ES/PT

---

## 5. FUNCTIONAL REQUIREMENTS

### 5.1 User Authentication & Account Management

#### FR-1.1: User Registration
**Priority:** P0 (Critical)

**Description:**  
New users must be able to create an account with minimal friction.

**Acceptance Criteria:**
- ✅ Registration form collects:
  - Email (required, validated)
  - Password (required, min 8 chars, must contain 1 number)
  - Full Name (required, 2-50 chars)
  - Phone Number (optional, E.164 format with country code)
- ✅ Email validation before account activation
- ✅ Password strength indicator shown
- ✅ "Show/Hide Password" toggle
- ✅ Duplicate email rejected with clear error message
- ✅ Success message + automatic login after registration
- ✅ Default language set to browser language (ES/PT/EN)

**Technical Notes:**
- Use Supabase Auth for user management
- Store user metadata in `profiles` table
- Email verification via Supabase Auth email templates

#### FR-1.2: User Login
**Priority:** P0 (Critical)

**Description:**  
Existing users log in via email/password or Google OAuth.

**Acceptance Criteria:**
- ✅ Login form with email + password
- ✅ "Login with Google" button (Supabase Google provider)
- ✅ "Remember Me" checkbox (30-day session)
- ✅ "Forgot Password" link redirects to password reset flow
- ✅ Invalid credentials show generic error: "Invalid email or password"
- ✅ Account locked after 5 failed attempts (15-minute lockout)
- ✅ Redirect to dashboard after successful login

**Technical Notes:**
- Implement JWT-based authentication via Supabase
- Use HTTP-only cookies for session management
- Implement rate limiting on login endpoint

#### FR-1.3: Password Reset
**Priority:** P1 (High)

**Acceptance Criteria:**
- ✅ User enters email → receives reset link via email
- ✅ Reset link expires after 1 hour
- ✅ User creates new password (same validation as registration)
- ✅ Old password invalidated immediately
- ✅ Confirmation email sent after successful reset

#### FR-1.4: Settings Page
**Priority:** P1 (High)

**Description:**  
Users manage their profile and account settings.

**Acceptance Criteria:**
- ✅ Editable fields:
  - Full Name
  - Email (requires re-verification)
  - Phone Number
  - Password (current password required)
  - Profile Picture (upload, max 2MB, JPG/PNG)
  - Company Logo (upload, max 2MB, used on PDFs)
- ✅ Language preference (EN/ES/PT)
- ✅ Save button → success toast notification
- ✅ Cancel button → discard changes confirmation modal

**Technical Notes:**
- Store profile picture in Supabase Storage bucket `avatars/`
- Store company logo in `logos/` bucket
- Resize images to 200x200 (avatar) and 400x400 (logo)

---

### 5.2 Quote Creation & Management

#### FR-2.1: Create New Quote
**Priority:** P0 (Critical)

**Description:**  
User creates a new quote with customer and job details.

**Acceptance Criteria:**

**Step 1: Customer Information**
- ✅ Customer Name (required, text input)
- ✅ Customer Phone (optional, formatted with international dial code selector)
- ✅ Customer Email (optional, validated if provided)
- ✅ Job Address (optional)
  - Google Maps Autocomplete integration
  - Auto-fills city, state, zip from address
  - Stores latitude/longitude for filtering

**Step 2: Add Line Items**
- ✅ "Add Item" button opens item form modal
- ✅ Item form fields:
  - **Item Name** (required, text, e.g., "Bathroom Floor")
  - **Area** (required, number, US units)
    - Input type selector: "Square Feet" or "Dimensions"
    - If Dimensions: Length (ft) × Width (ft) → auto-calculates sq ft
  - **Price per Square Foot** (required, USD, $)
  - **Total Cost** (auto-calculated: Area × Price/sqft, read-only)
  - **Start Date** (optional, date picker)
  - **End Date** (optional, date picker, must be ≥ Start Date)
  - **Payment Method** (radio buttons):
    - Credit Card
    - Debit Card
    - Cash
    - Check
    - Zelle/Venmo

**Step 3: Add-ons (Optional)**
- ✅ "Add Add-on" button opens add-on selector
- ✅ Hierarchical dropdown with predefined options:

```
Floor Type
├─ Tile
├─ Vinyl
│  ├─ Mat
│  │  └─ 2M x 20M
│  ├─ Plank
│  │  ├─ 122 x 18 cm
│  │  └─ 152 x 22 cm
│  ├─ Tile
│  │  ├─ 45 x 45 cm
│  │  └─ 60 x 60 cm
│  ├─ Click
│  │  └─ 4-6.5mm thickness
│  └─ SPC
├─ Wood
└─ Laminate

Other
├─ Demolition
│  ├─ Light
│  ├─ Medium
│  └─ Heavy
├─ Niche
├─ Bench
├─ Pattern
│  └─ Subway
├─ Waterproofing
├─ Substrate
│  └─ OK
├─ Custom Niche
└─ Linear Drain
```

- ✅ Each add-on has:
  - Description (auto-populated or custom)
  - Price (USD, required)
- ✅ "Other" option allows fully custom add-on name + price
- ✅ Add-ons displayed as chips with price, removable via X icon
- ✅ Add-on total summed into line item total

**Step 4: Materials**
- ✅ Toggle: "Customer Provides Materials?" (Yes/No)
- ✅ If Yes:
  - Show input: "Material Cost" (USD, customer's material budget)
  - Deduct from labor total OR display separately in PDF

**Step 5: Notes**
- ✅ Textarea: "Additional Notes" (optional, max 500 chars)
- ✅ Character counter shown

**Step 6: Save**
- ✅ "Save Quote" button validates all required fields
- ✅ Quote status set to "CREATED"
- ✅ Success toast: "Quote #[ID] created successfully!"
- ✅ Redirect to dashboard
- ✅ "Cancel" button → confirmation modal → discard quote

**Technical Notes:**
- Generate unique Quote ID: `QT-YYYYMMDD-XXXX` (e.g., QT-20251103-0001)
- Store add-ons as JSONB in database for flexibility
- Use Zustand for multi-step form state management
- Implement auto-save draft every 30 seconds

---

#### FR-2.2: Dashboard - Quote List View
**Priority:** P0 (Critical)

**Description:**  
Dashboard displays all user's quotes with filtering and sorting.

**Acceptance Criteria:**

**Empty State:**
- ✅ If no quotes exist:
  - Show centered illustration
  - "No quotes yet! Create your first quote to get started."
  - "Create Quote" button (primary CTA)

**Quote List (if quotes exist):**
- ✅ Display quotes in card/table format (responsive)
- ✅ Each quote shows:
  - Quote ID (e.g., QT-20251103-0001)
  - Customer Name
  - Total Amount (USD, formatted: $1,234.56)
  - Status Badge (color-coded):
    - 🟦 CREATED (blue)
    - 🟢 SENT (green)
    - 🟡 ACCEPTED (yellow)
    - 🟣 IN PROGRESS (purple)
    - ✅ COMPLETED (dark green)
    - 🔴 REJECTED (red)
  - Created Date (relative: "2 days ago" OR absolute: "Nov 1, 2025")
  - Actions dropdown (⋮):
    - View
    - Edit
    - Send via Email
    - Send via WhatsApp
    - Change Status
    - Delete (with confirmation)

**Filters & Search:**
- ✅ Search bar: Filter by customer name, quote ID, address
- ✅ Filters (multi-select dropdowns):
  - Status (CREATED, SENT, ACCEPTED, etc.)
  - Date Range (date picker: From - To)
  - Amount Range (min/max USD)
  - Location (city/state from address)
- ✅ "Clear Filters" button resets all filters

**Sorting:**
- ✅ Sort by dropdown:
  - Created Date (newest first / oldest first)
  - Customer Name (A-Z / Z-A)
  - Total Amount (high to low / low to high)
  - Status

**Pagination:**
- ✅ 20 quotes per page
- ✅ Page numbers + Previous/Next buttons
- ✅ "Show X of Y quotes"

**Technical Notes:**
- Use Supabase query filtering for server-side filtering
- Implement debounced search (300ms delay)
- Cache filter state in URL query params for shareable links

---

#### FR-2.3: View Quote Details
**Priority:** P0 (Critical)

**Acceptance Criteria:**
- ✅ Clicking quote opens detail view
- ✅ Display all quote information (read-only):
  - Customer info
  - Line items with add-ons
  - Materials toggle state
  - Notes
  - Total breakdown
- ✅ Action buttons:
  - Edit Quote
  - Send via Email
  - Send via WhatsApp
  - Download PDF
  - Change Status
  - Delete Quote

---

#### FR-2.4: Edit Quote
**Priority:** P1 (High)

**Acceptance Criteria:**
- ✅ Edit form identical to Create Quote form
- ✅ All existing data pre-populated
- ✅ "Update Quote" button saves changes
- ✅ "Cancel" button discards changes (confirmation modal)
- ✅ Audit log: Track edit history (timestamp + user)

---

#### FR-2.5: Delete Quote
**Priority:** P1 (High)

**Acceptance Criteria:**
- ✅ Delete button shows confirmation modal:
  - "Are you sure? This action cannot be undone."
  - "Cancel" | "Delete" buttons
- ✅ Soft delete (set `deleted_at` timestamp)
- ✅ Deleted quotes hidden from dashboard
- ✅ Success toast: "Quote deleted successfully"

---

#### FR-2.6: Change Quote Status
**Priority:** P1 (High)

**Acceptance Criteria:**
- ✅ Status dropdown in quote detail view
- ✅ Available statuses:
  - CREATED → SENT
  - SENT → ACCEPTED / REJECTED
  - ACCEPTED → IN PROGRESS
  - IN PROGRESS → COMPLETED
- ✅ Status change logged with timestamp
- ✅ Dashboard badge updates immediately

---

### 5.3 PDF Generation & Delivery

#### FR-3.1: Generate PDF Quote
**Priority:** P0 (Critical)

**Description:**  
System generates professional, multilingual PDF quotes.

**Acceptance Criteria:**

**PDF Content:**
- ✅ Header:
  - Company Logo (if uploaded)
  - "QUOTE" or "PRESUPUESTO" or "ORÇAMENTO" (localized)
  - Quote ID
  - Date Issued
- ✅ From (Business) Section:
  - User's Full Name
  - Phone Number
  - Email
- ✅ To (Customer) Section:
  - Customer Name
  - Customer Phone
  - Customer Email
  - Job Address
- ✅ Line Items Table:
  - Item Name
  - Area (sq ft)
  - Price/sq ft
  - Add-ons (indented, itemized)
  - Line Total
- ✅ Summary Section:
  - Subtotal
  - Materials Cost (if customer provides)
  - **Total Amount** (bold, large font)
- ✅ Payment Method displayed
- ✅ Start/End Dates displayed
- ✅ Notes section
- ✅ Footer:
  - "Thank you for your business!" (localized)
  - Page numbers (Page X of Y)

**Translation Workflow:**
- ✅ Before generating PDF, show language selector modal:
  - English 🇺🇸
  - Español 🇪🇸
  - Português 🇧🇷
- ✅ System uses LLM (Gemini 2.5 Flash) to translate:
  - Item names
  - Add-on descriptions
  - Notes
  - Standard labels (headers, footers)
- ✅ Maintain numeric formatting (USD remains $)
- ✅ Preserve proper nouns (customer name, address)

**PDF Formatting:**
- ✅ Professional template with consistent branding
- ✅ Responsive layout (readable on mobile)
- ✅ Clear typography (minimum 10pt font)
- ✅ High-contrast colors for readability
- ✅ File naming: `Quote-[ID]-[CustomerName].pdf`

**Technical Notes:**
- Use `markdown-to-pdf` library or Puppeteer for PDF generation
- LLM Prompt Example:
  ```
  Translate the following quote content from English to [Spanish/Portuguese].
  Preserve all numbers, currency symbols, and proper nouns.
  
  Original:
  - Item: "Master Bathroom Floor - Vinyl Plank"
  - Notes: "Customer will provide materials. Start date flexible."
  
  Translate to Spanish.
  ```
- Cache translations for common phrases to reduce API calls

---

#### FR-3.2: Send Quote via Email
**Priority:** P0 (Critical)

**Acceptance Criteria:**
- ✅ "Send via Email" button opens email preview modal
- ✅ Modal shows:
  - To: Customer Email (editable)
  - Subject: "Quote #[ID] from [Business Name]" (editable)
  - Body: Default template (editable):
    ```
    Hello [Customer Name],
    
    Thank you for your interest! Please find attached your quote for [Job Description].
    
    If you have any questions, feel free to reach out.
    
    Best regards,
    [User Name]
    [Phone]
    ```
  - PDF attachment preview
  - Language selector (EN/ES/PT)
- ✅ "Send Email" button triggers email delivery
- ✅ Success toast: "Email sent successfully!"
- ✅ Email sent via SendGrid/Resend with retry logic
- ✅ Track email status: Sent, Delivered, Opened (if possible)
- ✅ Error handling: Display error if email fails

**Technical Notes:**
- Use SendGrid or Resend for email delivery
- Implement email templates in all 3 languages
- Store email log in `quote_emails` table

---

#### FR-3.3: Send Quote via WhatsApp
**Priority:** P0 (Critical)

**Acceptance Criteria:**

**Option A: WhatsApp Web Link (Simpler, MVP Recommended)**
- ✅ "Send via WhatsApp" button opens modal
- ✅ Modal shows:
  - Customer Phone Number (editable, formatted)
  - Message preview:
    ```
    Hello [Customer Name]! 
    
    Here's your quote #[ID] for [Job Description].
    Total: $[Amount]
    
    [Link to PDF or download]
    
    Let me know if you have questions!
    ```
  - Language selector (EN/ES/PT)
- ✅ "Open WhatsApp" button generates WhatsApp Web URL:
  - `https://wa.me/[PHONE]?text=[URL_ENCODED_MESSAGE]`
  - Opens in new tab
  - PDF hosted on temporary public link (24-hour expiry)
- ✅ User manually sends message in WhatsApp
- ✅ Success toast: "WhatsApp opened! Send message to complete."

**Option B: WhatsApp Business API (Future / Pro Plan)**
- Requires WhatsApp Business Account verification
- Automates message sending via Meta Cloud API
- Requires message templates pre-approval

**Technical Notes:**
- Generate temporary PDF link via Supabase Storage signed URLs
- Shorten PDF link using Bitly API (optional)
- For Option B, implement WhatsApp Cloud API integration

---

### 5.4 Customer History & Autocomplete

#### FR-4.1: Customer Autocomplete
**Priority:** P1 (High)

**Acceptance Criteria:**
- ✅ When typing Customer Name in quote form:
  - Show dropdown with matching past customers
  - Display: Name + Phone + Last Job Address
- ✅ Selecting customer auto-fills:
  - Phone Number
  - Email
  - Address (optional: "Use last address?" checkbox)
- ✅ Dropdown shows max 5 recent matches
- ✅ "Create New Customer" option always visible

**Technical Notes:**
- Query `customers` table with fuzzy search (Supabase Full Text Search)
- Debounce search input (300ms)

---

## 6. NON-FUNCTIONAL REQUIREMENTS

### 6.1 Performance

**NFR-1: Page Load Time**
- ✅ Initial page load < 3 seconds (on 4G network)
- ✅ Dashboard renders < 2 seconds
- ✅ Quote creation form loads < 1.5 seconds

**NFR-2: PDF Generation**
- ✅ PDF generated in < 10 seconds
- ✅ Translation via LLM < 5 seconds

**NFR-3: API Response Time**
- ✅ 95th percentile response time < 500ms
- ✅ Database queries < 200ms

### 6.2 Scalability

**NFR-4: Concurrent Users**
- ✅ Support 100 concurrent users (MVP)
- ✅ Scale to 1,000 users within 6 months

**NFR-5: Data Storage**
- ✅ Support 10,000 quotes per user
- ✅ Total storage capacity: 100GB (Year 1)

### 6.3 Availability & Reliability

**NFR-6: Uptime**
- ✅ 99.5% uptime SLA (43 hours downtime/year)
- ✅ Scheduled maintenance during low-traffic hours (2-6 AM EST)

**NFR-7: Data Backup**
- ✅ Daily automated backups
- ✅ Point-in-time recovery (PITR) up to 7 days

### 6.4 Usability

**NFR-8: Mobile Responsiveness**
- ✅ Fully responsive on devices 320px - 2560px width
- ✅ Touch-friendly UI (min 44x44px tap targets)
- ✅ Optimized for iOS Safari and Chrome Android

**NFR-9: Accessibility**
- ✅ WCAG 2.1 Level AA compliance
- ✅ Keyboard navigation support
- ✅ Screen reader compatible
- ✅ Minimum color contrast ratio 4.5:1

**NFR-10: Internationalization**
- ✅ Full UI translation in EN/ES/PT
- ✅ Date formatting based on locale
- ✅ Currency formatting (USD with proper thousand separators)
- ✅ Right-to-left (RTL) support (future: Arabic)

### 6.5 Security

**NFR-11: Authentication**
- ✅ JWT-based authentication
- ✅ Session timeout after 30 days inactivity
- ✅ Password hashing with bcrypt (min 10 rounds)

**NFR-12: Data Encryption**
- ✅ HTTPS/TLS 1.3 for all connections
- ✅ Encrypted database storage (Supabase default)

**NFR-13: Rate Limiting**
- ✅ Login attempts: 5 per 15 minutes per IP
- ✅ API requests: 100 per minute per user
- ✅ PDF generation: 10 per hour per user

---

## 7. TECHNICAL ARCHITECTURE

### 7.1 Technology Stack

#### **Frontend**
```yaml
Framework: Vite 6.x + React 19
Compiler: SWC (Speedy Web Compiler)
Language: TypeScript 5.x
State Management: Zustand 4.x
UI Library: TailwindCSS 4.x + Radix UI + Shadcn/UI
Forms: React Hook Form + Zod validation
HTTP Client: Supabase JS Client
Maps: @vis.gl/react-google-maps or react-geocode
Date Handling: date-fns
Icons: Lucide React
```

**Key Libraries:**
- `@supabase/supabase-js` - Supabase client
- `@supabase/auth-ui-react` - Pre-built auth components
- `@supabase/auth-ui-shared` - Auth UI themes
- `zustand` - State management
- `react-router-dom` - Routing
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `@radix-ui/react-*` - Accessible UI primitives (Dialog, Dropdown, Select, etc.)
- `shadcn/ui` - Pre-built components built on Radix UI
- `date-fns` - Date utilities
- `lucide-react` - Icons

#### **Backend (Supabase Only)**
```yaml
Platform: Supabase (All-in-one Backend)
Database: PostgreSQL 15 (Supabase)
API: PostgREST (Auto-generated REST API)
Authentication: Supabase Auth
File Storage: Supabase Storage
Serverless Functions: Supabase Edge Functions (Deno)
Database Functions: PostgreSQL Functions & Triggers
```

**Supabase Services:**
- **PostgREST** - Auto-generated REST API from database schema
- **Supabase Auth** - Authentication & authorization
- **Supabase Storage** - File storage (PDFs, avatars, logos)
- **Edge Functions** - Serverless functions for PDF generation & translation (Deno/TypeScript)
- **Database Functions** - PostgreSQL functions for business logic
- **Realtime** - Real-time subscriptions (optional)

#### **Third-Party Services**
```yaml
Auth: Supabase Auth (JWT + Google OAuth)
Storage: Supabase Storage
LLM: Google Gemini 2.5 Flash API (via Edge Functions)
Maps: Google Maps Geocoding API (client-side)
Email: Resend (via Edge Functions)
WhatsApp: WhatsApp Web links (MVP) / Cloud API (future)
PDF Generation: jsPDF or Puppeteer (via Edge Functions)
Monitoring: Sentry (error tracking)
Analytics: Google Analytics 4
```

### 7.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │   React SPA (Vite + SWC + TypeScript)           │   │
│  │   - Zustand (State)                             │   │
│  │   - React Router (Routing)                      │   │
│  │   - TailwindCSS + Radix UI (UI Components)     │   │
│  │   - Supabase JS Client                          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   SUPABASE PLATFORM                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │   PostgREST API (Auto-generated)                │   │
│  │   - CRUD operations                             │   │
│  │   - Row Level Security (RLS)                   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │   Edge Functions (Deno/TypeScript)              │   │
│  │   - PDF Generation                              │   │
│  │   - LLM Translation (Gemini)                   │   │
│  │   - Email Sending (Resend)                     │   │
│  │   - WhatsApp Link Generation                   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │   Database Functions (PostgreSQL)               │   │
│  │   - Quote number generation                     │   │
│  │   - Business logic                              │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │   Supabase Auth                                 │   │
│  │   - JWT authentication                          │   │
│  │   - Google OAuth                                │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │   Supabase Storage                              │   │
│  │   - PDFs (private)                              │   │
│  │   - Avatars & Logos (public)                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│   External APIs                          │
│   - Google Gemini 2.5 Flash              │
│   - Google Maps Geocoding                │
│   - Resend (Email)                       │
└──────────────────────────────────────────┘
```

### 7.3 Data Flow

**Quote Creation Flow:**
```
1. User fills quote form (React)
2. Zustand stores form state
3. On submit → Supabase PostgREST API
4. Validate data (Zod on frontend + DB constraints)
5. Save to Supabase PostgreSQL (via PostgREST)
6. Database trigger generates quote number
7. Return quote ID to frontend
8. Redirect to dashboard
```

**PDF Generation & Send Flow:**
```
1. User clicks "Send via Email"
2. Frontend calls Supabase Edge Function: generate-pdf-and-send
3. Edge Function:
   a. Fetch quote data from Supabase (via PostgREST)
   b. Call Gemini API for translation
   c. Generate PDF (jsPDF or Puppeteer)
   d. Upload PDF to Supabase Storage
   e. Send email via Resend with PDF attachment
   f. Log email status in quote_emails table
4. Return success/failure to frontend
5. Update quote status in database (via PostgREST)
```

---

## 8. DATABASE SCHEMA

### 8.1 Tables

#### **users (managed by Supabase Auth)**
```sql
-- Managed by Supabase, extended via profiles table
```

#### **profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  company_logo_url TEXT,
  language VARCHAR(2) DEFAULT 'en' CHECK (language IN ('en', 'es', 'pt')),
  subscription_plan VARCHAR(20) DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'pro')),
  subscription_status VARCHAR(20) DEFAULT 'active',
  monthly_quote_limit INT DEFAULT 30,
  quotes_used_this_month INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### **customers**
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, email) -- Prevent duplicate customers per user
);

CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_name ON customers(user_id, name); -- For autocomplete

-- RLS Policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own customers"
  ON customers
  USING (auth.uid() = user_id);
```

#### **quotes**
```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number VARCHAR(20) UNIQUE NOT NULL, -- QT-YYYYMMDD-XXXX
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Customer info (denormalized for historical accuracy)
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20),
  customer_email VARCHAR(100),
  customer_address TEXT,
  customer_city VARCHAR(100),
  customer_state VARCHAR(50),
  customer_zip VARCHAR(20),
  customer_lat DECIMAL(10, 8),
  customer_lng DECIMAL(11, 8),
  
  -- Quote details
  status VARCHAR(20) DEFAULT 'created' CHECK (status IN ('created', 'sent', 'accepted', 'rejected', 'in_progress', 'completed')),
  notes TEXT,
  customer_provides_materials BOOLEAN DEFAULT FALSE,
  material_cost DECIMAL(10, 2) DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
  
  CONSTRAINT positive_amounts CHECK (subtotal >= 0 AND total_amount >= 0)
);

CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_status ON quotes(user_id, status);
CREATE INDEX idx_quotes_created_at ON quotes(user_id, created_at DESC);
CREATE INDEX idx_quotes_deleted_at ON quotes(deleted_at); -- For soft delete queries

-- RLS Policies
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own quotes"
  ON quotes
  USING (auth.uid() = user_id);
```

#### **quote_items**
```sql
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  
  -- Item details
  item_name VARCHAR(200) NOT NULL,
  area DECIMAL(10, 2) NOT NULL, -- Square feet
  price_per_sqft DECIMAL(10, 2) NOT NULL,
  line_total DECIMAL(10, 2) NOT NULL,
  
  -- Optional fields
  start_date DATE,
  end_date DATE,
  payment_method VARCHAR(50), -- 'credit_card', 'debit_card', 'cash', 'check', 'zelle'
  
  -- Add-ons stored as JSONB for flexibility
  addons JSONB DEFAULT '[]', 
  -- Example: [{"name": "Vinyl - Plank - 122x18cm", "price": 150.00}, {...}]
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_values CHECK (area > 0 AND price_per_sqft >= 0 AND line_total >= 0)
);

CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);

-- RLS Policies
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access items of own quotes"
  ON quote_items
  USING (
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE quotes.id = quote_items.quote_id 
      AND quotes.user_id = auth.uid()
    )
  );
```

#### **quote_emails** (Email delivery log)
```sql
CREATE TABLE quote_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  recipient_email VARCHAR(100) NOT NULL,
  subject VARCHAR(200),
  body TEXT,
  language VARCHAR(2) CHECK (language IN ('en', 'es', 'pt')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quote_emails_quote_id ON quote_emails(quote_id);
CREATE INDEX idx_quote_emails_status ON quote_emails(status, sent_at DESC);

-- RLS Policies
ALTER TABLE quote_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quote emails"
  ON quote_emails FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quotes 
      WHERE quotes.id = quote_emails.quote_id 
      AND quotes.user_id = auth.uid()
    )
  );
```

#### **audit_log** (Track changes for compliance)
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  entity_type VARCHAR(50) NOT NULL, -- 'quote', 'customer', 'profile'
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'status_changed'
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON audit_log FOR SELECT
  USING (auth.uid() = user_id);
```

### 8.2 Functions & Triggers

#### **Auto-update `updated_at` timestamp**
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

#### **Generate Quote Number**
```sql
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
DECLARE
  date_prefix TEXT;
  seq_num INT;
BEGIN
  date_prefix := 'QT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-';
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM 16) AS INT)), 0) + 1
  INTO seq_num
  FROM quotes
  WHERE quote_number LIKE date_prefix || '%';
  
  NEW.quote_number := date_prefix || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_quote_number
  BEFORE INSERT ON quotes
  FOR EACH ROW EXECUTE FUNCTION generate_quote_number();
```

#### **Reset Monthly Quote Counter**
```sql
CREATE OR REPLACE FUNCTION reset_monthly_quote_counters()
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET quotes_used_this_month = 0
  WHERE DATE_TRUNC('month', NOW()) > DATE_TRUNC('month', updated_at);
END;
$$ LANGUAGE plpgsql;

-- Schedule via pg_cron (Supabase extension) or external cron job
-- SELECT cron.schedule('reset-quote-counters', '0 0 1 * *', 'SELECT reset_monthly_quote_counters()');
```

---

## 9. API ENDPOINTS

### 9.1 Authentication Endpoints (Supabase Auth)

All authentication handled via Supabase SDK on frontend. No custom endpoints needed.

```typescript
// Example: Register
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'John Doe',
      phone: '+15551234567'
    }
  }
})

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})
```

### 9.2 Profile Endpoints (PostgREST)

#### **GET /rest/v1/profiles?id=eq.{user_id}**
Get current user's profile

**Auth:** Required (via Supabase JWT)  
**Response:**
```json
[
  {
    "id": "uuid",
    "full_name": "John Doe",
    "phone": "+15551234567",
    "avatar_url": "https://...",
    "company_logo_url": "https://...",
    "language": "es",
    "subscription_plan": "basic",
    "monthly_quote_limit": 30,
    "quotes_used_this_month": 12
  }
]
```

#### **PATCH /rest/v1/profiles?id=eq.{user_id}**
Update user profile

**Auth:** Required  
**Request Body:**
```json
{
  "full_name": "John Doe",
  "phone": "+15551234567",
  "language": "pt"
}
```

### 9.3 Quote Endpoints (PostgREST)

#### **POST /rest/v1/quotes**
Create new quote

**Auth:** Required  
**Request Body:**
```json
{
  "customer_name": "Maria Garcia",
  "customer_phone": "+15559876543",
  "customer_email": "maria@email.com",
  "customer_address": "123 Main St, Miami, FL 33101",
  "notes": "Customer prefers morning appointments",
  "customer_provides_materials": false,
  "material_cost": 0,
  "subtotal": 1377.75,
  "total_amount": 1727.75
}
```

**Response:** Created quote object (quote_number auto-generated by trigger)

#### **GET /rest/v1/quotes**
List all quotes with filtering

**Auth:** Required  
**Query Params (PostgREST syntax):**
- `status=eq.created` - Filter by status
- `customer_name=ilike.*maria*` - Search by customer name
- `created_at=gte.2025-11-01` - Date from
- `created_at=lte.2025-11-30` - Date to
- `total_amount=gte.1000` - Min amount
- `total_amount=lte.5000` - Max amount
- `order=created_at.desc` - Sort
- `limit=20&offset=0` - Pagination

**Response:** Array of quote objects

#### **GET /rest/v1/quotes?id=eq.{quote_id}**
Get quote details

**Auth:** Required  
**Response:** Quote object

#### **PATCH /rest/v1/quotes?id=eq.{quote_id}**
Update quote

**Auth:** Required  
**Request Body:** Partial update allowed

#### **DELETE /rest/v1/quotes?id=eq.{quote_id}**
Soft delete quote (sets deleted_at)

**Auth:** Required

#### **PATCH /rest/v1/quotes?id=eq.{quote_id}**
Change quote status

**Auth:** Required  
**Request Body:**
```json
{
  "status": "sent"
}
```

### 9.4 Quote Items Endpoints (PostgREST)

#### **POST /rest/v1/quote_items**
Create quote items (after creating quote)

**Auth:** Required  
**Request Body:**
```json
[
  {
    "quote_id": "uuid",
    "item_name": "Kitchen Floor",
    "area": 250.5,
    "price_per_sqft": 5.50,
    "line_total": 1377.75,
    "start_date": "2025-11-10",
    "end_date": "2025-11-12",
    "payment_method": "credit_card",
    "addons": [
      {"name": "Vinyl - Plank - 122x18cm", "price": 150.00},
      {"name": "Waterproofing", "price": 200.00}
    ]
  }
]
```

#### **GET /rest/v1/quote_items?quote_id=eq.{quote_id}**
Get items for a quote

**Auth:** Required

### 9.5 PDF Generation & Delivery (Edge Functions)

#### **POST /functions/v1/generate-pdf**
Generate translated PDF

**Auth:** Required (via Authorization header)  
**Request Body:**
```json
{
  "quote_id": "uuid",
  "language": "es" // en, es, pt
}
```

**Response:**
```json
{
  "pdf_url": "https://storage.supabase.co/...",
  "expires_at": "2025-11-04T10:30:00Z" // 24 hours
}
```

#### **POST /functions/v1/send-email**
Send quote via email

**Auth:** Required  
**Request Body:**
```json
{
  "quote_id": "uuid",
  "recipient_email": "customer@email.com",
  "subject": "Your Quote from ABC Flooring",
  "body": "Hello Maria...",
  "language": "es"
}
```

**Response:**
```json
{
  "success": true,
  "email_id": "uuid",
  "message": "Email sent successfully"
}
```

#### **POST /functions/v1/whatsapp-link**
Generate WhatsApp Web link

**Auth:** Required  
**Request Body:**
```json
{
  "quote_id": "uuid",
  "phone": "+15559876543",
  "language": "es"
}
```

**Response:**
```json
{
  "whatsapp_url": "https://wa.me/15559876543?text=...",
  "pdf_url": "https://storage.supabase.co/..."
}
```

### 9.6 Customers Endpoints (PostgREST)

#### **GET /rest/v1/customers?name=ilike.*{query}*&limit=5**
Autocomplete customer search

**Auth:** Required  
**Query Params:**
- `name=ilike.*maria*` - Search query
- `limit=5` - Max results

**Response:** Array of customer objects

---

## 10. USER INTERFACE & USER EXPERIENCE

### 10.1 Design Principles

1. **Mobile-First**: Design for 375px width first, scale up
2. **High Contrast**: Minimum 4.5:1 contrast ratio for accessibility
3. **Large Touch Targets**: Minimum 44x44px for buttons
4. **Clear Typography**: 16px base font, readable on small screens
5. **Minimal Cognitive Load**: Max 3 actions visible per screen
6. **Progressive Disclosure**: Show advanced options only when needed
7. **Instant Feedback**: Loading states, success/error toasts
8. **Forgiving Input**: Auto-format phone numbers, dates, currency

### 10.2 Key Screens

#### **10.2.1 Registration Screen**
```
┌─────────────────────────────────┐
│  [Logo] EaseQuote AI            │
│                                 │
│  Create Your Account            │
│                                 │
│  [Email input]                  │
│  [Password input] [👁]          │
│  [Full Name input]              │
│  [Phone input] (optional)       │
│                                 │
│  [✓ I agree to Terms]           │
│                                 │
│  [Create Account - Big Button]  │
│                                 │
│  Or                             │
│  [🔵 Continue with Google]      │
│                                 │
│  Already have account? [Login]  │
└─────────────────────────────────┘
```

**Features:**
- Password strength indicator (weak/medium/strong)
- Real-time email validation
- Phone number with country code dropdown (+1, +52, +55)
- Auto-detect language from browser (EN/ES/PT)

---

#### **10.2.2 Dashboard Screen**

**Empty State:**
```
┌─────────────────────────────────┐
│ [☰] EaseQuote AI     [@avatar▼]│
├─────────────────────────────────┤
│                                 │
│      [Illustration]             │
│                                 │
│   No quotes yet!                │
│   Create your first quote       │
│   to get started.               │
│                                 │
│   [+ Create Quote]              │
│                                 │
└─────────────────────────────────┘
```

**With Quotes:**
```
┌─────────────────────────────────┐
│ [☰] EaseQuote AI     [@avatar▼]│
├─────────────────────────────────┤
│ [🔍 Search...]  [Filters ▼]    │
│                                 │
│ Quotes (45)         [+ Create]  │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ QT-20251103-0001   [⋮]      │ │
│ │ Maria Garcia                │ │
│ │ $1,727.75    🟦 CREATED    │ │
│ │ 2 days ago                  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ QT-20251101-0042   [⋮]      │ │
│ │ John Smith                  │ │
│ │ $3,450.00    🟢 SENT       │ │
│ │ 4 days ago                  │ │
│ └─────────────────────────────┘ │
│                                 │
│ [1] 2 3 ... 23 [Next]          │
└─────────────────────────────────┘
```

**Dropdown Menu (⋮):**
- 👁 View
- ✏️ Edit
- 📧 Send Email
- 💬 Send WhatsApp
- 🔄 Change Status
- 🗑️ Delete

---

#### **10.2.3 Create Quote Screen (Mobile)**

**Step 1: Customer Info**
```
┌─────────────────────────────────┐
│ [←] New Quote              [✕]  │
├─────────────────────────────────┤
│                                 │
│ Customer Information            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                 │
│ Customer Name *                 │
│ [Maria Garcia      ]            │
│ ↓ Suggestions:                  │
│   Maria Garcia - (555)123-4567  │
│                                 │
│ Phone Number                    │
│ [+1 ▼] [(555) 123-4567]        │
│                                 │
│ Email                           │
│ [maria@email.com   ]            │
│                                 │
│ Job Address                     │
│ [🔍 Search address...]          │
│                                 │
│           [Next Step →]         │
│                                 │
└─────────────────────────────────┘
```

**Step 2: Add Items**
```
┌─────────────────────────────────┐
│ [←] New Quote              [✕]  │
├─────────────────────────────────┤
│                                 │
│ Line Items                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                 │
│ Item #1                         │
│ ┌───────────────────────────┐   │
│ │ Item Name *               │   │
│ │ [Kitchen Floor         ]  │   │
│ │                           │   │
│ │ Area *                    │   │
│ │ [250.5] sq ft             │   │
│ │ or [L: 20] × [W: 12.5] ft │   │
│ │                           │   │
│ │ Price per sq ft *         │   │
│ │ [$5.50]                   │   │
│ │                           │   │
│ │ Line Total: $1,377.75     │   │
│ │                           │   │
│ │ [+ Add Add-ons]           │   │
│ └───────────────────────────┘   │
│                                 │
│ [+ Add Another Item]            │
│                                 │
│ Total: $1,377.75                │
│                                 │
│           [Next Step →]         │
│                                 │
└─────────────────────────────────┘
```

**Add-ons Modal:**
```
┌─────────────────────────────────┐
│ [←] Add Add-ons            [✕]  │
├─────────────────────────────────┤
│                                 │
│ Select Add-on Type              │
│                                 │
│ [Floor Type          ▼]         │
│   └─ Vinyl           ▼          │
│       └─ Plank       ▼          │
│           ├─ 122x18cm           │
│           └─ 152x22cm           │
│                                 │
│ Price: [$150.00]                │
│                                 │
│ [+ Add to Item]                 │
│                                 │
│ ───────────────────────────     │
│                                 │
│ Current Add-ons:                │
│ • Vinyl-Plank 122x18 ($150) [✕]│
│                                 │
│ Subtotal: $150.00               │
│                                 │
│           [Done]                │
│                                 │
└─────────────────────────────────┘
```

---

#### **10.2.4 Send Quote Screen**

**Email Preview:**
```
┌─────────────────────────────────┐
│ [←] Send via Email         [✕]  │
├─────────────────────────────────┤
│                                 │
│ Language                        │
│ [🇺🇸 English ▼]                 │
│                                 │
│ To:                             │
│ [maria@email.com   ]            │
│                                 │
│ Subject:                        │
│ [Quote #QT-20251103-0001    ]   │
│                                 │
│ Message:                        │
│ ┌───────────────────────────┐   │
│ │ Hello Maria,              │   │
│ │                           │   │
│ │ Thank you for your        │   │
│ │ interest! Please find     │   │
│ │ attached your quote...    │   │
│ │                           │   │
│ │ [Edit message]            │   │
│ └───────────────────────────┘   │
│                                 │
│ Attachment:                     │
│ 📄 Quote-QT-20251103-0001.pdf   │
│                                 │
│     [Send Email 📧]             │
│                                 │
└─────────────────────────────────┘
```

**WhatsApp Link:**
```
┌─────────────────────────────────┐
│ [←] Send via WhatsApp      [✕]  │
├─────────────────────────────────┤
│                                 │
│ Language                        │
│ [🇪🇸 Español ▼]                 │
│                                 │
│ Customer Phone:                 │
│ [+1 ▼] [(555) 123-4567]        │
│                                 │
│ Message Preview:                │
│ ┌───────────────────────────┐   │
│ │ ¡Hola Maria!              │   │
│ │                           │   │
│ │ Aquí está tu presupuesto  │   │
│ │ #QT-20251103-0001         │   │
│ │                           │   │
│ │ Total: $1,727.75          │   │
│ │                           │   │
│ │ 📄 Descargar PDF          │   │
│ │ [short.link/abc123]       │   │
│ └───────────────────────────┘   │
│                                 │
│   [Open WhatsApp 💬]            │
│                                 │
│ ℹ️ This will open WhatsApp     │
│    with the message ready.      │
│    You can edit before sending. │
│                                 │
└─────────────────────────────────┘
```

---

### 10.3 Color Palette

**Primary Colors:**
- Primary Blue: `#3B82F6` (buttons, links)
- Success Green: `#10B981` (success states)
- Warning Yellow: `#F59E0B` (pending states)
- Error Red: `#EF4444` (errors, destructive actions)

**Status Colors:**
- CREATED: `#3B82F6` (blue)
- SENT: `#10B981` (green)
- ACCEPTED: `#F59E0B` (yellow)
- IN PROGRESS: `#8B5CF6` (purple)
- COMPLETED: `#059669` (dark green)
- REJECTED: `#DC2626` (red)

**Neutral Colors:**
- Background: `#FFFFFF` / `#F9FAFB`
- Text Primary: `#111827`
- Text Secondary: `#6B7280`
- Border: `#E5E7EB`

---

### 10.4 Typography

**Font Family:** 
- Primary: `Inter` (Google Fonts)
- Fallback: `system-ui, -apple-system, sans-serif`

**Font Sizes:**
- Heading 1: `32px / 2rem` (bold)
- Heading 2: `24px / 1.5rem` (bold)
- Heading 3: `20px / 1.25rem` (semibold)
- Body: `16px / 1rem` (regular)
- Small: `14px / 0.875rem` (regular)
- Tiny: `12px / 0.75rem` (regular)

**Line Heights:**
- Headings: `1.2`
- Body: `1.5`

---

## 11. INTEGRATIONS & THIRD-PARTY SERVICES

### 11.1 Supabase Configuration

#### **11.1.1 Setup Steps**

**1. Create Supabase Project**
```bash
# Via Supabase Dashboard (https://app.supabase.com)
1. Create new project
2. Name: "easequote-ai-production"
3. Database Password: [Strong password]
4. Region: US East (closest to target users)
5. Pricing Plan: Pro ($25/month)
```

**2. Environment Variables**
```bash
# Frontend (.env)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_API_URL=https://api.easequote.ai

# Backend (.env)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc... # Service role key (backend only)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

**3. Enable Auth Providers**
```sql
-- In Supabase Dashboard > Authentication > Providers

-- Email Auth: Enable email/password authentication
-- Google OAuth: 
--   Client ID: [From Google Cloud Console]
--   Client Secret: [From Google Cloud Console]
--   Redirect URL: https://xxxxx.supabase.co/auth/v1/callback
```

**4. Storage Buckets**
```sql
-- Create storage buckets via Supabase Dashboard > Storage

-- avatars bucket (public)
CREATE BUCKET avatars WITH public = true;

-- logos bucket (public)
CREATE BUCKET logos WITH public = true;

-- pdfs bucket (private with signed URLs)
CREATE BUCKET pdfs WITH public = false;

-- RLS Policies for storage
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own logo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "PDFs accessible by owner only"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'pdfs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**5. Configure Email Templates**
```html
<!-- Supabase Dashboard > Authentication > Email Templates -->

<!-- Confirmation Email (EN) -->
<h2>Welcome to EaseQuote AI!</h2>
<p>Please confirm your email address by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>

<!-- Password Reset Email (EN) -->
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>This link expires in 1 hour.</p>
```

---

### 11.2 Google Gemini 2.5 Flash Integration

#### **11.2.1 Setup**

**1. Enable Gemini API**
```bash
# Get API key from https://aistudio.google.com/apikey
# Add to Supabase Edge Function secrets:
GEMINI_API_KEY=AIzaSyC...
```

**2. Supabase Edge Function Implementation (Deno/TypeScript)**
```typescript
// supabase/functions/translate-quote/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!

interface TranslationRequest {
  quote_id: string
  language: 'en' | 'es' | 'pt'
}

serve(async (req) => {
  try {
    const { quote_id, language }: TranslationRequest = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Fetch quote data
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        *,
        quote_items (*)
      `)
      .eq('id', quote_id)
      .single()
    
    if (quoteError) throw quoteError
    
    // Format content for translation
    const items = quote.quote_items || []
    const itemNames = items.map((item: any) => `- ${item.item_name}`).join('\n')
    const addons = items.flatMap((item: any) => 
      (item.addons || []).map((addon: any) => `- ${addon.name}`)
    ).join('\n')
    
    const languageNames = {
      'en': 'English',
      'es': 'Spanish',
      'pt': 'Portuguese'
    }
    
    const prompt = `
You are a professional translator specializing in construction/flooring industry terminology.

Translate the following quote content from English to ${languageNames[language]}.

RULES:
1. Preserve all numbers, prices, and measurements exactly as shown
2. Keep proper nouns (names, addresses) unchanged
3. Translate technical terms accurately (e.g., "vinyl plank", "waterproofing")
4. Maintain professional business tone
5. Return ONLY the translated text, no explanations

ORIGINAL CONTENT:
---
Item Names:
${itemNames}

Notes:
${quote.notes || 'N/A'}

Add-ons:
${addons || 'None'}
---

Translate to ${languageNames[language]}:
`
    
    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2000,
          }
        })
      }
    )
    
    if (!geminiResponse.ok) {
      throw new Error('Gemini API error')
    }
    
    const geminiData = await geminiResponse.json()
    const translatedText = geminiData.candidates[0].content.parts[0].text
    
    return new Response(
      JSON.stringify({
        translated: true,
        language,
        translated_content: translatedText,
        quote_data: quote
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

**3. Cost Optimization (Translation Cache Table)**
```sql
-- Create translation cache table
CREATE TABLE translation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_text TEXT NOT NULL,
  target_language VARCHAR(2) NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(source_text, target_language)
);

CREATE INDEX idx_translation_cache_lookup 
ON translation_cache(source_text, target_language);
```

```typescript
// Check cache before calling Gemini
const cacheKey = `${quote_id}:${language}`
const { data: cached } = await supabase
  .from('translation_cache')
  .select('translated_text')
  .eq('source_text', JSON.stringify(quote))
  .eq('target_language', language)
  .single()

if (cached) {
  return new Response(JSON.stringify({
    translated: true,
    language,
    translated_content: cached.translated_text,
    cached: true
  }))
}

// After translation, save to cache
await supabase.from('translation_cache').insert({
  source_text: JSON.stringify(quote),
  target_language: language,
  translated_text: translatedText
})
```

**4. Error Handling**
```typescript
try {
  // Translation logic
} catch (error) {
  console.error('Translation failed:', error)
  
  // Fallback: Return original content
  return new Response(
    JSON.stringify({
      translated: false,
      language,
      error: 'Translation unavailable, showing English version',
      quote_data: quote
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
```

---

### 11.3 Google Maps Geocoding API

#### **11.3.1 Setup**

**1. Enable API**
```bash
# Google Cloud Console > APIs & Services > Library
# Enable: "Geocoding API"

GOOGLE_MAPS_API_KEY=AIzaSyD...
```

**2. Frontend Implementation (React)**
```typescript
// frontend/src/hooks/useGoogleMaps.ts
import { useEffect, useState } from 'react';
import { fromAddress } from 'react-geocode';

// Configure react-geocode
import { setKey, setLanguage } from 'react-geocode';
setKey(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
setLanguage('en');

interface GeocodedAddress {
  formatted_address: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export const useAddressAutocomplete = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodedAddress[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 3) {
        setLoading(true);
        try {
          const response = await fromAddress(query);
          const results = response.results.map((result: any) => ({
            formatted_address: result.formatted_address,
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
            city: extractComponent(result, 'locality'),
            state: extractComponent(result, 'administrative_area_level_1'),
            zip: extractComponent(result, 'postal_code'),
            country: extractComponent(result, 'country')
          }));
          setSuggestions(results);
        } catch (error) {
          console.error('Geocoding error:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return { query, setQuery, suggestions, loading };
};

// Helper to extract address components
function extractComponent(result: any, type: string): string {
  const component = result.address_components.find(
    (comp: any) => comp.types.includes(type)
  );
  return component?.long_name || '';
}
```

**3. Address Input Component**
```tsx
// frontend/src/components/AddressAutocomplete.tsx
import React from 'react';
import { useAddressAutocomplete } from '@/hooks/useGoogleMaps';

interface AddressAutocompleteProps {
  onSelect: (address: GeocodedAddress) => void;
  value?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onSelect,
  value = ''
}) => {
  const { query, setQuery, suggestions, loading } = useAddressAutocomplete();

  return (
    <div className="relative">
      <input
        type="text"
        value={query || value}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter job address..."
        className="w-full px-4 py-2 border rounded-lg"
      />
      
      {loading && (
        <div className="absolute right-3 top-3">
          <Spinner size="sm" />
        </div>
      )}
      
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((addr, idx) => (
            <li
              key={idx}
              onClick={() => {
                onSelect(addr);
                setQuery(addr.formatted_address);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <div className="font-medium">{addr.formatted_address}</div>
              <div className="text-sm text-gray-500">
                {addr.city}, {addr.state} {addr.zip}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

**4. Alternative: Google Places Autocomplete Widget**
```tsx
// Using official @vis.gl/react-google-maps library
import { APIProvider, Map, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useRef } from 'react';

export const GooglePlacesAutocomplete = ({ onPlaceSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const placesLib = useMapsLibrary('places');
  
  useEffect(() => {
    if (!placesLib || !inputRef.current) return;
    
    const autocomplete = new placesLib.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'us' }
    });
    
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        onPlaceSelect({
          address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
      }
    });
  }, [placesLib, onPlaceSelect]);
  
  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Search address..."
      className="w-full px-4 py-2 border rounded-lg"
    />
  );
};

// Wrap in APIProvider
<APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
  <GooglePlacesAutocomplete onPlaceSelect={handleSelect} />
</APIProvider>
```

**5. Cost Optimization**
```typescript
// Limit requests with rate limiting
import { throttle } from 'lodash';

const throttledGeocode = throttle(
  async (query: string) => {
    return await fromAddress(query);
  },
  1000, // Max 1 request per second
  { leading: true, trailing: false }
);
```

---

### 11.4 Email Service Integration

#### **11.4.1 Recommended: Resend (Modern, Developer-Friendly)**

**Why Resend?**
- ✅ Modern API design
- ✅ Generous free tier (100 emails/day)
- ✅ Excellent deliverability
- ✅ React email templates support
- ✅ Simple pricing ($20/month for 50K emails)

**Setup:**
```bash
# Add to Supabase Edge Function secrets:
RESEND_API_KEY=re_xxxxxxxxxxxx
```

**Implementation (Supabase Edge Function):**
```typescript
// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

interface EmailRequest {
  quote_id: string
  recipient_email: string
  subject?: string
  body?: string
  language: 'en' | 'es' | 'pt'
}

serve(async (req) => {
  try {
    const { quote_id, recipient_email, subject, body, language }: EmailRequest = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Fetch quote data
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*, quote_items (*)')
      .eq('id', quote_id)
      .single()
    
    if (quoteError) throw quoteError
    
    // Generate PDF (call generate-pdf function or use existing PDF)
    const pdfResponse = await fetch(`${supabaseUrl}/functions/v1/generate-pdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quote_id, language })
    })
    
    const { pdf_url } = await pdfResponse.json()
    
    // Download PDF from Storage
    const pdfPath = pdf_url.split('/storage/v1/object/public/pdfs/')[1]
    const { data: pdfData, error: pdfError } = await supabase.storage
      .from('pdfs')
      .download(pdfPath)
    
    if (pdfError) throw pdfError
    
    const pdfArrayBuffer = await pdfData.arrayBuffer()
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfArrayBuffer)))
    
    // Email templates by language
    const templates = {
      'en': {
        subject: `Quote #${quote.quote_number} from EaseQuote AI`,
        body: `
          <h2>Hello ${quote.customer_name},</h2>
          <p>Thank you for your interest! Please find attached your quote.</p>
          <p>If you have any questions, feel free to reach out.</p>
          <p>Best regards,<br>EaseQuote AI Team</p>
        `
      },
      'es': {
        subject: `Presupuesto #${quote.quote_number} de EaseQuote AI`,
        body: `
          <h2>Hola ${quote.customer_name},</h2>
          <p>¡Gracias por tu interés! Adjunto encontrarás tu presupuesto.</p>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          <p>Saludos cordiales,<br>Equipo de EaseQuote AI</p>
        `
      },
      'pt': {
        subject: `Orçamento #${quote.quote_number} de EaseQuote AI`,
        body: `
          <h2>Olá ${quote.customer_name},</h2>
          <p>Obrigado pelo seu interesse! Segue em anexo seu orçamento.</p>
          <p>Se tiver alguma dúvida, sinta-se à vontade para entrar em contato.</p>
          <p>Atenciosamente,<br>Equipe EaseQuote AI</p>
        `
      }
    }
    
    const template = templates[language] || templates['en']
    
    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'EaseQuote AI <quotes@easequote.ai>',
        to: recipient_email,
        subject: subject || template.subject,
        html: body || template.body,
        attachments: [{
          filename: `Quote-${quote.quote_number}.pdf`,
          content: pdfBase64
        }]
      })
    })
    
    if (!resendResponse.ok) {
      throw new Error('Resend API error')
    }
    
    const emailResult = await resendResponse.json()
    
    // Log email in database
    await supabase.from('quote_emails').insert({
      quote_id,
      recipient_email,
      subject: subject || template.subject,
      body: body || template.body,
      language,
      status: 'sent',
      sent_at: new Date().toISOString()
    })
    
    return new Response(
      JSON.stringify({
        success: true,
        email_id: emailResult.id,
        message: 'Email sent successfully'
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

---

### 11.5 WhatsApp Integration

#### **11.5.1 MVP Approach: WhatsApp Web Link (Recommended)**

**Advantages:**
- ✅ No approval process
- ✅ No monthly fees
- ✅ Works immediately
- ✅ User controls message sending
- ✅ Simple implementation

**Implementation (Supabase Edge Function):**
```typescript
// supabase/functions/whatsapp-link/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface WhatsAppRequest {
  quote_id: string
  phone: string
  language: 'en' | 'es' | 'pt'
}

serve(async (req) => {
  try {
    const { quote_id, phone, language }: WhatsAppRequest = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Fetch quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quote_id)
      .single()
    
    if (quoteError) throw quoteError
    
    // Generate temporary PDF link (24-hour expiry)
    const { data: pdfData } = await supabase.storage
      .from('pdfs')
      .createSignedUrl(`${quote_id}/quote.pdf`, 86400) // 24 hours
    
    const pdf_url = pdfData?.signedUrl
    
    // Format message by language
    const messages = {
      'en': `Hello ${quote.customer_name}!

Here's your quote #${quote.quote_number} for your flooring project.

💵 Total: $${quote.total_amount.toFixed(2)}

Let me know if you have any questions!`,
      
      'es': `¡Hola ${quote.customer_name}!

Aquí está tu presupuesto #${quote.quote_number} para tu proyecto de pisos.

💵 Total: $${quote.total_amount.toFixed(2)}

¡Déjame saber si tienes alguna pregunta!`,
      
      'pt': `Olá ${quote.customer_name}!

Aqui está seu orçamento #${quote.quote_number} para seu projeto de piso.

💵 Total: $${quote.total_amount.toFixed(2)}

Me avise se tiver alguma dúvida!`
    }
    
    const message = messages[language] || messages['en']
    const fullMessage = pdf_url ? `${message}\n\n📄 Download Quote: ${pdf_url}` : message
    
    // Clean phone number (E.164 format)
    const cleanPhone = phone.replace(/\D/g, '').replace(/^/, '+')
    
    // URL encode message
    const encodedMessage = encodeURIComponent(fullMessage)
    
    // Generate WhatsApp link
    const whatsapp_url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`
    
    return new Response(
      JSON.stringify({
        whatsapp_url,
        pdf_url,
        expires_at: new Date(Date.now() + 86400000).toISOString() // 24 hours
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

**Frontend Implementation:**
```tsx
// frontend/src/components/SendViaWhatsApp.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';

export const SendViaWhatsApp = ({ quoteId, customerPhone }) => {
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  
  const handleSendWhatsApp = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-link', {
        body: { quote_id: quoteId, phone: customerPhone, language }
      });
      
      if (error) throw error;
      
      // Open WhatsApp in new window
      window.open(data.whatsapp_url, '_blank');
      
      // Show success toast
      toast.success('WhatsApp opened! Complete sending the message.');
      
    } catch (error) {
      toast.error('Failed to generate WhatsApp link');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="en">🇺🇸 English</option>
        <option value="es">🇪🇸 Español</option>
        <option value="pt">🇧🇷 Português</option>
      </select>
      
      <Button onClick={handleSendWhatsApp} disabled={loading}>
        {loading ? 'Generating...' : 'Open WhatsApp 💬'}
      </Button>
      
      <p className="text-sm text-gray-500">
        This will open WhatsApp with the message ready. You can edit before sending.
      </p>
    </div>
  );
};
```

#### **11.5.2 Future: WhatsApp Business Cloud API**

**For Pro Plan (Future Enhancement - Edge Function):**

```typescript
// supabase/functions/whatsapp-send/index.ts
// Requires Meta Business Account verification

const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')!
const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN')!

async function sendTemplateMessage(
  to_phone: string,
  template_name: string,
  template_params: any[]
) {
  const url = `https://graph.facebook.com/v23.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to_phone,
      type: 'template',
      template: {
        name: template_name,
        language: { code: 'en' },
        components: [{
          type: 'body',
          parameters: template_params
        }]
      }
    })
  })
  
  return await response.json()
}
```

---

## 12. SECURITY & COMPLIANCE

### 12.1 Authentication & Authorization

**12.1.1 Password Security**
```python
# Handled by Supabase Auth
- Bcrypt hashing (10+ rounds)
- Salted passwords
- Secure password reset flow
- Session management via JWT
```

**12.1.2 JWT Configuration**
```typescript
// Supabase automatically handles JWT
// Token structure:
{
  "aud": "authenticated",
  "exp": 1730736000,
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated"
}

// Token refresh before expiry
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    // Update local session
  }
})
```

**12.1.3 Row Level Security (RLS)**
```sql
-- All tables have RLS enabled
-- Users can only access their own data

-- Example: Quotes table
CREATE POLICY "Users can only see own quotes"
  ON quotes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only create quotes for themselves"
  ON quotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 12.2 Data Protection

**12.2.1 Encryption**
- ✅ HTTPS/TLS 1.3 for all connections
- ✅ Database encryption at rest (Supabase default)
- ✅ Sensitive data in environment variables
- ✅ API keys never exposed in frontend

**12.2.2 Input Validation**
```typescript
// Frontend: Zod validation
import { z } from 'zod'

const CreateQuoteSchema = z.object({
  customer_name: z.string().min(2).max(100),
  customer_email: z.string().email().optional(),
  customer_phone: z.string().optional(),
  total_amount: z.number().min(0).max(1000000)
})

// Database: Constraints
ALTER TABLE quotes 
ADD CONSTRAINT positive_amounts CHECK (total_amount >= 0 AND total_amount <= 1000000);

ALTER TABLE quotes
ADD CONSTRAINT customer_name_length CHECK (char_length(customer_name) >= 2 AND char_length(customer_name) <= 100);
```

**12.2.3 SQL Injection Prevention**
```typescript
// Supabase uses parameterized queries automatically
const { data } = await supabase
  .from('quotes')
  .select('*')
  .eq('user_id', userId) // Safe - parameterized
  .ilike('customer_name', `%${search}%`) // Safe - escaped
```

**12.2.4 XSS Prevention**
```typescript
// React automatically escapes JSX
// DOMPurify for user-generated HTML
import DOMPurify from 'dompurify';

const SafeHTML = ({ html }: { html: string }) => {
  const clean = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
};
```

### 12.3 Rate Limiting

**Supabase Built-in Rate Limiting:**
- PostgREST API: Rate limits configured in Supabase Dashboard
- Edge Functions: Rate limiting via Supabase platform
- Auth: Built-in rate limiting (5 failed attempts = 15min lockout)

**Custom Rate Limiting (Edge Functions):**
```typescript
// Track rate limits in database
CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  count INT DEFAULT 1,
  reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 minute'
);

// In Edge Function:
const rateLimitKey = `user:${userId}:${action}`
const { data: limit } = await supabase
  .from('rate_limits')
  .select('*')
  .eq('key', rateLimitKey)
  .single()

if (limit && limit.count >= MAX_REQUESTS && limit.reset_at > new Date()) {
  return new Response(
    JSON.stringify({ error: 'Rate limit exceeded' }),
    { status: 429 }
  )
}
```

### 12.4 File Upload Security

**Supabase Storage Policies:**
```sql
-- File size limit (2MB)
CREATE POLICY "File size limit"
ON storage.objects FOR INSERT
WITH CHECK (
  (bucket_id = 'avatars' OR bucket_id = 'logos')
  AND octet_length(metadata->>'size')::int <= 2097152
);

-- File type validation
CREATE POLICY "Allowed file types"
ON storage.objects FOR INSERT
WITH CHECK (
  (bucket_id = 'avatars' OR bucket_id = 'logos')
  AND (storage.extension(name) IN ('jpg', 'jpeg', 'png'))
);
```

**Frontend Validation:**
```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Invalid file type. Only JPG/PNG allowed.'
  }
  if (file.size > MAX_SIZE) {
    return 'File too large. Maximum 2MB.'
  }
  return null
}
```

### 12.5 API Security Headers

**Vercel Configuration (vercel.json):**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000"
        }
      ]
    }
  ]
}
```

**Supabase CORS:**
- Configured in Supabase Dashboard > Settings > API
- Allow only production domain: `https://easequote.ai`

### 12.6 Compliance

**GDPR/LGPD Considerations:**
- ✅ User data stored in EU/US regions (Supabase)
- ✅ Data retention: 12 months for deleted quotes
- ✅ User can export all data (future feature)
- ✅ User can request account deletion
- ✅ Privacy policy and terms of service
- ❌ Not storing sensitive financial data (no credit cards)
- ❌ Not subject to PCI-DSS

**Data Deletion:**
```sql
-- Soft delete quotes (12-month retention)
UPDATE quotes SET deleted_at = NOW() WHERE id = 'xxx';

-- Hard delete after 12 months (scheduled job)
DELETE FROM quotes WHERE deleted_at < NOW() - INTERVAL '12 months';

-- Delete user account (cascade deletes all data)
DELETE FROM auth.users WHERE id = 'xxx';
```

---

## 13. TESTING STRATEGY

### 13.1 Unit Testing

**Frontend (Vitest + React Testing Library):**
```typescript
// frontend/tests/components/QuoteForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuoteForm } from '@/components/QuoteForm';

describe('QuoteForm', () => {
  it('validates required fields', async () => {
    render(<QuoteForm />);
    
    const submitBtn = screen.getByText('Save Quote');
    fireEvent.click(submitBtn);
    
    expect(await screen.findByText('Customer name is required')).toBeInTheDocument();
  });
  
  it('calculates line total correctly', () => {
    render(<QuoteForm />);
    
    const areaInput = screen.getByLabelText('Area (sq ft)');
    const priceInput = screen.getByLabelText('Price per sq ft');
    
    fireEvent.change(areaInput, { target: { value: '250' } });
    fireEvent.change(priceInput, { target: { value: '5.50' } });
    
    const totalDisplay = screen.getByTestId('line-total');
    expect(totalDisplay).toHaveTextContent('$1,375.00');
  });
});
```

**Edge Functions Testing (Deno):**
```typescript
// supabase/functions/generate-pdf/index_test.ts
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts"
import { serve } from "./index.ts"

Deno.test("generate-pdf function", async () => {
  const request = new Request("http://localhost:8000", {
    method: "POST",
    body: JSON.stringify({
      quote_id: "test-uuid",
      language: "es"
    })
  })
  
  const response = await serve(request)
  const data = await response.json()
  
  assertEquals(response.status, 200)
  assertEquals(data.language, "es")
})
```

### 13.2 Integration Testing

**PostgREST API Testing:**
```typescript
// Test PostgREST endpoints
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

test('create quote via PostgREST', async () => {
  const { data, error } = await supabase
    .from('quotes')
    .insert({
      customer_name: 'Test Customer',
      total_amount: 1000.00,
      subtotal: 1000.00
    })
    .select()
    .single()
  
  expect(error).toBeNull()
  expect(data.quote_number).toMatch(/^QT-\d{8}-\d{4}$/)
})

test('unauthorized access blocked by RLS', async () => {
  const { data, error } = await supabase
    .from('quotes')
    .select()
  
  // RLS should block access without auth
  expect(error).not.toBeNull()
})
```

### 13.3 End-to-End Testing (Playwright)

```typescript
// e2e/tests/quote-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Quote Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });
  
  test('should create and send quote successfully', async ({ page }) => {
    // Click Create Quote
    await page.click('text=Create Quote');
    
    // Fill customer info
    await page.fill('[name="customer_name"]', 'Maria Garcia');
    await page.fill('[name="customer_email"]', 'maria@test.com');
    
    // Add line item
    await page.click('text=Add Item');
    await page.fill('[name="item_name"]', 'Kitchen Floor');
    await page.fill('[name="area"]', '250');
    await page.fill('[name="price_per_sqft"]', '5.50');
    
    // Save quote
    await page.click('text=Save Quote');
    
    // Verify success
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Maria Garcia')).toBeVisible();
    
    // Send via email
    await page.click('[data-testid="quote-actions"]');
    await page.click('text=Send via Email');
    await page.click('text=Send Email');
    
    await expect(page.locator('text=Email sent successfully')).toBeVisible();
  });
});
```

### 13.4 Performance Testing

```bash
# Load testing with Locust
# locustfile.py
from locust import HttpUser, task, between

class QuoteUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        # Login
        response = self.client.post("/api/auth/login", json={
            "email": "loadtest@example.com",
            "password": "testpass123"
        })
        self.token = response.json()['access_token']
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    @task(3)
    def list_quotes(self):
        self.client.get("/api/quotes", headers=self.headers)
    
    @task(1)
    def create_quote(self):
        self.client.post("/api/quotes", json={
            "customer_name": "Load Test Customer",
            "total_amount": 1000.00,
            "items": [...]
        }, headers=self.headers)

# Run: locust -f locustfile.py --host=https://api.easequote.ai
```

### 13.5 Test Coverage Goals

- **Unit Tests**: >80% code coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user flows (auth, quote CRUD, PDF generation)
- **Performance Tests**: 95th percentile response time <500ms under load

---

## 14. DEPLOYMENT PLAN

### 14.1 Infrastructure Overview

```yaml
# Architecture Stack
Frontend: Vercel (or Netlify)
Backend: Supabase (All-in-one)
  - Database: PostgreSQL 15 (managed)
  - API: PostgREST (auto-generated)
  - Auth: Supabase Auth
  - Storage: Supabase Storage
  - Functions: Supabase Edge Functions (Deno)
CDN: Cloudflare (DNS + CDN)
Monitoring: Sentry (errors) + Uptime Robot
CI/CD: GitHub Actions
```

### 14.2 Environment Setup

#### **14.2.1 Development Environment**
```bash
# Frontend (.env)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
VITE_ENV=development

# Supabase Edge Functions (via Supabase Dashboard > Edge Functions > Secrets)
GEMINI_API_KEY=AIzaSy...
RESEND_API_KEY=re_xxx...
```

#### **14.2.2 Staging Environment**
```bash
# Frontend (.env)
VITE_SUPABASE_URL=https://xxxxx-staging.supabase.co
VITE_ENV=staging

# Supabase Edge Functions Secrets (staging project)
GEMINI_API_KEY=AIzaSy...
RESEND_API_KEY=re_xxx...
```

#### **14.2.3 Production Environment**
```bash
# Frontend (.env)
VITE_SUPABASE_URL=https://xxxxx-prod.supabase.co
VITE_ENV=production
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx

# Supabase Edge Functions Secrets (production project)
GEMINI_API_KEY=AIzaSy...
RESEND_API_KEY=re_xxx...
```

---

### 14.3 Deployment Steps

#### **14.3.1 Frontend Deployment (Vercel)**

**Setup:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
cd frontend
vercel link

# Configure environment variables in Vercel Dashboard
# Settings > Environment Variables

# Deploy to staging
vercel --prod=false

# Deploy to production
vercel --prod
```

**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

**GitHub Actions - Frontend CI/CD:**
```yaml
# .github/workflows/frontend-deploy.yml
name: Deploy Frontend

on:
  push:
    branches:
      - main
      - staging
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Run tests
        working-directory: ./frontend
        run: npm run test
      
      - name: Build
        working-directory: ./frontend
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
          vercel-args: '--prod'
```

---

#### **14.3.2 Supabase Edge Functions Deployment**

**Setup:**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy Edge Functions
supabase functions deploy generate-pdf
supabase functions deploy send-email
supabase functions deploy whatsapp-link
supabase functions deploy translate-quote
```

**Set Edge Function Secrets:**
```bash
# Via Supabase Dashboard or CLI
supabase secrets set GEMINI_API_KEY=AIzaSy...
supabase secrets set RESEND_API_KEY=re_xxx...
```

**GitHub Actions - Edge Functions CI/CD:**
```yaml
# .github/workflows/edge-functions-deploy.yml
name: Deploy Edge Functions

on:
  push:
    branches:
      - main
      - staging
    paths:
      - 'supabase/functions/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - name: Deploy Edge Functions
        run: |
          supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
          supabase functions deploy generate-pdf
          supabase functions deploy send-email
          supabase functions deploy whatsapp-link
          supabase functions deploy translate-quote
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

---

#### **14.3.3 Database Migrations

**Supabase Migrations:**
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize project
supabase init

# Create migration
supabase migration new create_initial_schema

# Edit migration file
# supabase/migrations/YYYYMMDDHHMMSS_create_initial_schema.sql

# Apply migrations locally
supabase db reset

# Push to production
supabase db push
```

**Migration Example:**
```sql
-- supabase/migrations/20251103000001_create_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  company_logo_url TEXT,
  language VARCHAR(2) DEFAULT 'en' CHECK (language IN ('en', 'es', 'pt')),
  subscription_plan VARCHAR(20) DEFAULT 'basic',
  monthly_quote_limit INT DEFAULT 30,
  quotes_used_this_month INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- ... (continue with all other tables)
```

---

### 14.4 DNS & Domain Configuration

**Cloudflare Setup:**
```bash
# Domain: easequote.ai (purchased from Namecheap/GoDaddy)

# Add to Cloudflare
1. Add site to Cloudflare
2. Update nameservers at registrar
3. Configure DNS records:

# DNS Records
Type    Name              Content                           Proxy
A       easequote.ai      76.76.21.21 (Vercel IP)          ✓ Proxied
CNAME   www               easequote.ai                      ✓ Proxied
TXT     @                 "v=spf1 include:_spf.google.com ~all"
TXT     _dmarc            "v=DMARC1; p=none; rua=mailto:dmarc@easequote.ai"

# Note: Supabase Edge Functions are accessed via:
# https://[project-ref].supabase.co/functions/v1/[function-name]
# No custom domain needed for Edge Functions

# SSL/TLS: Full (strict) mode
# Always Use HTTPS: On
# Automatic HTTPS Rewrites: On
```

---

### 14.5 Monitoring & Logging

#### **14.5.1 Sentry Setup (Error Tracking)**

**Frontend:**
```typescript
// frontend/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENV,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Wrap App with Sentry ErrorBoundary
const App = () => (
  <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
    <RouterProvider router={router} />
  </Sentry.ErrorBoundary>
);
```

**Edge Functions:**
```typescript
// supabase/functions/generate-pdf/index.ts
import * as Sentry from "https://deno.land/x/sentry@7.77.0/index.ts"

Sentry.init({
  dsn: Deno.env.get("SENTRY_DSN"),
  environment: Deno.env.get("ENVIRONMENT"),
  tracesSampleRate: 0.1,
})

serve(async (req) => {
  try {
    // ... function logic
  } catch (error) {
    Sentry.captureException(error)
    throw error
  }
})
```

#### **14.5.2 Uptime Monitoring (Uptime Robot)**

```yaml
# Configure monitors at uptimerobot.com (Free tier: 50 monitors)

Monitors:
  - Name: EaseQuote Frontend
    URL: https://easequote.ai
    Type: HTTP(s)
    Interval: 5 minutes
    Alert: Email + Slack
  
  - Name: EaseQuote API Health
    URL: https://api.easequote.ai/health
    Type: HTTP(s)
    Interval: 5 minutes
    Expected: 200 OK
  
  - Name: Database Connection
    URL: https://api.easequote.ai/health/db
    Type: HTTP(s)
    Interval: 10 minutes
```

#### **14.5.3 Application Logging**

**Edge Functions Logging:**
```typescript
// Supabase Edge Functions have built-in logging
// View logs via Supabase Dashboard or CLI

// In Edge Function:
console.log('Quote created', {
  quote_id,
  user_id,
  amount: total_amount
})

// View logs:
// supabase functions logs generate-pdf
// Or via Dashboard: Edge Functions > [function-name] > Logs
```

#### **14.5.4 Performance Monitoring**

**Supabase Dashboard:**
- Built-in performance monitoring for Edge Functions
- View execution time, memory usage, and error rates
- Set up alerts for slow functions (>10s execution)

**Custom Monitoring:**
```typescript
// In Edge Function, add timing:
const startTime = Date.now()

// ... function logic ...

const duration = Date.now() - startTime
console.log(`Function executed in ${duration}ms`)

// Log slow functions
if (duration > 10000) {
  console.warn(`Slow function: ${duration}ms`)
}
```

---

### 14.6 Backup & Disaster Recovery

#### **14.6.1 Database Backups**

**Supabase Automatic Backups:**
- Daily backups (retained 7 days) - Free/Pro tier
- Point-in-time recovery (PITR) - Pro tier
- Manual backups via dashboard

**Additional Backup Script:**
```bash
#!/bin/bash
# scripts/backup-database.sh

# Backup Supabase database
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="easequote_backup_${TIMESTAMP}.sql"

# Export database
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Upload to S3 (or cloud storage)
aws s3 cp ${BACKUP_FILE}.gz s3://easequote-backups/

# Keep only last 30 days
find . -name "easequote_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

**Cron Job (GitHub Actions):**
```yaml
# .github/workflows/backup.yml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM UTC

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install PostgreSQL client
        run: sudo apt-get install -y postgresql-client
      
      - name: Run backup script
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: bash scripts/backup-database.sh
```

#### **14.6.2 Disaster Recovery Plan**

**RPO (Recovery Point Objective):** 24 hours  
**RTO (Recovery Time Objective):** 4 hours

**Recovery Steps:**
1. **Database Recovery:**
   ```bash
   # Restore from latest backup
   gunzip easequote_backup_YYYYMMDD.sql.gz
   psql $DATABASE_URL < easequote_backup_YYYYMMDD.sql
   ```

2. **Application Recovery:**
   ```bash
   # Redeploy from last known good commit
   git checkout <commit-hash>
   supabase functions deploy [function-name]  # Edge Functions
   vercel --prod  # Frontend
   ```

3. **DNS Failover:**
   - Update Cloudflare DNS to standby server
   - TTL: 5 minutes (fast propagation)

---

### 14.7 Rollback Strategy

**Frontend Rollback (Vercel):**
```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback <deployment-url>

# OR via Vercel Dashboard:
# Deployments > Select previous > Promote to Production
```

**Edge Functions Rollback:**
```bash
# Deploy previous version
supabase functions deploy generate-pdf --version [previous-version]

# Or redeploy from git commit
git checkout [previous-commit]
supabase functions deploy generate-pdf
```

**Database Rollback:**
```bash
# Rollback last migration
supabase db reset --version <previous-version>

# OR restore from backup (see Disaster Recovery)
```

---

## 15. TIMELINE & MILESTONES

### 15.1 Development Phases

#### **Phase 0: Pre-Development (Weeks 1-2)**
**Duration:** 2 weeks  
**Team:** 1 Product Manager + 1 Tech Lead

- [x] PRD finalization and approval
- [x] Technical architecture review
- [ ] Design mockups (Figma)
- [ ] Setup repositories (GitHub)
- [ ] Setup development environments
- [ ] Create Supabase projects (dev/staging/prod)
- [ ] Purchase domain and setup DNS
- [ ] Setup project management (Jira/Linear)

**Deliverables:**
- Approved PRD
- High-fidelity mockups
- Infrastructure setup complete
- Development roadmap

---

#### **Phase 1: Core Authentication & Setup (Weeks 3-4)**
**Duration:** 2 weeks  
**Team:** 2 Full-Stack Developers

**Supabase Setup Tasks:**
- [ ] Create Supabase project
- [ ] Database schema creation (migrations)
- [ ] RLS policies implementation
- [ ] Supabase Auth configuration (email + Google OAuth)
- [ ] Storage buckets setup (avatars, logos, pdfs)

**Frontend Tasks:**
- [ ] Setup Vite + React + SWC + TypeScript
- [ ] Setup TailwindCSS + Radix UI + Shadcn/UI
- [ ] Implement registration flow (Supabase Auth)
- [ ] Implement login flow (email + Google)
- [ ] Implement password reset flow
- [ ] Settings page (profile editing via PostgREST)
- [ ] Zustand store setup

**Deliverables:**
- Working authentication system (Supabase Auth)
- User profile management (PostgREST API)
- ~70% test coverage

**Milestone 1:** ✅ Users can register, login, and manage profile

---

#### **Phase 2: Quote Creation (Weeks 5-7)**
**Duration:** 3 weeks  
**Team:** 2 Full-Stack Developers + 1 QA Tester

**Supabase Tasks:**
- [ ] Database functions for quote number generation
- [ ] PostgREST API (auto-generated from schema)
- [ ] Quote validation (database constraints + triggers)
- [ ] Audit logging (database triggers)
- [ ] RLS policies for quotes & customers

**Frontend Tasks:**
- [ ] Dashboard with empty state
- [ ] Create quote multi-step form
  - Customer info step
  - Line items step
  - Add-ons selector
  - Materials toggle
  - Notes
- [ ] Quote list view
- [ ] Quote detail view
- [ ] Edit quote functionality
- [ ] Delete quote functionality
- [ ] Status management
- [ ] Responsive design for mobile

**Deliverables:**
- Complete quote CRUD functionality
- Intuitive multi-step form
- Dashboard with filtering/sorting
- ~75% test coverage

**Milestone 2:** ✅ Users can create and manage quotes

---

#### **Phase 3: PDF Generation & Translation (Weeks 8-9)**
**Duration:** 2 weeks  
**Team:** 1 Full-Stack Developer + 1 Frontend Developer

**Supabase Edge Functions Tasks:**
- [ ] PDF generation Edge Function (jsPDF or Puppeteer)
- [ ] PDF template design
- [ ] Gemini translation Edge Function
- [ ] Translation cache table & logic
- [ ] Supabase Storage integration
- [ ] Temporary signed URLs generation

**Frontend Tasks:**
- [ ] Language selector modal
- [ ] PDF preview component
- [ ] Download PDF button
- [ ] Loading states
- [ ] Error handling

**Deliverables:**
- Professional PDF quotes
- 3-language support (EN/ES/PT)
- Fast generation (<10 seconds)
- Beautiful, accessible PDFs

**Milestone 3:** ✅ Users can generate multilingual PDF quotes

---

#### **Phase 4: Email & WhatsApp Integration (Weeks 10-11)**
**Duration:** 2 weeks  
**Team:** 1 Full-Stack Developer + 1 Frontend Developer

**Supabase Edge Functions Tasks:**
- [ ] Email sending Edge Function (Resend)
- [ ] Email templates (3 languages)
- [ ] Email delivery tracking (quote_emails table)
- [ ] WhatsApp link generation Edge Function
- [ ] PDF attachment handling
- [ ] Retry logic for failures

**Frontend Tasks:**
- [ ] Send via Email modal
- [ ] Send via WhatsApp modal
- [ ] Email preview
- [ ] WhatsApp message preview
- [ ] Delivery status indicators
- [ ] Error handling

**Deliverables:**
- Email delivery working
- WhatsApp Web link generation
- Tracking delivery status
- User-friendly send flows

**Milestone 4:** ✅ Users can send quotes via Email & WhatsApp

---

#### **Phase 5: Customer History & Autocomplete (Week 12)**
**Duration:** 1 week  
**Team:** 1 Full-Stack Developer

**Tasks:**
- [ ] Customer autocomplete search
- [ ] Customer history tracking
- [ ] Auto-fill customer data
- [ ] Fuzzy search implementation
- [ ] Performance optimization

**Deliverables:**
- Fast autocomplete (<300ms)
- Historical customer data
- Reduced data entry time

**Milestone 5:** ✅ Customer autocomplete saves time

---

#### **Phase 6: Polish & Testing (Weeks 13-14)**
**Duration:** 2 weeks  
**Team:** 2 Developers + 1 QA Tester + 1 Designer

**Tasks:**
- [ ] UI/UX refinements
- [ ] Mobile optimization
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] E2E test suite (Playwright)
- [ ] Load testing (Locust)
- [ ] Security audit
- [ ] Bug fixes
- [ ] Documentation

**Deliverables:**
- Polished UI/UX
- >80% test coverage
- Performance benchmarks met
- Security vulnerabilities fixed
- User documentation

**Milestone 6:** ✅ Production-ready application

---

#### **Phase 7: Beta Launch (Weeks 15-16)**
**Duration:** 2 weeks  
**Team:** Full Team

**Tasks:**
- [ ] Deploy to production
- [ ] Beta user onboarding (20-30 users)
- [ ] User feedback collection
- [ ] Analytics setup (GA4, Mixpanel)
- [ ] Support system setup
- [ ] Marketing materials (landing page, social media)
- [ ] Bug fixes from beta feedback
- [ ] Final performance tuning

**Deliverables:**
- Live production application
- Beta user feedback report
- Marketing materials
- Support documentation

**Milestone 7:** ✅ Beta launch complete

---

#### **Phase 8: Public Launch (Week 17)**
**Duration:** 1 week  
**Team:** Full Team + Marketing

**Tasks:**
- [ ] Remove beta restrictions
- [ ] Launch marketing campaign
- [ ] Social media announcements
- [ ] Press release
- [ ] Monitor system stability
- [ ] 24/7 on-call rotation
- [ ] Rapid bug fixes

**Deliverables:**
- Public launch ✅
- Marketing campaign live
- Stable production system

**Milestone 8:** 🚀 **PUBLIC LAUNCH**

---

### 15.2 Gantt Chart (Simplified)

```
Week  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17
─────────────────────────────────────────────────────────
Pre-Dev ████                                             
Auth       ████████                                      
Quotes           ████████████                            
PDF                      ████████                        
Email/WA                        ████████                 
History                                ████              
Polish                                     ████████      
Beta                                              ████████
Launch                                                  ██

Legend:
████ = Active work
```

---

### 15.3 Critical Path

**Longest dependency chain (17 weeks total):**
1. Pre-Development (2 weeks)
2. → Auth Setup (2 weeks)
3. → Quote Creation (3 weeks)
4. → PDF Generation (2 weeks)
5. → Email/WhatsApp (2 weeks)
6. → Customer History (1 week)
7. → Polish & Testing (2 weeks)
8. → Beta Launch (2 weeks)
9. → Public Launch (1 week)

**Critical Dependencies:**
- Auth must complete before Quote Creation
- Quote Creation must complete before PDF Generation
- PDF Generation must complete before Email/WhatsApp
- All features must complete before Beta Launch

---

## 16. RISKS & MITIGATION

### 16.1 Technical Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **Gemini API rate limits exceed budget** | Medium | High | • Implement aggressive caching<br>• Use cheaper models for common phrases<br>• Pre-translate common terms<br>• Fallback to English if API fails |
| **PDF generation is too slow** | Low | Medium | • Use headless Chrome caching<br>• Generate PDFs asynchronously<br>• Optimize templates<br>• Consider alternative libraries |
| **Supabase performance issues at scale** | Low | High | • Monitor query performance<br>• Implement proper indexing<br>• Use connection pooling<br>• Have migration plan to self-hosted PostgreSQL |
| **Email deliverability issues** | Medium | Medium | • Use reputable provider (Resend/SendGrid)<br>• Implement SPF/DKIM/DMARC<br>• Monitor bounce rates<br>• Have backup email provider |
| **WhatsApp blocks web.whatsapp.com links** | Low | Low | • Minimal risk (official WhatsApp feature)<br>• Have WhatsApp Cloud API as backup plan |
| **Google Maps API costs exceed budget** | Low | Medium | • Implement aggressive caching<br>• Use geocoding only when necessary<br>• Consider alternative providers (Mapbox) |

---

### 16.2 Business Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **Low user adoption** | Medium | High | • Extensive beta testing with target users<br>• Gather feedback early<br>• Iterate quickly<br>• Offer free trial period<br>• Strong onboarding experience |
| **Competitors enter market** | Medium | Medium | • Focus on UX for low-literacy users<br>• Build language advantage (ES/PT)<br>• Strong customer relationships<br>• Rapid feature iteration |
| **Users prefer pen & paper** | Medium | High | • Emphasize professionalism of digital quotes<br>• Show ROI (time saved, conversion rate)<br>• Make onboarding extremely simple<br>• Offer in-person demos |
| **Payment processing complexity** | Low | Low | • Use Stripe for subscriptions<br>• Well-documented APIs<br>• Start with simple plans |
| **Regulatory/compliance issues** | Low | Medium | • Consult with legal expert<br>• Implement GDPR/LGPD compliance<br>• Clear privacy policy<br>• Transparent data handling |

---

### 16.3 User Experience Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **UI too complex for target users** | High | High | • User testing with actual contractors<br>• Iterative design improvements<br>• Video tutorials<br>• In-app tooltips<br>• Simple onboarding wizard |
| **Mobile experience inadequate** | Medium | High | • Mobile-first design approach<br>• Extensive mobile testing<br>• Large touch targets (44x44px min)<br>• Test on older devices |
| **Language translations inaccurate** | Medium | Medium | • Human review of common translations<br>• User feedback loop<br>• Professional translator for UI<br>• LLM for dynamic content only |
| **PDF quotes look unprofessional** | Low | High | • Hire professional designer<br>• Get user feedback on designs<br>• Multiple template options<br>• High-quality typography |

---

### 16.4 Timeline Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| **Development takes longer than planned** | High | Medium | • Build MVP first (cut non-essential features)<br>• Parallel development where possible<br>• Weekly progress reviews<br>• Buffer time in schedule (2 weeks) |
| **Third-party API delays/issues** | Medium | Medium | • Test integrations early<br>• Have fallback providers<br>• Mock APIs for development<br>• Don't block on external dependencies |
| **Team member unavailability** | Medium | Low | • Cross-train team members<br>• Comprehensive documentation<br>• Code reviews for knowledge sharing<br>• Avoid single points of failure |

---

## 17. SUCCESS METRICS

### 17.1 Product Metrics (Year 1)

#### **Acquisition Metrics**
| Metric | Target (Month 3) | Target (Month 6) | Target (Month 12) |
|--------|------------------|------------------|-------------------|
| **Total Signups** | 50 | 200 | 500 |
| **Paid Subscribers** | 10 | 50 | 150 |
| **Conversion Rate** | 20% | 25% | 30% |
| **Monthly Recurring Revenue (MRR)** | $300 | $1,500 | $5,000 |
| **Customer Acquisition Cost (CAC)** | $50 | $40 | $30 |

#### **Engagement Metrics**
| Metric | Target |
|--------|--------|
| **Daily Active Users (DAU)** | 30% of paid users |
| **Weekly Active Users (WAU)** | 70% of paid users |
| **Quotes Created per User per Month** | 15 (average) |
| **Time to Create First Quote** | <5 minutes |
| **Quote Sent Rate** | >80% of created quotes |
| **Session Duration** | 8-12 minutes (average) |

#### **Retention Metrics**
| Metric | Target |
|--------|--------|
| **Day 1 Retention** | >60% |
| **Week 1 Retention** | >40% |
| **Month 1 Retention** | >30% |
| **Month 3 Retention** | >50% |
| **Churn Rate (Monthly)** | <5% |

#### **Satisfaction Metrics**
| Metric | Target |
|--------|--------|
| **Net Promoter Score (NPS)** | >50 |
| **Customer Satisfaction (CSAT)** | >4.5/5 |
| **Support Ticket Volume** | <2 tickets per user per month |
| **App Store Rating** | >4.7/5 (if mobile apps launched) |

---

### 17.2 Technical Metrics

#### **Performance**
| Metric | Target | Critical Threshold |
|--------|--------|--------------------|
| **Page Load Time (p95)** | <2s | <3s |
| **API Response Time (p95)** | <500ms | <1s |
| **PDF Generation Time** | <8s | <15s |
| **Uptime** | >99.5% | >99% |

#### **Quality**
| Metric | Target |
|--------|--------|
| **Test Coverage** | >80% |
| **Critical Bugs** | 0 in production |
| **Error Rate** | <0.1% of requests |
| **Sentry Error Volume** | <10 errors/day |

---

### 17.3 Business Metrics

#### **Financial**
| Metric | Month 6 | Month 12 |
|--------|---------|----------|
| **Revenue** | $1,500 | $5,000 |
| **Operating Costs** | $500 | $800 |
| **Gross Margin** | $1,000 | $4,200 |
| **Cash Runway** | 12 months | 18 months |

#### **Growth**
| Metric | Target (Month 12) |
|--------|-------------------|
| **Month-over-Month Growth Rate** | >10% |
| **Customer Lifetime Value (LTV)** | >$360 (12 months × $30) |
| **LTV:CAC Ratio** | >3:1 |
| **Referral Rate** | >15% of signups |

---

### 17.4 Key Performance Indicators (KPIs) Dashboard

**North Star Metric:** **Active Paid Subscribers**

**Primary KPIs (Weekly Review):**
1. New paid subscribers
2. Churn rate
3. Quotes created per user
4. MRR growth
5. System uptime

**Secondary KPIs (Monthly Review):**
1. User acquisition cost
2. Average revenue per user (ARPU)
3. Quote-to-sent ratio
4. Customer satisfaction score
5. Feature adoption rates

---

## 18. FUTURE ENHANCEMENTS (Post-MVP)

### 18.1 Short-Term Enhancements (Months 3-6)

#### **Pro Plan Features**
- [ ] Unlimited quotes per month
- [ ] Advanced analytics dashboard
  - Quote conversion rates
  - Revenue forecasting
  - Customer insights
- [ ] Custom branding (colors, fonts on PDFs)
- [ ] Quote templates (save & reuse configurations)
- [ ] Priority support (24-hour response time)

#### **User Experience Improvements**
- [ ] Voice input for notes/descriptions
- [ ] Photo attachments for before/after
- [ ] Quote duplication (copy existing quote)
- [ ] Bulk quote status updates
- [ ] Export quotes to Excel/CSV
- [ ] Print-friendly quote view

#### **Integration Enhancements**
- [ ] WhatsApp Business Cloud API (automated sending)
- [ ] Calendar integration (sync start/end dates)
- [ ] Accounting software integration (QuickBooks, Xero)
- [ ] CRM integration (Salesforce, HubSpot)

---

### 18.2 Medium-Term Enhancements (Months 6-12)

#### **Team Collaboration**
- [ ] Multi-user accounts (2-5 team members)
- [ ] Role-based permissions (admin, editor, viewer)
- [ ] Activity feed (who did what)
- [ ] Comments on quotes
- [ ] Assign quotes to team members

#### **Advanced Quote Features**
- [ ] Recurring quotes (monthly maintenance contracts)
- [ ] Quote expiration dates
- [ ] Payment terms (NET 30, 50% deposit, etc.)
- [ ] Tax calculations
- [ ] Discount codes/promotions
- [ ] Quote comparison (side-by-side)

#### **Customer Portal**
- [ ] Customers can view quotes online
- [ ] Digital signature for acceptance
- [ ] Online payment integration (Stripe)
- [ ] Customer feedback/rating system
- [ ] Appointment scheduling

#### **Mobile Apps**
- [ ] iOS native app (Swift)
- [ ] Android native app (Kotlin)
- [ ] Offline mode with sync
- [ ] Camera integration for measurements
- [ ] Push notifications

---

### 18.3 Long-Term Vision (Year 2+)

#### **AI-Powered Features**
- [ ] AI quote suggestions based on past jobs
- [ ] Automatic area calculation from photos
- [ ] Predictive pricing recommendations
- [ ] Smart scheduling optimization
- [ ] Chatbot for customer inquiries

#### **Marketplace & Community**
- [ ] Material suppliers directory
- [ ] Contractor reviews and ratings
- [ ] Job board (customers find contractors)
- [ ] Knowledge base (how-to guides)
- [ ] Community forum

#### **Business Intelligence**
- [ ] Market benchmarking (your prices vs. competitors)
- [ ] Seasonal demand forecasting
- [ ] Customer segmentation
- [ ] Profitability analysis per job type
- [ ] Custom reports builder

#### **White-Label Solution**
- [ ] Resell platform to flooring distributors
- [ ] Custom branding per reseller
- [ ] API for third-party integrations
- [ ] Affiliate program

---

## 19. APPENDICES

### 19.1 Glossary

| Term | Definition |
|------|------------|
| **Add-on** | Optional item added to a quote line item (e.g., waterproofing, specific flooring type) |
| **Line Item** | Individual job component in a quote (e.g., "Kitchen Floor - 250 sq ft") |
| **Quote Number** | Unique identifier for each quote (format: QT-YYYYMMDD-XXXX) |
| **RLS** | Row Level Security - PostgreSQL feature to restrict database access |
| **JWT** | JSON Web Token - authentication token format |
| **Geocoding** | Converting addresses to geographic coordinates (lat/lng) |
| **LLM** | Large Language Model - AI for text generation/translation |
| **WABA** | WhatsApp Business Account |
| **SaaS** | Software as a Service - subscription-based software |
| **MVP** | Minimum Viable Product - first version with core features |

---

### 19.2 References

**Documentation:**
- [Vite Documentation](https://vite.dev/)
- [React 19 Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Google Maps API Documentation](https://developers.google.com/maps/documentation)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Shadcn/UI Documentation](https://ui.shadcn.com/)

**Tools & Services:**
- [Figma (Design)](https://www.figma.com/)
- [Vercel (Frontend Hosting)](https://vercel.com/)
- [Supabase (Backend Platform)](https://supabase.com/)
- [Sentry (Error Tracking)](https://sentry.io/)
- [Uptime Robot (Monitoring)](https://uptimerobot.com/)

---

### 19.3 Contact & Support

**Project Team:**
- **Product Owner:** [Name] - [email]
- **Tech Lead:** [Name] - [email]
- **Full-Stack Developer:** [Name] - [email]
- **Frontend Developer:** [Name] - [email]
- **QA Tester:** [Name] - [email]
- **Designer:** [Name] - [email]

**Stakeholders:**
- **CEO/Founder:** [Name] - [email]
- **Investors:** [Names]

**Support Channels:**
- **User Support:** support@easequote.ai
- **Technical Issues:** tech@easequote.ai
- **Slack:** #easequote-dev
- **GitHub:** github.com/easequote/easequote-ai

---

### 19.4 Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-03 | Senior BA | Initial PRD creation |
| 1.1 | TBD | | Post-beta feedback updates |
| 2.0 | TBD | | Pro plan features specification |

---

## 20. SIGN-OFF & APPROVAL

**Document Status:** ✅ **READY FOR REVIEW**

**Required Approvals:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Product Owner** | | ____________ | ___/___/___ |
| **Tech Lead** | | ____________ | ___/___/___ |
| **CEO/Founder** | | ____________ | ___/___/___ |
| **Lead Developer** | | ____________ | ___/___/___ |

**Approval Criteria:**
- ✅ All functional requirements clearly defined
- ✅ Technical architecture validated
- ✅ Timeline realistic and achievable
- ✅ Budget approved
- ✅ Risks identified and mitigated
- ✅ Success metrics agreed upon

---

## 🎯 EXECUTIVE SUMMARY (TL;DR)

**What:** EaseQuote AI - Quote management SaaS for flooring contractors  
**Who:** Hispanic/Brazilian micro-entrepreneurs in the US  
**Why:** Replace pen & paper with professional digital quotes  
**How:** Mobile-first web app with multilingual PDF generation  
**When:** 17-week development timeline → Public launch Month 5  
**Cost:** ~$150-200/month operating costs, $30/month subscription  
**Goal:** 150 paying customers by Month 12 → $5,000 MRR  

**Key Features:**
1. Simple quote creation (customer + line items + add-ons)
2. Multilingual PDF generation (EN/ES/PT via Gemini AI)
3. Send via Email & WhatsApp
4. Customer history & autocomplete
5. Dashboard with filtering/sorting

**Tech Stack:** Vite+React+SWC+TypeScript (Frontend) + Supabase (Backend: PostgreSQL + Edge Functions + Auth + Storage)

**Next Steps:**
1. Approve PRD ✅
2. Create design mockups
3. Setup infrastructure
4. Begin Sprint 1 (Auth implementation)

---

**END OF PRODUCT REQUIREMENTS DOCUMENT**

---

**Total Pages:** 47  
**Word Count:** ~25,000 words  
**Completion:** 100% ✅
