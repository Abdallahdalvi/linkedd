# LinkBio — Complete Developer Handoff Guide

> **Give this document to your developer (Antigravity). It contains every detail needed to understand, deploy, maintain, and extend the project.**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Repository Structure](#4-repository-structure)
5. [Environment Variables](#5-environment-variables)
6. [Database Schema](#6-database-schema)
7. [Authentication](#7-authentication)
8. [API Client Wrapper](#8-api-client-wrapper)
9. [Self-Hosted Deployment (Docker + Portainer)](#9-self-hosted-deployment)
10. [Admin vs User Separation](#10-admin-vs-user-separation)
11. [White-Labeling / Multi-Site](#11-white-labeling)
12. [Custom Domains](#12-custom-domains)
13. [File Storage](#13-file-storage)
14. [Analytics & Tracking](#14-analytics--tracking)
15. [Data Collection Gate (Leads)](#15-data-collection-gate)
16. [Block Types](#16-block-types)
17. [Edge Functions](#17-edge-functions)
18. [Frontend Pages & Routing](#18-frontend-pages--routing)
19. [Theming & Design System](#19-theming--design-system)
20. [AdMob & Ads Integration](#20-admob--ads)
21. [Development Workflow](#21-development-workflow)
22. [Testing](#22-testing)
23. [Backup & Restore](#23-backup--restore)
24. [Troubleshooting](#24-troubleshooting)
25. [Migration: Supabase → Self-Hosted](#25-migration-supabase-to-self-hosted)
26. [API Reference](#26-api-reference)

---

## 1. Project Overview

**LinkBio** is a link-in-bio platform (like Linktree) that allows users to create profile pages with customizable blocks (links, videos, shops, downloads, contact forms, etc.).

**Key Features:**
- Multi-block profile pages with drag-and-drop ordering
- 10+ block types (link, video, music, shop, download, carousel, contact, featured, HTML, text, image, scheduled)
- Data collection gates on blocks (collect name/email/phone before access)
- Real-time analytics (views, clicks, referrers, devices, countries)
- Custom domain support with DNS verification
- Password-protected profiles
- Admin panel for user management, moderation, settings
- Role-based access: `super_admin`, `admin`, `client`
- White-label ready via environment variables
- Dual-backend: works with Supabase (cloud) OR self-hosted MySQL (Docker)
- File uploads (images for avatars, covers, thumbnails)
- SEO controls per profile (title, description, OG image)
- Mobile-responsive public profiles with customizable themes

---

## 2. Architecture

### Cloud Mode (Current — Lovable/Supabase)
```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  React SPA  │────▸│  Supabase    │────▸│  PostgreSQL  │
│  (Vite)     │     │  (Auth+API)  │     │  (Managed)   │
└─────────────┘     │  Edge Funcs  │     └──────────────┘
                    │  Storage     │
                    └──────────────┘
```

### Self-Hosted Mode (Docker)
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Nginx      │────▸│  Node.js API │────▸│   MySQL 8    │
│  (Port 80)   │     │  (Port 3001) │     │  (Port 3306) │
│ + Static SPA │     │  Express.js  │     │  Persistent  │
└──────────────┘     └──────────────┘     └──────────────┘
                          │
                    ┌──────────────┐
                    │ File Storage │
                    │ (Docker Vol) │
                    └──────────────┘
```

---

## 3. Tech Stack

| Layer | Cloud Mode | Self-Hosted Mode |
|-------|-----------|-----------------|
| **Frontend** | React 18 + Vite + TypeScript | Same |
| **UI** | Tailwind CSS + shadcn/ui + Framer Motion | Same |
| **State** | React hooks + TanStack Query | Same |
| **Routing** | React Router v6 | Same |
| **Database** | PostgreSQL (Supabase) | MySQL 8 |
| **Auth** | Supabase Auth (email/password) | JWT + bcrypt |
| **API** | Supabase JS SDK (direct DB) | Express.js REST API |
| **Storage** | Supabase Storage (S3-compatible) | Local filesystem + Nginx |
| **Edge Functions** | Supabase Edge Functions (Deno) | N/A (logic in Express) |
| **Drag & Drop** | @dnd-kit | Same |
| **Charts** | Recharts | Same |

---

## 4. Repository Structure

```
├── src/
│   ├── App.tsx                     # Root component, routes
│   ├── main.tsx                    # Entry point
│   ├── index.css                   # Tailwind + CSS variables
│   ├── components/
│   │   ├── blocks/                 # Block editors & renderers
│   │   │   ├── editors/            # Editor UIs for each block type
│   │   │   │   ├── LinkBlockEditor.tsx
│   │   │   │   ├── VideoBlockEditor.tsx
│   │   │   │   ├── ShopBlockEditor.tsx
│   │   │   │   ├── FeaturedBlockEditor.tsx
│   │   │   │   ├── DownloadBlockEditor.tsx
│   │   │   │   ├── CarouselBlockEditor.tsx
│   │   │   │   ├── ContactBlockEditor.tsx
│   │   │   │   ├── MusicBlockEditor.tsx
│   │   │   │   ├── HtmlBlockEditor.tsx
│   │   │   │   ├── TextBlockEditor.tsx
│   │   │   │   ├── ImageBlockEditor.tsx
│   │   │   │   ├── ScheduledBlockEditor.tsx
│   │   │   │   └── DataCollectionSettings.tsx  # Reusable data gate config
│   │   │   ├── AddBlockDialog.tsx
│   │   │   ├── BlockEditor.tsx     # Routes to correct editor
│   │   │   ├── SortableBlock.tsx   # Drag-sortable block card
│   │   │   └── DataCollectionGate.tsx  # Public-facing gate modal
│   │   ├── domain/                 # Custom domain components
│   │   ├── layout/                 # Dashboard & Admin layouts
│   │   ├── settings/               # Settings sections
│   │   ├── ads/                    # AdSense & rewarded ads
│   │   └── ui/                     # shadcn/ui components
│   ├── config/
│   │   ├── domain.ts               # Domain config, VPS IP, verification
│   │   └── admob.ts                # AdMob configuration
│   ├── contexts/
│   │   └── AuthContext.tsx          # Auth state provider
│   ├── hooks/
│   │   ├── useLinkProfile.ts       # Profile & blocks CRUD
│   │   ├── useAnalytics.ts         # Analytics data fetching
│   │   ├── useAdAnalytics.ts       # Ad analytics
│   │   ├── useCustomDomains.ts     # Domain management
│   │   ├── useUserRole.ts          # Role checking
│   │   └── useAdMob.ts             # AdMob integration
│   ├── integrations/supabase/
│   │   ├── client.ts               # Supabase client (auto-generated)
│   │   └── types.ts                # DB types (auto-generated)
│   ├── lib/
│   │   ├── utils.ts                # cn() helper
│   │   └── api-client.ts           # ★ API client wrapper (Supabase OR REST)
│   └── pages/
│       ├── LandingPage.tsx         # Public landing
│       ├── AuthPage.tsx            # Login/signup
│       ├── DashboardPage.tsx       # User dashboard router
│       ├── AdminPage.tsx           # Admin panel router
│       ├── PublicProfilePage.tsx   # Public profile view (1400+ lines)
│       ├── NotFound.tsx
│       └── dashboard/
│           ├── DashboardOverviewPage.tsx
│           ├── DashboardLinksPage.tsx
│           ├── DashboardDesignPage.tsx
│           ├── DashboardAnalyticsPage.tsx
│           ├── DashboardLeadsPage.tsx     # ★ Leads management
│           ├── DashboardProfilePage.tsx
│           └── DashboardSettingsPage.tsx
├── docker/                         # Self-hosted deployment
│   ├── docker-compose.yml          # Full stack definition
│   ├── .env.example                # Environment template
│   ├── init.sql                    # MySQL schema (9 tables)
│   ├── api/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── server.js               # Express API (308 lines)
│   └── frontend/
│       ├── Dockerfile
│       └── nginx.conf              # SPA + API proxy config
├── supabase/
│   ├── config.toml
│   ├── migrations/                 # DB migrations (auto)
│   └── functions/                  # Edge functions
│       ├── verify-domain-dns/
│       ├── recheck-domains-dns/
│       ├── set-profile-password/
│       └── verify-profile-password/
├── DOCKER_SELF_HOST.md             # Docker deployment guide
├── SELF_HOSTING_GUIDE.md           # General self-hosting
├── SUPABASE_SETUP.md               # Supabase setup
├── DATABASE_EXPORT.md              # Data export guide
└── DEVELOPER_HANDOFF.md            # ★ THIS FILE
```

---

## 5. Environment Variables

### Cloud Mode (Lovable)
These are auto-configured:
```env
VITE_SUPABASE_URL=https://bjkfzcexylofmmupvvxt.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=bjkfzcexylofmmupvvxt
```

### Self-Hosted Mode
Create `docker/.env` from `docker/.env.example`:

```env
# Database
MYSQL_ROOT_PASSWORD=change_me_root_password
MYSQL_DATABASE=linkbio
MYSQL_USER=linkbio_user
MYSQL_PASSWORD=change_me_user_password

# API
JWT_SECRET=change_me_to_a_long_random_string
PORT=3001

# Frontend
VITE_API_URL=http://your-server-ip:3001
VITE_API_MODE=rest          # ← THIS SWITCHES THE API CLIENT

# Branding (White-Label)
APP_NAME=LinkBio
APP_DOMAIN=yourdomain.com
PRIMARY_COLOR=#6366f1
```

### The critical variable: `VITE_API_MODE`
- **`supabase`** (default) — Uses Supabase SDK for all operations
- **`rest`** — Uses the self-hosted Express API at `VITE_API_URL`

---

## 6. Database Schema

### Tables (9 total)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` (self-host) / `auth.users` + `profiles` (Supabase) | User accounts | id, email, password_hash, full_name, avatar_url, is_suspended |
| `user_roles` | Role-based access | user_id, role (super_admin/admin/client) |
| `link_profiles` | Bio profile pages | user_id, username, display_name, bio, avatar_url, background_type, custom_colors, is_public, is_password_protected |
| `blocks` | Content blocks on profiles | profile_id, type, title, url, content (JSON), button_style (JSON), position, is_enabled, is_featured |
| `block_leads` | Visitor data from data gates | block_id, profile_id, visitor_id, name, email, phone |
| `analytics_events` | View/click tracking | profile_id, block_id, event_type, visitor_id, referrer, browser, device_type, country |
| `custom_domains` | Custom domain mapping | profile_id, domain, status, dns_verified, verification_token, is_primary |
| `admin_settings` | Platform-wide config | setting_key, setting_value (JSON), updated_by |
| `audit_logs` | Activity tracking | user_id, action, entity_type, entity_id, details (JSON) |

### Complete MySQL Schema
See `docker/init.sql` for the full schema with indexes and foreign keys.

### Supabase Schema
Managed via migrations in `supabase/migrations/`. The TypeScript types are auto-generated in `src/integrations/supabase/types.ts`.

### RLS Policies (Supabase only)
- `link_profiles`: Public read for is_public profiles; owner CRUD
- `blocks`: Read via profile; owner CRUD
- `block_leads`: Public insert; owner read/delete
- `analytics_events`: Public insert; owner read
- `custom_domains`: Owner CRUD
- `admin_settings`: Admin read/write
- `user_roles`: Own read; admin write

---

## 7. Authentication

### Supabase Mode
- Uses Supabase Auth (email/password)
- Session stored in localStorage via Supabase SDK
- `AuthContext.tsx` provides `user`, `session`, `signUp`, `signIn`, `signOut`
- New users get a `profiles` row + `user_roles` row via database trigger (`handle_new_user()`)
- Email verification is required (not auto-confirmed)

### Self-Hosted Mode
- JWT-based auth (jsonwebtoken + bcrypt)
- Token stored in localStorage as `auth_token`
- Express middleware verifies JWT on protected routes
- `adminOnly` middleware checks `user_roles` table
- Signup creates `users` row + `user_roles` row with 'client' role

### Role Hierarchy
```
super_admin → Full platform control, all settings, all admin features
    admin   → Moderate users, view all data, limited settings
    client  → Own profile management only (dashboard)
```

### Creating First Super Admin

**Supabase:**
```sql
INSERT INTO public.user_roles (user_id, role) 
VALUES ('YOUR_USER_UUID', 'super_admin');
```

**Self-Hosted (MySQL):**
```sql
-- Find your user ID first
SELECT id, email FROM users;
-- Then assign role
INSERT INTO user_roles (id, user_id, role) VALUES (UUID(), 'YOUR_USER_ID', 'super_admin');
```

---

## 8. API Client Wrapper

**File: `src/lib/api-client.ts`**

This is the switchable API layer. Import it as:
```typescript
import { api } from '@/lib/api-client';
```

### Usage Examples

```typescript
// Auth
await api.auth.signUp('user@example.com', 'password', 'John Doe');
await api.auth.signIn('user@example.com', 'password');
await api.auth.signOut();
const user = await api.auth.getUser();

// Profiles
const profile = await api.profiles.getByUsername('john');
const myProfile = await api.profiles.getMine();
await api.profiles.create('myusername');
await api.profiles.update(profileId, { display_name: 'New Name' });

// Blocks
const blocks = await api.blocks.getByProfile(profileId);
await api.blocks.create({ profile_id: id, type: 'link', title: 'My Link', url: 'https://...' });
await api.blocks.update(blockId, { title: 'Updated' });
await api.blocks.delete(blockId);
await api.blocks.reorder([{ id: 'a', position: 0 }, { id: 'b', position: 1 }]);

// Leads
await api.leads.submit({ block_id: '...', profile_id: '...', email: 'visitor@example.com' });
const leads = await api.leads.getMine(profileId);
await api.leads.delete(leadId);

// Analytics
await api.analytics.track({ profile_id: '...', event_type: 'view', browser: 'Chrome' });
const events = await api.analytics.getMine(profileId);

// Storage
const url = await api.storage.upload(file, `user123/avatar.jpg`);

// Admin
const users = await api.admin.getUsers();
await api.admin.setUserRole(userId, 'admin');
await api.admin.suspendUser(userId, true);
```

### Switching Modes
Set `VITE_API_MODE=rest` and `VITE_API_URL=http://your-server:3001` in your `.env` to switch from Supabase to self-hosted.

### Migration Strategy
The existing hooks (`useLinkProfile`, `useAnalytics`, etc.) still use Supabase directly. To fully migrate:
1. Replace direct `supabase` imports in hooks with `api.*` calls
2. Or keep hooks as-is for Supabase mode and only use `api-client.ts` for the self-hosted build

---

## 9. Self-Hosted Deployment

### Prerequisites
- Ubuntu Server (20.04+)
- Docker & Docker Compose installed
- Portainer installed (optional but recommended)

### Quick Start

```bash
# 1. Copy project to server
scp -r . user@your-server:/opt/linkbio/

# 2. Configure environment
cd /opt/linkbio/docker
cp .env.example .env
nano .env  # Set passwords, domain, branding

# 3. Deploy
docker compose up -d --build
```

### Via Portainer
1. Open Portainer → **Stacks** → **Add Stack**
2. Name: `linkbio`
3. Upload `docker/docker-compose.yml`
4. Set environment variables from `.env`
5. Click **Deploy the stack**

### Services After Deployment

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| MySQL 8 | `linkbio-db` | 3306 | Database (persistent volume) |
| Node.js API | `linkbio-api` | 3001 | REST API with JWT auth |
| Nginx | `linkbio-frontend` | 80/443 | Static SPA + API proxy |

### SSL/HTTPS
Add Nginx Proxy Manager (available as Portainer stack):
```yaml
npm:
  image: jc21/nginx-proxy-manager:latest
  ports:
    - "80:80"
    - "443:443"
    - "81:81"
  volumes:
    - npm_data:/data
    - npm_letsencrypt:/etc/letsencrypt
```
Then configure SSL certificates via the NPM UI at `:81`.

### Updating
```bash
cd /opt/linkbio
git pull
cd docker
docker compose up -d --build
```

---

## 10. Admin vs User Separation

### Route Structure
| Route | Access | Layout | Purpose |
|-------|--------|--------|---------|
| `/` | Public | — | Landing page |
| `/auth` | Public | — | Login / Signup |
| `/:username` | Public | — | Public profile view |
| `/dashboard` | Authenticated | DashboardLayout | User's own profile management |
| `/dashboard/links` | Authenticated | DashboardLayout | Manage blocks |
| `/dashboard/design` | Authenticated | DashboardLayout | Theme & design |
| `/dashboard/analytics` | Authenticated | DashboardLayout | View own analytics |
| `/dashboard/leads` | Authenticated | DashboardLayout | View collected leads |
| `/dashboard/profile` | Authenticated | DashboardLayout | Edit profile info |
| `/dashboard/settings` | Authenticated | DashboardLayout | Account settings |
| `/admin` | Admin only | AdminLayout | Platform overview |
| `/admin/users` | Admin only | AdminLayout | User management |
| `/admin/analytics` | Admin only | AdminLayout | Platform-wide analytics |
| `/admin/moderation` | Admin only | AdminLayout | Content moderation |
| `/admin/domains` | Admin only | AdminLayout | Domain management |
| `/admin/settings` | Admin only | AdminLayout | Platform settings |

### How Role Check Works

**Frontend** (`App.tsx`):
```typescript
function ProtectedRoute({ requireAdmin }) {
  // If requireAdmin, calls supabase.rpc('is_admin', { _user_id: user.id })
  // Redirects to /dashboard if not admin
}
```

**Self-Hosted API** (`server.js`):
```javascript
async function adminOnly(req, res, next) {
  const [rows] = await pool.query(
    "SELECT role FROM user_roles WHERE user_id = ? AND role IN ('admin','super_admin')",
    [req.user.id]
  );
  if (rows.length === 0) return res.status(403).json({ error: 'Admin access required' });
  next();
}
```

---

## 11. White-Labeling

### Option A: Environment-Based (Recommended for Home Server)

Deploy multiple instances with different `.env` files:

```env
# Instance 1: MyLinks
APP_NAME=MyLinks
APP_DOMAIN=mylinks.com
PRIMARY_COLOR=#3b82f6
VITE_API_URL=https://api.mylinks.com

# Instance 2: BrandLinks
APP_NAME=BrandLinks
APP_DOMAIN=brandlinks.io
PRIMARY_COLOR=#ef4444
VITE_API_URL=https://api.brandlinks.io
```

In Portainer: duplicate the stack with different env vars for each brand.

Each instance gets its own:
- Database (separate MySQL or shared with different DB name)
- API server
- Frontend with custom branding
- File storage volume

### Option B: Database-Driven Branding (Advanced)

For a single deployment serving multiple brands:
1. Store brand config in `admin_settings`:
   ```sql
   INSERT INTO admin_settings (id, setting_key, setting_value)
   VALUES (UUID(), 'brand_config', '{"name":"MyBrand","color":"#6366f1","logo":"/uploads/logo.png"}');
   ```
2. Frontend reads `/api/admin/settings` on load
3. Domain detection routes to correct brand config

---

## 12. Custom Domains

### How It Works
1. User adds a domain in Dashboard → Settings
2. System generates a verification token
3. User adds DNS records:
   - **A Record**: Points to server IP (`72.61.227.134`)
   - **TXT Record**: `_linkbio` → `linkbio_verify=<token>`
4. Edge function `verify-domain-dns` checks DNS records
5. Once verified, status changes to `active`
6. `DomainRouter` component detects custom domains and routes to correct profile

### Edge Functions for Domains
- `verify-domain-dns`: Verifies A + TXT records
- `recheck-domains-dns`: Batch re-check all pending domains

### Nginx Config for Custom Domains (Self-Hosted)
The `docker/frontend/nginx.conf` acts as a catch-all server. The React app's `DomainRouter` handles domain → profile mapping client-side.

---

## 13. File Storage

### Supabase Mode
- Uses Supabase Storage bucket `profile-images` (public)
- Files stored at: `{user_id}/{folder}/{timestamp}.{ext}`
- Component: `src/components/ImageUpload.tsx`
- Max file size: 5MB
- Accepted: image/* only

### Self-Hosted Mode
- Files stored in Docker volume at `/app/uploads`
- Nginx serves from `/uploads/` path
- Express multer middleware handles multipart uploads
- Max file size: 10MB
- Endpoint: `POST /api/upload` (requires auth)

---

## 14. Analytics & Tracking

### Events Tracked
| Event | Trigger | Data Collected |
|-------|---------|----------------|
| `view` | Profile page load | visitor_id, device_type, browser, referrer |
| `click` | Block link clicked | block_id, visitor_id, device_type, browser |
| `ad_impression` | Ad displayed | block_id, ad_type |
| `ad_click` | Ad clicked | block_id, ad_type |
| `ad_reward` | Rewarded ad completed | block_id |

### Visitor ID
Generated client-side and stored in localStorage (`linksdc_visitor_id`). Format: `v_{timestamp}_{random}`.

### Analytics Dashboard
Located at `/dashboard/analytics`. Shows:
- Total views & unique visitors
- Country breakdown with flags
- Device breakdown (mobile/tablet/desktop)
- Referrer sources
- Real-time updates via Supabase Realtime (cloud mode only)

---

## 15. Data Collection Gate

### How It Works
1. Profile owner enables "Data Collection" on a block (link, download, shop, featured, video)
2. Visitor clicks the block → modal appears asking for name/email/phone
3. Required fields are configurable per block
4. After submission, data is saved to `block_leads` table
5. Visitor ID is stored in localStorage to avoid re-prompting
6. Original action (open link, start download) executes after form submission

### Configuration (stored in `blocks.content` JSON)
```json
{
  "data_gate_enabled": true,
  "data_gate_fields": ["name", "email"],
  "data_gate_title": "Enter your info to continue"
}
```

### Leads Dashboard
Located at `/dashboard/leads`. Features:
- Total leads, today's count, unique emails/phones
- Filter by block
- Search by name/email/phone
- CSV export
- Delete individual leads

---

## 16. Block Types

| Type | Description | Key Fields |
|------|-------------|------------|
| `link` | External URL | url, title, icon, thumbnail_url |
| `video` | YouTube/Vimeo embed | content.video_type, url |
| `music` | Spotify/SoundCloud embed | url |
| `shop` | Product card with price | content.price, content.currency, url |
| `featured` | Highlighted card | title, subtitle, url, thumbnail_url |
| `download` | File download | content.file_url, content.file_name |
| `carousel` | Image carousel | content.images[] |
| `contact` | Contact form | content.fields[] |
| `html` | Raw HTML block | content.html |
| `text` | Rich text block | content.text |
| `image` | Image display | thumbnail_url, url |
| `scheduled` | Time-limited block | schedule_start, schedule_end |

Each block can have:
- `button_style` JSON: Custom colors, border radius
- `is_featured`: Larger display
- `open_in_new_tab`: Link behavior
- `mobile_only` / `desktop_only`: Device targeting
- Data collection gate: `content.data_gate_enabled`

---

## 17. Edge Functions

Located in `supabase/functions/`:

| Function | Purpose | Auth Required |
|----------|---------|---------------|
| `verify-domain-dns` | Check DNS A + TXT records for a domain | Yes |
| `recheck-domains-dns` | Batch re-verify all pending domains | No (cron) |
| `set-profile-password` | Hash and store profile password | Yes |
| `verify-profile-password` | Verify visitor password for protected profiles | No |

### For Self-Hosted
These functions' logic is replicated in `docker/api/server.js`. The DNS verification would need a DNS lookup library (e.g., `dns` module in Node.js).

---

## 18. Frontend Pages & Routing

### Key Components

**`PublicProfilePage.tsx`** (~1400 lines) — The main public-facing page. Handles:
- Profile fetching
- Password protection
- Custom domain redirects
- Analytics tracking
- Block rendering (all types)
- Data collection gate integration
- Theme application

**`DashboardPage.tsx`** — Routes to sub-pages:
- Overview, Links, Design, Analytics, Leads, Profile, Settings

**`AdminPage.tsx`** — Routes to admin sub-pages:
- Overview, Users, Analytics, Moderation, Blocks, Domains, Design System, Settings, Audit

---

## 19. Theming & Design System

### Profile Themes
Stored in `link_profiles.custom_colors` as JSON:
```json
{
  "bg": "#ffffff",
  "text": "#1a1a1a",
  "accent": "#6366f1",
  "cardBg": "rgba(255,255,255,0.95)",
  "gradient": false,
  "buttonRadius": 16,
  "buttonStyle": "filled"
}
```

### Background Types
- `solid`: Single color
- `gradient`: CSS gradient string
- `image`: Background image URL

### App Theme
Uses Tailwind CSS with CSS variables in `index.css`. Key tokens:
- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--muted`, `--accent`, `--destructive`
- `--card`, `--border`, `--ring`

---

## 20. AdMob & Ads

### Google AdSense
Component: `src/components/ads/AdSenseAd.tsx`
Configured in `src/config/admob.ts`

### Rewarded Ads
Component: `src/components/ads/RewardedAdWrapper.tsx`
Used on download blocks — user watches ad before downloading.

### Ad Analytics
Hook: `src/hooks/useAdAnalytics.ts`
Tracks impressions, clicks, rewards via `analytics_events` table.

---

## 21. Development Workflow

### Local Development (Cloud Mode)
```bash
npm install
npm run dev
# Opens at http://localhost:5173
# Uses Supabase for backend
```

### Local Development (Self-Hosted Mode)
```bash
# Terminal 1: Start backend
cd docker
docker compose up -d

# Terminal 2: Start frontend
VITE_API_MODE=rest VITE_API_URL=http://localhost:3001 npm run dev
```

### Key Scripts
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

---

## 22. Testing

### Manual Testing Checklist
- [ ] Sign up new user → verify email → login
- [ ] Create profile with username
- [ ] Add each block type
- [ ] Enable data collection on a block → test public gate
- [ ] Check analytics dashboard
- [ ] Check leads dashboard
- [ ] Test custom domain flow
- [ ] Test password protection
- [ ] Test admin panel (assign admin role first)
- [ ] Test theme customization
- [ ] Test drag-and-drop block reordering
- [ ] Test file uploads (avatar, cover, thumbnails)
- [ ] Test public profile on mobile

---

## 23. Backup & Restore

### Supabase
Use the Database Export section in Dashboard Settings, or:
```sql
-- Export via Supabase dashboard → SQL Editor
```

### Self-Hosted MySQL

**Backup:**
```bash
docker exec linkbio-db mysqldump -u linkbio_user -p linkbio > backup_$(date +%Y%m%d).sql
```

**Restore:**
```bash
docker exec -i linkbio-db mysql -u linkbio_user -p linkbio < backup.sql
```

**Backup uploads:**
```bash
docker cp linkbio-api:/app/uploads ./backup-uploads/
```

---

## 24. Troubleshooting

| Issue | Solution |
|-------|---------|
| API can't connect to MySQL | Check `DB_HOST=mysql` in env, ensure MySQL container is healthy |
| Uploads not showing | Check volume mount in docker-compose, verify Nginx serves `/uploads/` |
| CORS errors | Ensure `VITE_API_URL` matches actual API URL |
| "Email already exists" | User already signed up, use login |
| Admin panel 403 | Assign admin role via SQL |
| Custom domain not working | Check A record points to server IP, TXT record has correct token |
| Profile not found | Check `is_public` is true, username is correct |
| Data gate not showing | Ensure `content.data_gate_enabled` is true in block |
| Analytics not updating | Check RLS policies allow inserts to `analytics_events` |
| JWT expired | Token validity is 7 days; user must re-login |
| File upload fails | Check file size < 5MB (Supabase) or < 10MB (self-hosted) |

---

## 25. Migration: Supabase to Self-Hosted

### Step-by-Step

1. **Export data from Supabase:**
   ```sql
   -- Run in Supabase SQL Editor
   COPY (SELECT * FROM link_profiles) TO STDOUT WITH CSV HEADER;
   COPY (SELECT * FROM blocks) TO STDOUT WITH CSV HEADER;
   COPY (SELECT * FROM analytics_events) TO STDOUT WITH CSV HEADER;
   COPY (SELECT * FROM block_leads) TO STDOUT WITH CSV HEADER;
   COPY (SELECT * FROM custom_domains) TO STDOUT WITH CSV HEADER;
   ```

2. **Download storage files:**
   - Use Supabase Dashboard → Storage → profile-images → download all

3. **Set up Docker stack:**
   ```bash
   cd docker && docker compose up -d --build
   ```

4. **Import data to MySQL:**
   - Transform CSV to MySQL INSERT statements
   - Users need new password hashes (bcrypt) since Supabase uses different auth

5. **Update frontend config:**
   ```env
   VITE_API_MODE=rest
   VITE_API_URL=http://your-server:3001
   ```

6. **Rebuild frontend:**
   ```bash
   docker compose up -d --build frontend
   ```

7. **Upload storage files:**
   ```bash
   docker cp ./backup-uploads/ linkbio-api:/app/uploads/
   ```

### Important Notes
- User passwords cannot be migrated (Supabase hashes differently). Users must reset passwords.
- Edge functions (domain verification, password protection) are replicated in `server.js`.
- Realtime features (live analytics) won't work in self-hosted mode without additional setup (WebSocket server).

---

## 26. API Reference

### Self-Hosted REST API Endpoints

#### Auth
| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/api/auth/signup` | No | `{email, password, full_name}` | `{token, user}` |
| POST | `/api/auth/login` | No | `{email, password}` | `{token, user}` |
| GET | `/api/auth/me` | Yes | — | `{id, email, full_name, roles}` |

#### Profiles
| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| GET | `/api/profiles/:username` | No | — | `{profile, blocks}` |
| GET | `/api/my/profile` | Yes | — | `{profile, blocks}` |
| POST | `/api/my/profile` | Yes | `{username}` | `{id, username}` |
| PUT | `/api/my/profile` | Yes | `{field: value, ...}` | `{success}` |

#### Blocks
| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/api/my/blocks` | Yes | `{type, title, url, content, ...}` | `{id}` |
| PUT | `/api/my/blocks/:id` | Yes | `{field: value, ...}` | `{success}` |
| DELETE | `/api/my/blocks/:id` | Yes | — | `{success}` |
| PUT | `/api/my/blocks/reorder` | Yes | `{order: [{id, position}]}` | `{success}` |

#### Leads
| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/api/leads` | No | `{block_id, profile_id, name, email, phone}` | `{id}` |
| GET | `/api/my/leads` | Yes | — | `[{lead}, ...]` |
| DELETE | `/api/my/leads/:id` | Yes | — | `{success}` |

#### Analytics
| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/api/analytics` | No | `{profile_id, event_type, ...}` | `{id}` |
| GET | `/api/my/analytics` | Yes | — | `[{event}, ...]` |

#### File Upload
| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/api/upload` | Yes | `multipart/form-data` | `{url}` |

#### Admin (requires admin/super_admin role)
| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| GET | `/api/admin/users` | Admin | — | `[{user}, ...]` |
| PUT | `/api/admin/users/:id/role` | Admin | `{role}` | `{success}` |
| PUT | `/api/admin/users/:id/suspend` | Admin | `{suspended}` | `{success}` |
| GET | `/api/admin/settings` | Admin | — | `[{setting}, ...]` |
| PUT | `/api/admin/settings/:key` | Admin | `{value}` | `{success}` |

#### Health
| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/api/health` | No | `{status: 'ok', app: 'LinkBio'}` |

---

## Summary for Antigravity

1. **To run as-is (cloud):** Just use Lovable — everything works.
2. **To deploy on home server:** Use the `docker/` folder with Portainer. Set env vars, deploy stack, assign super_admin role via SQL.
3. **To switch frontend to self-hosted API:** Set `VITE_API_MODE=rest` + `VITE_API_URL`. Use the `api-client.ts` wrapper.
4. **To white-label:** Duplicate the Docker stack with different `.env` per brand.
5. **To add features:** Follow existing patterns — create block editor, add to `BlockEditor.tsx` router, update `PublicProfilePage.tsx` renderer.

**Contact:** All code is in this repo. The database schema, API endpoints, auth flow, and deployment are fully documented above.
