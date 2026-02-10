# LinkBio Self-Hosted Docker Deployment Guide

Complete guide for deploying LinkBio on your own home server using Docker and Portainer.

---

## Architecture

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

## Quick Start (Portainer)

### 1. Copy Files to Server

```bash
scp -r docker/ user@your-server:/opt/linkbio/
scp -r . user@your-server:/opt/linkbio/app/  # Full app source
```

### 2. Configure Environment

```bash
cd /opt/linkbio/docker
cp .env.example .env
nano .env  # Set your passwords, domain, branding
```

### 3. Deploy via Portainer

1. Open Portainer → **Stacks** → **Add Stack**
2. Name: `linkbio`
3. Choose **Upload** and select `docker/docker-compose.yml`
4. Or paste the compose file contents
5. Add environment variables from `.env`
6. Click **Deploy the stack**

### 4. Deploy via CLI (Alternative)

```bash
cd /opt/linkbio/docker
docker compose up -d --build
```

---

## Services

| Service | Port | Description |
|---------|------|-------------|
| MySQL 8 | 3306 | Database (persistent volume) |
| Node.js API | 3001 | REST API with JWT auth |
| Nginx | 80/443 | Static SPA + API proxy + uploads |

---

## Database Schema

The `init.sql` file creates all 9 tables automatically on first run:

| Table | Purpose |
|-------|---------|
| `users` | Authentication (email/password) |
| `user_roles` | Role-based access (super_admin, admin, client) |
| `link_profiles` | User link-in-bio profiles |
| `blocks` | Links, products, videos, etc. |
| `block_leads` | Data collection gate submissions |
| `analytics_events` | Page views and click tracking |
| `custom_domains` | Custom domain management |
| `admin_settings` | Platform-wide settings |
| `audit_logs` | Activity tracking |

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Current user info |

### Profile & Blocks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/profiles/:username` | No | Public profile + blocks |
| GET | `/api/my/profile` | Yes | Own profile + blocks |
| POST | `/api/my/profile` | Yes | Create profile |
| PUT | `/api/my/profile` | Yes | Update profile |
| POST | `/api/my/blocks` | Yes | Add block |
| PUT | `/api/my/blocks/:id` | Yes | Update block |
| DELETE | `/api/my/blocks/:id` | Yes | Delete block |
| PUT | `/api/my/blocks/reorder` | Yes | Reorder blocks |

### Leads & Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/leads` | No | Submit lead (public) |
| GET | `/api/my/leads` | Yes | Own leads |
| DELETE | `/api/my/leads/:id` | Yes | Delete lead |
| POST | `/api/analytics` | No | Track event |
| GET | `/api/my/analytics` | Yes | Own analytics |

### Admin (requires admin/super_admin role)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/users` | Admin | List all users |
| PUT | `/api/admin/users/:id/role` | Admin | Change user role |
| PUT | `/api/admin/users/:id/suspend` | Admin | Suspend/unsuspend |
| GET | `/api/admin/settings` | Admin | Get settings |
| PUT | `/api/admin/settings/:key` | Admin | Update setting |

### File Upload
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/upload` | Yes | Upload file (multipart) |

---

## Admin vs User Separation

The app has a clear role hierarchy:

| Role | Dashboard Access | Admin Panel | Capabilities |
|------|-----------------|-------------|-------------|
| `client` | `/dashboard/*` | ❌ | Manage own profile, blocks, leads |
| `admin` | `/dashboard/*` | `/admin/*` | + Moderate users, view all data |
| `super_admin` | `/dashboard/*` | `/admin/*` | + Full platform control, settings |

### Creating the First Super Admin

After deployment, run this SQL:

```sql
-- Find your user ID
SELECT id, email FROM users;

-- Assign super_admin role
INSERT INTO user_roles (id, user_id, role)
VALUES (UUID(), 'YOUR_USER_ID', 'super_admin');
```

Or via Portainer → Container `linkbio-db` → Console:
```bash
mysql -u linkbio_user -p linkbio
```

After that, you can promote other users from the Admin Panel UI.

---

## White-Label / Multi-Site Deployment

### Option A: Environment-Based Branding (Recommended)

Deploy multiple branded instances with different `.env` files:

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

In Portainer: **Duplicate the stack** with different environment variables for each brand.

Each instance gets its own:
- Database (separate MySQL or shared with different DB names)
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

## Storage

Files are stored in a Docker volume mounted at `/app/uploads` in the API container and served via Nginx at `/uploads/`.

To back up uploads:
```bash
docker cp linkbio-api:/app/uploads ./backup-uploads/
```

---

## Database Backup & Restore

### Backup
```bash
docker exec linkbio-db mysqldump -u linkbio_user -p linkbio > backup.sql
```

### Restore
```bash
docker exec -i linkbio-db mysql -u linkbio_user -p linkbio < backup.sql
```

---

## SSL/HTTPS (Let's Encrypt)

Add a reverse proxy like Nginx Proxy Manager (available in Portainer) or Traefik:

```bash
# Add to docker-compose.yml or deploy separately
npm:
  image: jc21/nginx-proxy-manager:latest
  ports:
    - "80:80"
    - "443:443"
    - "81:81"  # Admin UI
  volumes:
    - npm_data:/data
    - npm_letsencrypt:/etc/letsencrypt
```

Then point your domain to the server and configure SSL in the Nginx Proxy Manager UI at `:81`.

---

## Updating

```bash
cd /opt/linkbio
git pull  # or upload new files
cd docker
docker compose up -d --build
```

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| API can't connect to MySQL | Check `DB_HOST=mysql` in env, ensure MySQL is healthy |
| Uploads not showing | Check volume mount in docker-compose |
| CORS errors | Ensure `VITE_API_URL` matches actual API URL |
| "Email already exists" | User already signed up, use login |
| Admin panel 403 | Assign admin role via SQL (see above) |
