# EchoSpot

EchoSpot is a React and Vite prototype for Web3 discovery, research, project verification, and contributor reputation. It is designed around an evidence-led alternative to hype-driven project directories: users can explore projects, read research, inspect EchoCheck evidence, follow projects, bookmark content, and participate in contributor rewards.

> **Prototype status:** The current application is a frontend-only experience backed by static TypeScript data and simulated service delays. Authentication, project submission, analytics, rewards, and settings are demo interactions; no remote API or database is connected.

## Features

- **Project discovery** with search, category, chain, stage, verification, minimum EchoScore, and sorting filters.
- **Project profiles** with overview, technology, roadmap, team, research, EchoCheck, risks, updates, social links, related projects, and follow/bookmark actions.
- **EchoCheck verification** across five dimensions: Builder, Product, Community, Transparency, and Risk Management. Reports expose scores, status, evidence, sources, reviewer attribution, and completion progress.
- **Research library** with topic, type, ecosystem, and title search filters, plus article detail pages.
- **Contributor directory** with profiles, skills, contributions, reputation, EchoPoints, levels, badges, and leaderboards.
- **Contributor dashboard** with rewards analytics, contribution breakdowns, bounty quests, recent activity, and contribution history.
- **EchoRewards** for achievement tracking, level progress, bounties, challenges, unlocks, and perks.
- **Founder console** with visibility metrics, campaign analytics, research requests, and onboarding progress.
- **Admin console** with platform metrics, user growth, activity logs, system health, and moderation queue examples.
- **Responsive navigation** with public navigation, authenticated sidebar, mobile menu, mobile bottom navigation, and role-specific links.
- **Command palette** opened with `Ctrl+K` or `Cmd+K`, searching projects, research articles, and contributors.
- **Local UI state** for notifications, toasts, bookmarks, follows, mobile menus, and authentication.

## Tech Stack

- React 19 with TypeScript
- Vite 8
- React Router 7
- Tailwind CSS 4 through `@tailwindcss/vite`
- Framer Motion for page and section transitions
- Recharts for dashboard analytics
- Lucide React for icons
- `clsx` and `tailwind-merge` for class composition

## Getting Started

### Requirements

- Node.js with npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Vite will print the local URL, normally `http://localhost:5173`.

### Create a production build

```bash
npm run build
```

This runs TypeScript validation followed by the Vite production build.

### Preview the production build

```bash
npm run preview
```

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Run `tsc` and build the production bundle with Vite. |
| `npm run preview` | Serve the generated production build locally. |

There are currently no test or lint scripts configured in `package.json`.

## Application Routes

### Public routes

| Route | Purpose |
| --- | --- |
| `/` | Home and platform overview |
| `/discover` | Filterable project directory |
| `/projects/:slug` | Project detail and score overview |
| `/projects/:slug/echocheck` | Project-specific EchoCheck report |
| `/research` | Research library |
| `/research/:slug` | Research article detail |
| `/echocheck` | Verified and reviewed project reports |
| `/contributors` | Contributor directory |
| `/contributors/:id` | Contributor profile |
| `/leaderboards` | Contributor and community rankings |
| `/submit-project` | Multi-step founder project application |
| `/about` | EchoSpot approach and principles |

### Authentication routes

| Route | Purpose |
| --- | --- |
| `/login` | Mock sign-in flow |
| `/register` | Mock account creation flow |
| `/forgot-password` | Mock password reset confirmation |

### Authenticated routes

Unauthenticated users are redirected to `/login` by `DashboardLayout`.

| Route | Purpose |
| --- | --- |
| `/dashboard` | Redirects to `/dashboard/contributor` |
| `/dashboard/contributor` | Contributor dashboard |
| `/founder` | Founder console |
| `/admin` | Admin console |
| `/rewards` | Rewards and opportunities |
| `/settings` | Profile, wallet, notification, and account settings |
| `/profile` | Current user profile |
| `/notifications` | Notification inbox |

## Project Structure

```text
src/
├── App.tsx                 # Route definitions and lazy-loaded dashboard pages
├── main.tsx                # React root, router, and context providers
├── components/             # Reusable UI, navigation, project, research, and EchoCheck components
├── contexts/               # Authentication and cross-page UI state
├── data/                   # Static projects, reports, research, contributors, rewards, and analytics
├── layouts/                # Public, auth, and authenticated application shells
├── lib/                    # EchoScore, verification, formatting, and class utilities
├── pages/                  # Route-level screens grouped by product area
├── services/               # Async mock data access with simulated latency
└── types/                  # Shared domain models and TypeScript types
```

The `@/*` import alias maps to `src/*` and is configured in `tsconfig.json` and `vite.config.ts`.

## Architecture Notes

- `main.tsx` wraps the app with `BrowserRouter`, `AuthProvider`, and `UIProvider`.
- `App.tsx` separates public, authentication, and authenticated route layouts.
- `AuthContext` provides mock login, registration, logout, and `localStorage` persistence under `echospot_user`.
- `UIContext` owns command-palette state, notifications, bookmarks, followed projects, and toast messages.
- `src/data` is the source of truth for the demo catalog and dashboard values.
- `src/services/index.ts` exposes async-shaped fetch functions but returns the local datasets after short artificial delays.
- `echoScore.ts` centralizes the five scoring dimensions and score styling thresholds.
- `verification.ts` centralizes verification labels, descriptions, and badge styles.
- Tailwind theme tokens and global styles live in `src/index.css`.

## Demo Behavior and Limitations

- Any email and password are accepted by the mock login and registration flows.
- A registered or logged-in user is represented by the same mock contributor profile with the submitted name and email.
- Roles are represented in static user data; there is no role management or authorization backend.
- Founder and admin screens are reachable through routes, but the current mock user defaults to the `contributor` role, so role-specific navigation is not enabled by default.
- Project submission is a seven-step local form. Completion only changes local React state and sends no data.
- Settings controls are presentational/local state only; wallet management and destructive account actions are unavailable.
- Bookmarks, follows, notifications, toasts, and in-progress bounties are held in memory except for the mock authenticated user.
- External project, avatar, and research images use remote URLs and may require network access.
- Some external links and report sources intentionally use placeholder/example URLs.
- EchoCheck is a research and transparency framework, not a financial guarantee, investment recommendation, audit certification, or security guarantee.
- There is no API, database, payment system, wallet connection, server-side authentication, or automated test suite in this repository.

## Content and Data

The demo catalog currently includes six projects, six research articles, five contributors, EchoCheck reports for selected projects, static notifications, rewards, bounty quests, campaigns, and analytics datasets. To change the visible product content, update the corresponding files in `src/data/` while preserving the shared interfaces in `src/types/`.

## Build Validation

The expected repository validation command is:

```bash
npm run build
```

It type-checks the application with the strict TypeScript configuration and then creates the Vite production bundle.
