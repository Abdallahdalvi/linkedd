# Hostinger Deployment Guide

## Overview
This guide covers deploying the Link-in-Bio app to Hostinger shared hosting with manual custom domain support.

---

## 🔧 Admin Guide

### Prerequisites
- Hostinger hosting account with hPanel access
- Domain(s) pointed to Hostinger nameservers
- FTP access or File Manager access

### Step 1: Build the App
```bash
npm install
npm run build
```
This creates a `/dist` folder with all static files.

### Step 2: Upload to Hostinger

1. **Login to hPanel** → Go to **Files** → **File Manager**
2. Navigate to `public_html` folder
3. **Upload all contents** from `/dist` folder
4. Ensure `.htaccess` file is uploaded (enables SPA routing)

### Step 3: Configure Main Domain

1. In hPanel → **Domains** → **Domain Management**
2. Point your main domain to `public_html`
3. **Install SSL**: Go to **SSL** → **Install SSL** → Select domain → Install

### Step 4: Find Your Server IP

1. In hPanel → **Hosting** → **Details**
2. Note the **Server IP** (e.g., `153.92.xxx.xxx`)
3. **Update `src/config/domain.ts`** with this IP before building

### Step 5: Configure Environment Variables

Create `.env` file with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_MAIN_DOMAIN=yourdomain.com
VITE_APP_NAME=linkbio
```

### Step 6: Add Supabase Secrets

In Supabase Dashboard → **Settings** → **Edge Functions** → **Secrets**:
```
HOSTINGER_SERVER_IP=your_hostinger_ip
APP_NAME=linkbio
```

---

## 🌐 Adding Custom Domains (Admin)

When a user's domain shows **"Waiting for Activation"** status:

### Step 1: Add Domain in Hostinger

1. hPanel → **Domains** → **Add Domain**
2. Select **Addon Domain**
3. Enter the custom domain (e.g., `userdomain.com`)
4. Point it to `public_html` (same folder as main domain)

### Step 2: Install SSL

1. hPanel → **SSL** → **Install SSL**
2. Select the new domain
3. Click **Install** (Let's Encrypt - free)

### Step 3: Activate in Database

Update the domain status in Supabase:
```sql
UPDATE custom_domains 
SET status = 'active_manual', ssl_status = 'active'
WHERE domain = 'userdomain.com';
```

Or use the Admin panel if available.

---

## 👤 User Guide

### How to Connect Your Custom Domain

1. **Go to Settings** → **Custom Domains** → **Add Domain**
2. Enter your domain (e.g., `yourname.com`)
3. Follow the wizard to configure DNS

### DNS Records to Add

At your domain registrar (GoDaddy, Namecheap, etc.):

| Type | Name | Value |
|------|------|-------|
| A | @ | `[SERVER_IP shown in wizard]` |
| A | www | `[SERVER_IP shown in wizard]` |
| TXT | _linkbio | `linkbio_verify=[your token]` |

### How Long Does It Take?

- **DNS Propagation**: 15 minutes to 48 hours
- **Verification**: Instant once DNS propagates
- **Activation**: Admin approval required (usually within 24 hours)

### Domain Status Meanings

| Status | Meaning |
|--------|---------|
| **Pending DNS Setup** | Add the DNS records shown |
| **Waiting for Activation** | DNS verified! Admin will activate soon |
| **Active** | Your domain is live! |
| **DNS Failed** | Check your DNS settings and retry |
| **Rejected** | Contact support for details |

### Check DNS Propagation

Use [dnschecker.org](https://dnschecker.org) to verify your DNS records are propagating.

---

## ⚠️ Limitations on Shared Hosting

| Feature | Status | Notes |
|---------|--------|-------|
| Static hosting | ✅ Works | Full support |
| SPA routing | ✅ Works | Via .htaccess |
| Custom domains | ✅ Works | Manual activation required |
| SSL certificates | ✅ Works | Via Hostinger Let's Encrypt |
| Auto-SSL provisioning | ❌ N/A | Admin must install manually |
| Wildcard domains | ❌ N/A | Not supported on shared hosting |
| Auto-scaling | ❌ N/A | Fixed resources |

---

## 📋 Deployment Checklist

- [ ] Update `SERVER_IP` in `src/config/domain.ts`
- [ ] Update `VITE_MAIN_DOMAIN` in `.env`
- [ ] Run `npm run build`
- [ ] Upload `/dist` contents to `public_html`
- [ ] Verify `.htaccess` is uploaded
- [ ] Install SSL for main domain
- [ ] Add Supabase edge function secrets
- [ ] Test main domain loads correctly
- [ ] Test SPA routing works (`/username` routes)

---

## 🔄 Domain Status Flow

```
┌─────────────────┐
│  User adds      │
│  domain         │
└────────┬────────┘
         ▼
┌─────────────────┐
│  pending_dns    │ ◄── User configures DNS
└────────┬────────┘
         ▼
┌─────────────────┐
│  User clicks    │
│  "Verify"       │
└────────┬────────┘
         ▼
    ┌────┴────┐
    │  DNS    │
    │ Valid?  │
    └────┬────┘
    Yes  │  No
    ▼    ▼
┌───────┐ ┌───────┐
│verified│ │failed │
│  _dns  │ │       │
└───┬───┘ └───────┘
    ▼
┌─────────────────┐
│  Admin adds     │
│  domain in      │
│  Hostinger      │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Admin sets     │
│  active_manual  │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Domain Live!   │
└─────────────────┘
```
