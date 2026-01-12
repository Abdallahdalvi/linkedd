# Whitelabeling Guide

This guide explains how to whitelabel the LinkBio application for your own brand.

## Overview

Whitelabeling allows you to customize the application's branding, colors, and domain to match your organization's identity.

---

## 1. Branding Customization

### Logo & Favicon

1. Replace the logo files:
   - `public/favicon.png` - Browser tab icon (32x32 or 64x64 px)
   - `public/favicon.ico` - Legacy favicon support

2. Update the logo in components:
   - `src/components/layout/DashboardLayout.tsx` - Dashboard sidebar logo
   - `src/pages/LandingPage.tsx` - Landing page header logo

### App Name

Update the application name in these files:

```typescript
// src/components/layout/DashboardLayout.tsx
<span className="font-display font-bold text-xl">YourBrandName</span>

// index.html
<title>YourBrandName</title>
```

### Colors & Theme

1. Edit `src/index.css` to change the color palette:

```css
:root {
  --primary: 250 100% 50%;        /* Your brand primary color */
  --primary-foreground: 0 0% 100%;
  --secondary: 220 15% 96%;
  --accent: 250 100% 60%;
  /* ... other colors */
}
```

2. Update `tailwind.config.ts` if adding new color tokens.

---

## 2. Custom Domain Setup

### Self-Hosted Deployment

1. Deploy the built application to your server
2. Configure your web server (nginx/Apache) to serve the app
3. Set up SSL certificates (Let's Encrypt recommended)

### DNS Configuration

Point your domain to your server:

```
A     @       YOUR_SERVER_IP
A     www     YOUR_SERVER_IP
CNAME app     your-main-domain.com
```

---

## 3. Backend Configuration

### Environment Variables

Create a `.env` file with your credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### Database

Use the migration files in `supabase/migrations/` to set up your database schema.

---

## 4. Email Templates

Customize authentication emails in your Supabase dashboard:
- Confirmation email
- Password reset email
- Magic link email

---

## 5. Legal Pages

Update these files with your organization's information:
- Privacy Policy
- Terms of Service
- Cookie Policy

---

## 6. Analytics & Tracking

Replace analytics IDs in the application:
- Google Analytics
- Facebook Pixel
- Any other tracking services

---

## 7. Support & Contact

Update contact information throughout the app:
- Support email
- Help documentation links
- Social media links

---

## Quick Checklist

- [ ] Replace logo and favicon
- [ ] Update app name throughout
- [ ] Customize color palette
- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Update environment variables
- [ ] Customize email templates
- [ ] Add legal pages
- [ ] Configure analytics
- [ ] Update contact information

---

## Need Help?

For additional customization support, refer to the project documentation or create an issue in the repository.
