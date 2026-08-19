# ⚡ Dispatch — ReachInbox Email Scheduler Control Tower

> **Codename:** `Dispatch` — A full-stack, restart-safe, rate-limited email scheduling engine with an interactive 3D control tower dashboard, atomic Redis rate limiting, PostgreSQL source-of-truth persistence, and self-healing worker recovery.

---

## 📑 Table of Contents
1. [Executive Summary & Product Vision](#-executive-summary--product-vision)
2. [Requirement vs. Implementation Mapping Matrix](#-requirement-vs-implementation-mapping-matrix)
3. [Technology Stack](#-technology-stack)
4. [System Architecture & Data Flow](#-system-architecture--data-flow)
5. [Core Engine Mechanics & Reliability Logic](#-core-engine-mechanics--reliability-logic)
   - [5.1 Bulk Scheduling & Hourly Window Spillover Math](#51-bulk-scheduling--hourly-window-spillover-math)
   - [5.2 How Persistence & Restart Recovery Work (`reconcileOnBoot`)](#52-how-persistence--restart-recovery-work-reconcileonboot)
   - [5.3 Atomic Rate Limiting & Holding Reschedule Loop](#53-atomic-rate-limiting--holding-reschedule-loop)
6. [Detailed Feature Map (Backend & Frontend)](#-detailed-feature-map-backend--frontend)
7. [Design System — "Ember Velvet"](#-design-system--ember-velvet)
8. [Step-by-Step Setup & How to Run](#-step-by-step-setup--how-to-run)
   - [8.1 Prerequisites](#81-prerequisites)
   - [8.2 Database & Redis via Docker](#82-database--redis-via-docker)
   - [8.3 Backend API Server & BullMQ Worker](#83-backend-api-server--bullmq-worker)
   - [8.4 Frontend Control Tower Dashboard](#84-frontend-control-tower-dashboard)
   - [8.5 Ethereal Email Setup](#85-ethereal-email-setup)
9. [Environment Variables Reference](#-environment-variables-reference)
10. [Verification & Testing Commands](#-verification--testing-commands)

---

## 🌟 Executive Summary & Product Vision

Every cold-email and outbound engagement platform depends on one absolute guarantee:

> **"An email scheduled for 09:04 AM departs at 09:04 AM — even if the backend server crashed at 09:00 AM and recovered at 09:03 AM."**

**Dispatch** was engineered to solve this exact challenge. Rather than relying on fragile in-memory timeouts or naive cron jobs, Dispatch combines **PostgreSQL** as the immutable source of truth, **BullMQ on Redis** for deterministic delayed job queue execution, and an automatic **Self-Healing Boot Reconciliation Pass** (`reconcileOnBoot`).

Coupled with this rock-solid backend engine is an **interactive 3D Air-Traffic Control Dashboard** built with Next.js 14, Three.js / React Three Fiber, and a hand-crafted **"Ember Velvet"** visual design system.

---

## 📋 Requirement vs. Implementation Mapping Matrix

| Category | What Was Asked (Prompt Specification) | What We Built (Dispatch Implementation) | Status |
|---|---|---|---|
| **No Cron Jobs** | Must NOT use cron jobs or polling tickers for scheduling. | Pure **BullMQ delayed job queue** on Redis with millisecond-precision execution. Zero cron jobs used. | `COMPLETED` |
| **Restart Safety** | Scheduled jobs must survive server crashes and restarts. | **PostgreSQL source of truth** + `reconcileOnBoot()` worker pass that diffs DB state against Redis and auto-restores pending jobs with deterministic `jobId` deduplication. | `COMPLETED` |
| **Rate Limiting** | Enforce sender hourly limits (e.g. max $M$ emails/hour). | **Atomic Redis counter** (`INCR rate:{senderId}:{hourKey}`). Jobs exceeding cap transition to `holding` and auto-reschedule to top of next hour window. | `COMPLETED` |
| **Concurrency** | Multiple workers must not violate sender rate limits. | Atomic Redis transactions prevent race conditions across parallel worker instances. | `COMPLETED` |
| **Email Transport** | Provide test account support & preview links. | Automated **Nodemailer Ethereal SMTP** test transport. Captures live preview URLs (`etherealUrl`) stored directly in DB. | `COMPLETED` |
| **Authentication** | Secure authentication system. | **Passport.js Google OAuth 2.0** + JWT cookies + **Instant Demo/Sandbox Mode** for instant evaluator access without API keys. | `COMPLETED` |
| **Auth Guard** | Dashboard pages must be protected from unauthenticated access. | **Next.js Middleware + Auth Context** intercepting all `/dashboard/*` routes and redirecting unauthenticated requests to `/login`. | `COMPLETED` |
| **UI Aesthetics** | Modern, stunning, non-generic dark mode. | **"Ember Velvet" Design System** — Deep plum canvas (`#2D0A27`), radiant Ember gradients (`#FF6B4A` ➔ `#FF2E7E` ➔ `#FFB830`), glassmorphism, and custom typography. Zero standard Tailwind blues/greens/reds used. | `COMPLETED` |
| **3D Visualizer** | Interactive visual representation of scheduled email traffic. | **Interactive 3D Runway Lane** (React Three Fiber / Three.js) rendering scheduled emails as 3D capsules sliding toward a glowing `NOW` departure threshold. | `COMPLETED` |
| **CSV Bulk Upload** | Support CSV recipient upload with validation. | Drag-and-drop CSV parser with instant email extraction, valid count badge, and collapsible malformed email warning container. | `COMPLETED` |

---

## 🛠 Technology Stack

### Frontend Architecture
- **Framework**: Next.js 14 (App Router) with TypeScript
- **3D Graphics**: Three.js & React Three Fiber (`@react-three/fiber`, `@react-three/drei`)
- **Animations**: Framer Motion (Smooth spring transitions & drawer slides)
- **Styling**: Vanilla CSS Variables & Tailwind CSS (Custom Ember Velvet Tokens)
- **State & Data Polling**: TanStack Query (React Query) with 5-second automatic queue refresh
- **CSV Processing**: PapaParse & Client-side regex validator

### Backend Architecture
- **Runtime**: Node.js 20 LTS + TypeScript (`ts-node-dev`)
- **API Framework**: Express.js with Modular Route Controllers
- **Database & ORM**: PostgreSQL 16 + Prisma ORM (Type-safe models & migrations)
- **Queue Engine**: BullMQ v5 + Redis 7 (`ioredis`)
- **Authentication**: Passport.js (Google OAuth 2.0 Strategy) + JWT (`jsonwebtoken`)
- **Email Delivery**: Nodemailer + Ethereal SMTP Test Account Integration
- **Logging**: Winston logger with structured timestamps & colorized terminal output

### Infrastructure & Operations
- **Containerization**: Docker Compose (`docker-compose.yml`) running PostgreSQL (Port 5433) & Redis (Port 6380)
- **Restart Safety Engine**: Native boot reconciler (`reconcileOnBoot`)

---

## 🔄 System Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Public Landing Page ( / )                         │
│             Interactive 3D Particle Mesh Header & Features             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Click "Enter Console"
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Auth Guard & Login ( /login )                        │
│            Google OAuth 2.0 / JWT Session / Instant Demo Mode           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Authenticated Cookie / Bearer Token
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              Protected Dashboard Console ( /dashboard )               │
│  - Top Navigation Bar & 64px Collapsible Side Rail                      │
│  - Interactive 3D Runway Lane (Live Air Traffic Visualizer)            │
│  - Compose Campaign Drawer (CSV Drag & Drop Parser)                     │
│  - Live Scheduled, Sent, & Rate Limit Monitoring Tables                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API Calls (JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Express Backend Server (Port 5000)                │
│   /api/auth   │   /api/senders   │   /api/campaigns   │   /api/emails   │
└─────────────────────┬─────────────────────────────────┬────────────────┘
                      │                                 │
         1. Write Rows│                                 │ 2. Enqueue Job
                      ▼                                 ▼
┌───────────────────────────┐                     ┌──────────────────────┐
│  PostgreSQL (Port 5433)   │                     │   Redis (Port 6380)  │
│  Single Source of Truth   │                     │  BullMQ Delayed Queue│
│  Campaigns & Emails Rows  │                     │  Rate Counter ZSET   │
└───────────────────────────┘                     └──────────┬───────────┘
                                                             │
                                                             │ 3. Worker Pickup
                                                             ▼
                                                  ┌──────────────────────┐
                                                  │    BullMQ Worker     │
                                                  │ - Atomic rate check  │
                                                  │ - Holding reschedule │
                                                  │ - Ethereal SMTP send │
                                                  │ - DB status update   │
                                                  └──────────────────────┘
```

---

## ⚙️ Core Engine Mechanics & Reliability Logic

### 5.1 Bulk Scheduling & Hourly Window Spillover Math

When a user dispatches a campaign with $N$ recipients, a specified `startTime`, a minimum delay interval (`delayMs`), and an hourly rate limit cap ($M$ emails/hour):

1. **Database Row Generation**:
   The backend creates 1 `Campaign` row and $N$ `ScheduledEmail` rows in PostgreSQL with `status = 'queued'`.

2. **Spillover Timestamp Formula**:
   Each recipient $i$ (where $0 \le i < N$) receives a pre-calculated `sendAt` timestamp that automatically accounts for hourly rate limits:
   $$\text{sendAt}_i = \text{startTime} + (i \times \text{delayMs}) + \left( \lfloor i / M \rfloor \times 3,600,000\text{ ms} \right)$$

3. **BullMQ Delayed Enqueue**:
   The backend enqueues each row into BullMQ with a calculated delay:
   $$\text{delay} = \max(0, \text{sendAt}_i - \text{now}())$$
   Crucially, each job is enqueued with a **deterministic job ID**: `jobId = scheduled_email.id`.

---

### 5.2 How Persistence & Restart Recovery Work (`reconcileOnBoot`)

If the backend server, Redis instance, or BullMQ worker crashes or suffers power failure mid-operation:

1. **PostgreSQL Immutability**:
   Because every email is committed to PostgreSQL *before* queueing, database records are never lost during a crash.

2. **Deterministic Deduplication**:
   BullMQ guarantees that any attempt to enqueue a job with an existing `jobId` will be ignored idempotently.

3. **The Self-Healing Boot Reconciler (`reconcileOnBoot`)**:
   When the BullMQ worker boots up (or recovers from a crash), it executes the reconciliation routine:
   ```typescript
   export async function reconcileOnBoot(queue: Queue) {
     logger.info('🔄 Starting database reconciliation pass (reconcileOnBoot)...');
     
     // Query all emails stuck in 'queued' or 'holding' state
     const pendingEmails = await prisma.scheduledEmail.findMany({
       where: {
         status: { in: ['queued', 'holding'] },
         sendAt: { gte: new Date(Date.now() - 3600 * 1000) } // Grace cutoff
       }
     });

     for (const email of pendingEmails) {
       const delay = Math.max(0, new Date(email.sendAt).getTime() - Date.now());
       await queue.add(
         'send-email',
         { emailId: email.id },
         {
           jobId: email.id, // Deterministic deduplication key
           delay,
         }
       );
     }
     logger.info(`✅ Reconciled ${pendingEmails.length} pending emails with BullMQ queue.`);
   }
   ```

---

### 5.3 Atomic Rate Limiting & Holding Reschedule Loop

To enforce sender hourly quotas across single or multiple concurrent worker instances:

1. **Atomic Check-and-Increment**:
   Before initiating an SMTP transport send, the worker executes an atomic Redis command:
   $$\text{currentCount} = \text{redis.incr}\left(\text{"rate:"} + \text{senderId} + \text{":"} + \text{currentHourKey}\right)$$
   (Where `currentHourKey` is formatted as `YYYY-MM-DD-HH`).

2. **Holding State Reschedule**:
   If $\text{currentCount} > \text{maxPerHour}$:
   * The email is **not** sent.
   * The database record is updated: `status = 'holding'`, `heldReason = 'Hourly sending limit exceeded'`.
   * BullMQ reschedules the job to the start of the next hour window:
     $$\text{nextHourMs} = \text{getTimeOfNextHour}()$$
     $$\text{job.moveToDelayed}(\text{nextHourMs})$$

3. **Under Cap Execution**:
   If $\text{currentCount} \le \text{maxPerHour}$:
   * Worker sends email via Nodemailer SMTP.
   * On success, captures Ethereal preview link (`etherealUrl`).
   * Updates database record: `status = 'sent'`, `sentAt = new Date()`.

---

## 🎯 Detailed Feature Map (Backend & Frontend)

### 🔹 Backend System Features
- [x] **BullMQ Delayed Queue Engine**: Zero cron jobs; millisecond-precise delayed jobs.
- [x] **PostgreSQL Relational Persistence**: Strong integrity for Users, Senders, Campaigns, and Emails.
- [x] **Atomic Redis Rate Limiter**: Thread-safe `INCR` key counter per sender identity.
- [x] **Holding Loop & Auto-Reschedule**: Holds back excess emails and releases them in the next hour window.
- [x] **Boot Reconciliation Routine (`reconcileOnBoot`)**: Crash-proof auto-recovery on worker startup.
- [x] **Passport Google OAuth 2.0 & JWT**: Session management via HTTP-only cookie or Bearer tokens.
- [x] **Instant Sandbox Mode Endpoint**: Direct demo login (`POST /api/auth/demo`) for zero-friction evaluation.
- [x] **Nodemailer Ethereal SMTP Transport**: Auto-creates test accounts and stores live web preview URLs.

### 🔹 Frontend UI & UX Features
- [x] **Ember Velvet Visual Identity**: Custom dark jewel-tone palette (`#2D0A27`, `#40133A`, `#FF6B4A`, `#FF2E7E`).
- [x] **Public Landing Page (`/`)**: 3D particle mesh header, feature grid, system architecture diagram, and interactive live send demo widget.
- [x] **Strict Authentication Route Guard**: Next.js middleware protecting `/dashboard/*` with immediate redirection to `/login`.
- [x] **Interactive 3D Runway Lane**: Live horizontal visualizer with 3D capsules sliding towards a glowing `NOW` departure threshold.
- [x] **Compose Campaign Drawer**: Slide-out panel with CSV drag-and-drop parsing, email validation, and customizable hourly rate caps.
- [x] **Live Data Tables & Status Filters**: Scheduled (`/dashboard/scheduled`), Sent (`/dashboard/sent`), and Senders (`/dashboard/senders`) tables with status pill badges and Ethereal preview links.
- [x] **TanStack Query Polling**: 5-second automatic queue status synchronization.

---

## 🎨 Design System — "Ember Velvet"

Dispatch breaks away from generic template aesthetics by adhering to the **Ember Velvet** design specification. Standard colors (`#000000`, pure white `#FFFFFF`, or default Tailwind `slate`, `blue`, `indigo`, `green`) are strictly forbidden.

| Design Token | Hex Value | Purpose & Usage |
|---|---|---|
| `--canvas` | `#2D0A27` | Deep wine-plum canvas base (Night sky background) |
| `--panel` | `#40133A` | Card, table panel, and container background |
| `--panel-raised` | `#581B50` | Elevated surfaces (Modals, drawers, dropdowns) |
| `--hairline` | `#7D2E72` | Borders, dividers, and structural grid lines |
| `--ember-coral` | `#FF6B4A` | Gradient stop 1 — Energetic CTA accent |
| `--ember-magenta` | `#FF2E7E` | Gradient stop 2 — In-flight pulse & highlights |
| `--ember-gold` | `#FFB830` | Gradient stop 3 — Queued state & amber accents |
| `--champagne` | `#E5C365` | Sent / Success status badge (Muted metallic gold) |
| `--crimson` | `#FF3B5C` | Failed / Destructive state alert |
| `--orchid` | `#B85CFF` | Holding / Rate-limited state (Glowing violet) |
| `--fog` | `#FAEFF5` | Primary typography (Warm blush white) |
| `--mist` | `#D8ADC4` | Secondary text, timestamps, captions (Dusty rose) |

---

## 🚀 Step-by-Step Setup & How to Run

### 8.1 Prerequisites
Ensure the following tools are installed on your host system:
1. **Node.js**: `v20.x LTS` or higher
2. **npm**: `v10.x` or higher
3. **Docker Desktop**: Running on Windows/macOS/Linux (for PostgreSQL & Redis containers)

---

### 8.2 Database & Redis via Docker

From the root directory of the project, start the PostgreSQL and Redis containers:

```bash
# Navigate to project root
cd "ReachInbox Email Scheduler"

# Launch PostgreSQL (Port 5433) and Redis (Port 6380) in background
docker compose up -d

# Verify containers are running and healthy
docker compose ps
```

Expected output:
- Container `dispatch_postgres`: Listening on `0.0.0.0:5433->5432/tcp`
- Container `dispatch_redis`: Listening on `0.0.0.0:6380->6379/tcp`

---

### 8.3 Backend API Server & BullMQ Worker

1. **Navigate to backend directory & install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Push Prisma Schema to PostgreSQL**:
   ```bash
   npx prisma db push
   ```

3. **Start Backend Server & Worker**:
   Open **two separate terminal windows**:

   **Terminal 1 (Express API Server):**
   ```bash
   cd backend
   npm run dev
   ```
   *Server listens on:* `http://localhost:5000`  
   *Health check:* `http://localhost:5000/health`

   **Terminal 2 (BullMQ Queue Worker Process):**
   ```bash
   cd backend
   npm run worker
   ```
   *Worker log output:* `🟢 Dispatch BullMQ Worker process is active and listening for delayed jobs.`

---

### 8.4 Frontend Control Tower Dashboard

1. **Navigate to frontend directory & install dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

2. **Launch Next.js Development Server**:
   ```bash
   npm run dev
   ```

3. **Access Application**:
   Open **[http://localhost:3000](http://localhost:3000)** in your web browser.

---

### 8.5 Ethereal Email Setup

Dispatch **automatically generates** an Ethereal SMTP test account on application startup if custom SMTP credentials are not specified in `.env`.

* No manual signup required.
* All sent emails generate a unique web preview link (e.g., `https://ethereal.email/message/...`).
* You can inspect these links directly from the **Sent Emails** table in the frontend dashboard!

---

## 🔐 Environment Variables Reference

### Backend `.env` (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# PostgreSQL Connection (Docker container dispatch_postgres on port 5433)
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/dispatch_db?schema=public"

# Redis Connection (Docker container dispatch_redis on port 6380)
REDIS_HOST="localhost"
REDIS_PORT=6380

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:5000/api/auth/google/callback"

# JWT Secret Key
JWT_SECRET="dispatch-super-secret-jwt-token-key-2026"

# Default Scheduler Configurations
DEFAULT_MAX_PER_HOUR=200
DEFAULT_MIN_DELAY_MS=1000
```

### Frontend `.env.local` (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:5000/api"
NEXT_PUBLIC_ENABLE_DEMO_MODE=true
```

---

## 🧪 Verification & Testing Commands

### 1. Test API Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get
```
*Expected Response:*
```json
{
  "status": "ok",
  "service": "Aerovox Dispatch Engine API",
  "timestamp": "2026-08-19T18:00:00.000Z"
}
```

### 2. Test Instant Demo Auth Login
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/demo" -Method Post -ContentType "application/json"
```

### 3. Verify Self-Healing Crash Recovery
1. Open the Compose Drawer on `http://localhost:3000/dashboard` and schedule a campaign for **3 minutes in the future**.
2. Stop the BullMQ worker terminal (`Ctrl + C` in Terminal 2).
3. Restart the BullMQ worker (`npm run worker`).
4. Observe the worker terminal log:
   ```text
   🔄 Starting database reconciliation pass (reconcileOnBoot)...
   ✅ Reconciled 1 pending emails with BullMQ queue.
   ```
5. The email will depart exactly at its scheduled `sendAt` time!

---

## 📜 License & Acknowledgments

Built for **ReachInbox Email Scheduler Master Challenge 2026**. Codename **Dispatch**.
