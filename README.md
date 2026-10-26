# CampusFind AI — Full-Stack AI-Powered Campus Lost & Found Platform

> **Tagline:** “Lost something? Let AI bring it back.”

CampusFind AI is an intelligent lost-and-found management web application designed specifically for college and university campuses. Built with React, TypeScript, Tailwind CSS, and a specialized **Multi-Agent System (MAS)**, it replaces chaotic bulletin boards and group chats with privacy-preserving matching, zero-knowledge verification, and staff-mediated safe handovers.

---

## 🌟 Key Architecture & Highlights

### 1. Multi-Agent System (MAS)
The core backend architecture consists of three specialized, explainable agents:

1. **Matching Agent (`MatchingAgent`)**:
   - Evaluates eligible opposite reports (lost vs found) within the campus.
   - Computes a weighted 7-signal similarity score ($0-100$):
     - **30%**: Name & descriptive vocabulary overlap (Jaccard token similarity & n-gram overlap)
     - **15%**: Category compatibility
     - **15%**: Campus location proximity & building alignment
     - **15%**: Date proximity & timestamp sequence
     - **10%**: Primary color match
     - **10%**: Brand / manufacturer match
     - **5%**: Visual photo presence
   - Returns individual signal breakdowns, positive correlation signals, missing attributes, and explainability text.

2. **Verification Agent (`VerificationAgent`)**:
   - Detects critical contradictions (e.g., conflicting colors like brown vs black, opposing brands, timeline paradoxes).
   - Maps scores into decision bands:
     - **80–100**: High-Priority Candidate (`high_priority`)
     - **60–79**: Possible Match (`possible_match`)
     - **<60**: Low-Priority Candidate or Suppressed
   - Distinguishes algorithmic similarity from verified ownership with explicit legal safeguards.
   - Requires authorized human staff review before sensitive items (IDs, wallets, electronics) can be claimed.

3. **Coordinator Agent (`CoordinatorAgent`)**:
   - Orchestrates automated workflows upon report submission, updates, or manual trigger.
   - Enforces pair deduplication and upserts records into `item_matches`.
   - Triggers the Verification Agent and computes final priority ranking.
   - Logs every stage into the `agent_runs` table with execution duration, input/output summaries, and error handling.
   - Dispatches in-app notifications to relevant students.

---

## 🗄️ Database & Security Architecture

### PostgreSQL & Row Level Security (RLS)
The database schema (`schema.sql`) implements strict access controls:
- **`profiles`**: User details linked to university email domains (`@metro.edu`), roles (`student`, `staff`, `admin`).
- **`item_reports`**: Public listings with separated `private_attributes` (e.g. engravings, lockscreen patterns, serials) that are **never** returned in public searches.
- **`item_matches`**: Persisted lost/found candidate pairs with unique constraints and score breakdowns.
- **`claims`**: Zero-knowledge ownership claim records with reviewer notes and dual-party confirmation.
- **`agent_runs`**: Immutable operational telemetry for MAS executions with retry tracking.
- **`audit_logs`**: Tamper-proof activity log for administrative oversight.

RLS policies ensure:
1. Students cannot access other students' private verification secrets.
2. Only users with `staff` or `admin` roles can approve or reject claims.
3. Students cannot escalate their own role.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24.22.0)
- npm 9+

### Installation & Run

