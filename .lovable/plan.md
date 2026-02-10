

# Comprehensive Update Plan

This plan covers 4 major areas: extending data collection to more block types, adding a Leads dashboard, creating a Docker-based self-hosting package, and guidance on white-labeling and admin/user separation.

---

## Part 1: Add Data Collection to Shop, Featured, and Video Block Editors

The `DataCollectionSettings` component already exists and is used in `LinkBlockEditor` and `DownloadBlockEditor`. The same pattern will be applied to the remaining 3 editors.

### Changes:
- **ShopBlockEditor.tsx**: Import `DataCollectionSettings`, add `dataCollection` state initialized from `block.content`, merge into `content` on save
- **FeaturedBlockEditor.tsx**: Same pattern -- add `DataCollectionSettings` component before the submit buttons, merge data collection config into a new `content` field on save
- **VideoBlockEditor.tsx**: Same pattern -- add `DataCollectionSettings`, merge into existing `content` object (alongside `video_type`)

Each editor will follow the exact same pattern already established in `LinkBlockEditor`:
1. Extract existing content from `block?.content`
2. Initialize `dataCollection` state with defaults
3. Merge `...dataCollection` into the `content` object on submit
4. Render `<DataCollectionSettings>` before the action buttons

---

## Part 2: Leads Dashboard Page

A new dashboard page to view all collected visitor data (from `block_leads` table).

### New Files:
- **src/pages/dashboard/DashboardLeadsPage.tsx** -- Main leads page with:
  - Summary stats: total leads, leads today, unique emails, unique phones
  - Filter by block (dropdown of user's blocks that have data gate enabled)
  - Table showing: Name, Email, Phone, Block Title, Submitted Date
  - Export to CSV button
  - Delete individual lead entries

### Modified Files:
- **DashboardLayout.tsx** -- Add "Leads" nav item with `ClipboardList` icon (between Analytics and Profile)
- **DashboardPage.tsx** -- Add route for `/dashboard/leads` mapping to the new page
- **App.tsx** -- No changes needed (already catches `/dashboard/*`)

### Data Fetching:
```sql
SELECT bl.*, b.title as block_title, b.type as block_type 
FROM block_leads bl 
JOIN blocks b ON bl.block_id = b.id 
JOIN link_profiles lp ON bl.profile_id = lp.id 
WHERE lp.user_id = auth.uid()
ORDER BY bl.created_at DESC
```

---

## Part 3: Docker-Based Self-Hosting Package

Create comprehensive Docker Compose setup that packages everything for one-command deployment on your home server with Portainer.

### New File: `DOCKER_SELF_HOST.md`

Complete guide covering:

### Docker Compose Stack:
```text
Services:
+------------------+     +------------------+     +------------------+
|   Nginx          |---->|   Node.js API    |---->|   MySQL 8        |
|   (Port 80/443)  |     |   (Port 3001)    |     |   (Port 3306)    |
|   + Static Files |     |   Express.js     |     |   Persistent Vol |
+------------------+     +------------------+     +------------------+
                                |
                          +------------------+
                          |   File Storage   |
                          |   (Volume Mount) |
                          +------------------+
```

### New Files to Create:
- **docker/docker-compose.yml** -- Complete stack definition with MySQL 8, Node.js API, Nginx
- **docker/Dockerfile.api** -- Node.js Express API server image
- **docker/Dockerfile.frontend** -- Build React app + Nginx serve
- **docker/nginx/default.conf** -- Nginx config for SPA + API proxy + custom domains
- **docker/api/server.js** -- Complete Express.js backend (evolved from HOME_SERVER_SETUP.md) with:
  - All REST endpoints for profiles, blocks, analytics, leads, domains, admin
  - JWT authentication
  - File upload handling (multer + local storage)
  - Role-based middleware
  - block_leads endpoints (new)
- **docker/api/package.json** -- API dependencies
- **docker/.env.example** -- Template environment file
- **docker/init.sql** -- Complete MySQL schema (updated with block_leads table)

### Database Schema Updates for Self-Host:
The `init.sql` will include all 9 tables: profiles, user_roles, link_profiles, blocks, custom_domains, analytics_events, audit_logs, admin_settings, block_leads

### Authentication Strategy:
- JWT-based auth (bcrypt for passwords, jsonwebtoken for tokens)
- Same signup/login flow, token stored in localStorage
- Middleware checks for admin routes

### Storage Strategy:
- Local file system mounted as Docker volume at `/app/uploads`
- Nginx serves static uploads from `/uploads/` path
- Multer handles multipart uploads in the API

### Portainer Deployment Instructions:
1. Copy the `docker/` folder to your server
2. In Portainer: Stacks > Add Stack > Upload docker-compose.yml
3. Set environment variables
4. Deploy

---

## Part 4: Admin vs User Separation & White-Labeling

### Admin vs User Separation (already partially implemented):
The current setup already separates admin and user dashboards:
- `/dashboard/*` -- User routes (all users)
- `/admin/*` -- Admin routes (requires admin role via `is_admin` RPC)

**Additional guidance in the docs:**
- Admin panel at `/admin` manages all users, moderation, settings
- User dashboard at `/dashboard` manages only their own profile
- Role assignment is done via `user_roles` table (super_admin, admin, client)
- For self-hosted: admin creates first super_admin via SQL, then can promote others from the admin panel

### White-Label / Multi-Site Strategy:

The guide will document how to deploy multiple branded instances:

**Option A: Environment-Based Branding (Simplest)**
- Each deployment uses different env vars for branding:
  - `APP_NAME`, `APP_LOGO_URL`, `PRIMARY_COLOR`, `MAIN_DOMAIN`
- One Docker image, different `.env` files per client
- In Portainer: duplicate the stack with different env vars

**Option B: Database-Driven Branding (Advanced)**
- Store brand config in `admin_settings` table
- Frontend reads branding on load
- Single deployment serves multiple brands via domain detection

The guide will focus on Option A as it's the most practical for your setup.

---

## Summary of All File Changes

### New Files (7):
1. `src/pages/dashboard/DashboardLeadsPage.tsx` -- Leads management page
2. `docker/docker-compose.yml` -- Complete Docker stack
3. `docker/Dockerfile.api` -- API server Docker image
4. `docker/Dockerfile.frontend` -- Frontend Docker image
5. `docker/nginx/default.conf` -- Nginx configuration
6. `docker/api/server.js` -- Complete Express.js API
7. `DOCKER_SELF_HOST.md` -- Comprehensive deployment guide with white-label and admin/user docs

### Modified Files (5):
1. `ShopBlockEditor.tsx` -- Add DataCollectionSettings
2. `FeaturedBlockEditor.tsx` -- Add DataCollectionSettings
3. `VideoBlockEditor.tsx` -- Add DataCollectionSettings
4. `DashboardLayout.tsx` -- Add Leads nav item
5. `DashboardPage.tsx` -- Add Leads route

