# Hosting & Domain Configuration Guide

This guide explains how to host the LinkBio application and configure custom domains.

## Overview

The application can be deployed to various hosting platforms. This guide covers deployment options and domain configuration.

---

## 1. Deployment Options

### Lovable (Recommended)

1. Click **Publish** in the Lovable editor
2. Your app is automatically deployed to `yourapp.lovable.app`
3. Custom domains can be configured in Project Settings

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build the app
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### VPS (Nginx)

1. Build the application:
   ```bash
   npm run build
   ```

2. Upload `dist/` folder to your server

3. Configure Nginx:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       root /var/www/linkbio/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

4. Enable SSL with Certbot:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

## 2. Domain Configuration

### DNS Records

Configure these DNS records at your domain registrar:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_SERVER_IP | 3600 |
| A | www | YOUR_SERVER_IP | 3600 |
| CNAME | api | your-supabase-project.supabase.co | 3600 |

### Subdomain Setup

For subdomains like `app.yourdomain.com`:

| Type | Name | Value |
|------|------|-------|
| A | app | YOUR_SERVER_IP |
| CNAME | www.app | app.yourdomain.com |

---

## 3. SSL Certificates

### Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

### Cloudflare SSL

1. Add domain to Cloudflare
2. Update nameservers at registrar
3. Enable **Full (strict)** SSL mode
4. Configure origin certificate if needed

---

## 4. CDN Configuration

### Cloudflare

1. Add your domain to Cloudflare
2. Configure caching rules:
   - Cache static assets (JS, CSS, images)
   - Bypass cache for API routes

3. Recommended settings:
   - Auto Minify: ON
   - Brotli: ON
   - Always Use HTTPS: ON

### AWS CloudFront

1. Create a CloudFront distribution
2. Set origin to your server/S3 bucket
3. Configure cache behaviors
4. Add custom domain with SSL

---

## 5. Environment Variables

### Production Environment

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# App Config
VITE_APP_URL=https://yourdomain.com
```

### Platform-Specific

**Vercel:**
Add variables in Project Settings → Environment Variables

**Netlify:**
Add in Site Settings → Build & Deploy → Environment

---

## 6. Performance Optimization

### Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-tabs'],
        },
      },
    },
  },
});
```

### Caching Headers

```nginx
# Nginx caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /index.html {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

---

## 7. Monitoring & Logging

### Health Checks

Add a health check endpoint:
```typescript
// Edge function: health-check
Deno.serve(() => {
  return new Response(JSON.stringify({ status: 'ok' }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Error Tracking

Integrate error tracking (e.g., Sentry):
```bash
npm install @sentry/react
```

---

## 8. Backup Strategy

### Automated Backups

1. **Database**: Enable Supabase Point-in-Time Recovery
2. **Code**: Use Git with regular pushes
3. **Assets**: Backup storage buckets weekly

### Disaster Recovery

1. Keep database backups in multiple locations
2. Document recovery procedures
3. Test recovery process quarterly

---

## 9. Security Checklist

- [ ] SSL/TLS enabled
- [ ] HTTP → HTTPS redirect
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] DDoS protection (Cloudflare)
- [ ] Regular security updates
- [ ] Database backups enabled

### Security Headers (Nginx)

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

## 10. Troubleshooting

### Common Issues

**404 on refresh:**
- Ensure SPA routing is configured
- Check `try_files $uri $uri/ /index.html;`

**SSL errors:**
- Verify certificate is valid
- Check certificate chain
- Ensure renewal is working

**Slow loading:**
- Enable compression (gzip/brotli)
- Use CDN for static assets
- Optimize images

---

## Quick Deploy Commands

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

---

## Need Help?

For hosting support, check platform-specific documentation or create an issue in the repository.
