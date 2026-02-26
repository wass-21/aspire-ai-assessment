# Aspire Software AI Assessment – Library Management & Event Scheduler

Full-stack AI web application built using Next.js, Supabase, and OpenRouter AI.

Includes:

- Library Management System
- Event Scheduler with Invitations
- AI-powered features

**Live Demo:**  
https://aspire-ai-assessment.vercel.app/

**GitHub Repository:**  
https://github.com/wass-21/aspire-ai-assessment

---

# Tech Stack

**Frontend:**

- Next.js 16.1.6
- React
- TailwindCSS

**Backend:**

- Supabase (PostgreSQL, Authentication, API)

**Authentication:**

- Google OAuth
- Email and Password

**AI:**

- OpenRouter (gpt-4o-mini)

**Deployment:**

- Vercel

---

# Features

## Library Management

- Add, edit, delete books
- Search books by title or author
- Borrow and return books
- Role-based access control
- AI-generated book summaries and tags

---

## Event Scheduler

- Create, edit, delete events
- Search by title, location, and date range
- Status tracking (upcoming, attending, maybe, declined)
- Invitation system
- Accept and decline invitations
- AI event creation from natural language

Example:

*"Team meeting tomorrow at 10am in Beirut"*

AI extracts structured event information automatically.

---

# Authentication

Supports:

- Google Sign-In
- Email / Password signup and login

---

# Database

PostgreSQL via Supabase

**Tables:**

- books
- borrows
- events
- event_invitations
- profiles

Includes Row Level Security (RLS).

---

# Local Development

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

# Author

**Wassim Hassoun**  
AI Software Engineer

- **Email:** wassimhassoun310@gmail.com
- **LinkedIn:** https://linkedin.com/in/wassim-hassoun