```bash
# Navigate to project directory
cd campusfind-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Run Automated Tests

```bash
npm run test
```

Runs 13 comprehensive unit and integration tests across the Matching Agent, Verification Agent, Coordinator Agent, RLS privacy enforcement, claim moderation, and dual recovery confirmation.

### Production Build

```bash
npm run build
npm run preview
```

---

## 👥 Demo Environment & Fast Role Switcher

CampusFind AI includes an instant 1-click **Demo Account Switcher** located on the top banner and authentication page:

| Persona | Role | Department | Testing Use-case |
|---|---|---|---|
| **Alex Chen** | Student | Computer Science | Reported lost AirPods Pro & brown wallet; has pending claim under review |
| **Sarah Jenkins** | Student | Biological Sciences | Reported found AirPods Pro case; reported lost ThinkPad charger |
| **Officer Marcus Reed** | Campus Staff / Security | Campus Safety & Security | Moderates claims, reviews private evidence, schedules handovers |
| **Director Linda Hayes** | System Administrator | Dean of Students Office | Oversees agent operations, retries failed runs, manages campus locations |

You can also click **"Reset Seed Database"** anytime in the user menu to restore original state.

---

## 🔄 End-to-End Walkthrough Journey

To test the entire student and staff lifecycle:

1. **Sign In**: Select **Alex Chen (Student)** from the top banner.
2. **Report a Lost Item**: Go to **Report Lost**, fill in details for a missing item (e.g., Blue Water Bottle in Engineering Hall), and add a private engraving. Click **Submit**.
3. **Autonomous Agent Execution**: The Coordinator Agent automatically runs the Matching Agent and detects the found water bottle turned in by Officer Marcus.
4. **Compare Evidence**: Inspect the **AI Match Results** comparison card with side-by-side attributes, score meter, and signal breakdown.
5. **Initiate Claim**: Click **"Verify & Claim This Item"**, describe distinctive marks, and enter private proof.
6. **Switch to Staff**: Click **Officer Marcus (Staff)** in the top bar.
7. **Moderate Claim**: Navigate to **Claims & Recovery** or **Admin Queue**, review the private evidence, and click **"Moderate & Decide Claim"** → select **"Schedule Physical Handover Appointment"**.
8. **Dual Confirmation**: Click **"Staff / Finder Confirm Handover"**, then switch back to Alex to confirm receipt.
9. **Recovery Confirmed**: Watch the recovery celebration and verify both reports update to **Recovered** status!
10. **Agent Operations**: Go to **Agent Ops** to view MAS execution logs, latency measurements, and test the **Retry** action on failed runs.

---

## 📁 Repository Structure

```
campusfind-ai/
├── schema.sql                         # PostgreSQL DDL & Row Level Security policies
├── src/
│   ├── types/index.ts                 # Full TypeScript interfaces
│   ├── data/seedData.ts               # Realistic campus demonstration dataset
│   ├── lib/
│   │   ├── mas/
│   │   │   ├── matchingAgent.ts       # Agent 1: 7-signal similarity engine
│   │   │   ├── verificationAgent.ts   # Agent 2: Contradiction & decision auditor
│   │   │   ├── coordinatorAgent.ts    # Agent 3: Event orchestrator & state manager
│   │   │   └── agentService.ts        # High-level MAS service API
│   │   ├── storage.ts                 # Persistent database engine with RLS enforcement
│   │   ├── supabaseClient.ts          # Supabase connector & configuration validator
│   │   └── utils.ts                   # Tokenizer, similarity math, formatters
│   ├── components/
│   │   ├── common/                    # Button, Badge, Card, Modal, ScoreMeter
│   │   ├── layout/                    # Navbar with demo switcher, Footer
│   │   ├── items/                     # ItemCard, MatchComparisonCard, ClaimModal
│   │   └── mas/                       # MASWorkflowDiagram
│   ├── pages/
│   │   ├── LandingPage.tsx            # SaaS landing page with live previews
│   │   ├── AuthPage.tsx               # Auth & 1-click role switcher
│   │   ├── DashboardPage.tsx          # User metrics & quick actions
│   │   ├── BrowsePage.tsx             # Filterable search registry
│   │   ├── ItemDetailPage.tsx         # Item details, photo gallery & claiming
│   │   ├── MatchResultsPage.tsx       # Side-by-side comparison & score radar
│   │   ├── ClaimsPage.tsx             # Claim lifecycle & handover tracker
│   │   ├── MyReportsPage.tsx          # Tabbed report management
│   │   ├── NotificationsPage.tsx      # In-app notification center
│   │   ├── AdminDashboardPage.tsx     # Moderation queue & audit log table
│   │   ├── AgentOperationsPage.tsx    # MAS execution telemetry & retry controls
│   │   ├── AnalyticsPage.tsx          # Impact analytics & location hotspots
│   │   ├── NotFoundPage.tsx           # Custom 404
│   │   └── UnauthorizedPage.tsx       # Role-restricted access page
│   ├── tests/
│   │   ├── mas.test.ts                # Tests for Matching, Verification & Coordinator
│   │   └── workflow.test.ts           # Tests for claims, permissions, and RLS
│   ├── App.tsx                        # Router & route definitions
│   ├── main.tsx                       # React root entry
│   └── index.css                      # Tailwind design system tokens
```
