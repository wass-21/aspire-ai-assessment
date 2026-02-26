# AI-Powered Library & Event Management Platform

This project is a full-stack web application built as part of an AI technical assessment.  
It combines a Library Management System and an Event Scheduler into one secure, AI-enhanced platform.

**Live Demo:**  
https://aspire-ai-assessment.vercel.app

**GitHub Repository:**  
https://github.com/wass-21/aspire-ai-assessment

---

# Technology Stack

**Frontend:**

- Next.js (App Router)
- React
- TailwindCSS

**Backend:**

- Supabase (PostgreSQL, Authentication, Row-Level Security)

**Authentication:**

- Google OAuth (SSO)
- Email and Password login/signup

**AI Integration:**

- OpenRouter (gpt-4o-mini)

**Deployment:**

- Vercel

---

# Core Features

## 1. Library Management System

### Book Management

- Add books
- Edit books
- Delete books
- Store metadata (title, author, description, tags)

### Borrowing System

- Check-out (borrow) books
- Check-in (return) books
- Track availability status

### Search

- Search books by title
- Search by author
- Search by tags

### AI Integration

- Generate book summaries automatically
- Auto-generate tags using AI

---

## 2. Event Scheduler

### Event Management

- Create events
- Edit events
- Delete events
- Store:
  - Title
  - Date and time
  - Location
  - Description

### Status Tracking

Events can be marked as:

- Upcoming
- Attending
- Maybe
- Declined

### Search & Filtering

Events can be searched by:

- Title
- Location
- Date range

### Invitation System

- Invite users via email
- Generate secure invitation links
- Accept or decline invitations
- Invited users can view accepted events

### AI Integration

Users can create events using natural language input.

Example:

*"Team meeting tomorrow at 10am in Beirut"*

AI automatically extracts:

- Title
- Date
- Time
- Location
- Description

---

# Authentication & Authorization

The platform supports:

- Google SSO login
- Email & password login
- Role-based access control

**Roles:**

**Admin:**

- Manage books
- Manage events
- Invite users

**Member:**

- Borrow books
- Accept event invitations
- View invited events

Row-Level Security (RLS) is implemented in Supabase to ensure proper data isolation.

---

# Database Structure

Main tables:

- profiles (user roles)
- books
- borrows
- events
- event_invitations

All access is protected with Supabase Row-Level Security policies.

---

# Deployment

The application is deployed on Vercel.

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENROUTER_API_KEY`

---

# Local Development

Clone the repository:

```bash
git clone https://github.com/wass-21/aspire-ai-assessment.git
cd aspire-ai-assessment
```

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
OPENROUTER_API_KEY=your_key
```

Run:

```bash
npm run dev
```

---

# Highlights

- Full-stack architecture
- Secure authentication (SSO + Email)
- Role-based access control
- AI-assisted workflows
- Token-based invitation system
- Production deployment

---

# Author

**Wassim Hassoun**  
AI Software Engineer

- **Email:** wassimhassoun310@gmail.com
- **LinkedIn:** https://linkedin.com/in/wassim-hassoun
- **GitHub:** https://github.com/wass-21
