# CrisisDesk AI Frontend Console

This is the front-end dashboard and reports management application for the CrisisDesk AI platform. Built with Next.js 14, TailwindCSS, TanStack Query, and Recharts, it provides real-time emergency metrics, reports directory search/filtering, and admin controls to triage incident statuses.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State & Data Fetching:** TanStack React Query (v5)
- **Data Visualization:** Recharts
- **Icons:** Lucide React

---

## Directory structure
```text
crisisdesk-ai-frontend/
├── app/
│   ├── favicon.ico
│   ├── globals.css             # Tailwind base and global style variables
│   ├── layout.tsx              # Root HTML wrapper with Navbar and AuthProvider
│   ├── login/
│   │   └── page.tsx            # Admin credentials login form
│   ├── page.tsx                # System analytics metrics dashboard
│   ├── providers.tsx           # TanStack Query Client provider setup
│   └── reports/
│       ├── page.tsx            # Paginated reports directory list
│       └── [id]/
│           └── page.tsx        # Dynamic report inspector & status dropdown
├── components/
│   ├── AuthContext.tsx         # Global auth state and JWT session manager
│   ├── CategoryBarChart.tsx    # Recharts bar chart for category breakdowns
│   ├── FilterBar.tsx           # Multi-select search and filter controllers
│   ├── Navbar.tsx              # Shared brand navigation header and status indicators
│   ├── StatCard.tsx            # Clean layout cards for dashboard summaries
│   └── UrgencyPieChart.tsx     # Recharts donut chart for urgency breakdowns
├── lib/
│   ├── api.ts                  # Fetch API client and type interfaces
│   └── utils.ts                # Class merge utility helper
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Deployment (Vercel)

Deploying the frontend console to Vercel is simple and fast. Follow these steps:

1. **Host Repository:** Ensure your repository is pushed to GitHub.
2. **Create Vercel Project:**
   - Log into your [Vercel Dashboard](https://vercel.com).
   - Click **Add New** -> **Project**.
   - Import your `CrisisDesk-AI` GitHub repository.
3. **Configure Settings:**
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Edit and select `crisisdesk-ai-frontend` (if inside a monorepo subfolder).
4. **Environment Variables:**
   Under **Environment Variables**, add the following key:
   - `NEXT_PUBLIC_API_URL`: *The HTTPS URL of your deployed Render backend (e.g. `https://crisisdesk-ai-backend.onrender.com`)*
5. **Deploy:** Click **Deploy**. Vercel will automatically compile the build, build the static pages, and provision your live dashboard HTTPS URL.

- Live Dashboard URL: `https://<your-vercel-url>.vercel.app`

---

## Setup & Running Locally

### Prerequisites
- Node.js (v20 or higher)
- Deployed or local Express backend running on `http://localhost:3000`

### 1. Installation
Navigate into the frontend project folder and install dependencies:
```bash
cd crisisdesk-ai-frontend
npm install
```

### 2. Configure Environment
Create a `.env.local` file in `crisisdesk-ai-frontend/`:
```ini
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) (or the port shown in your terminal) to view the console.

### 4. Build for Production
To check compilation validity and run linting/typescript checks:
```bash
npm run build
```
