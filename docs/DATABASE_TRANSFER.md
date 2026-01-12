# Database Transfer Guide

This guide explains how to transfer your Supabase database to a new project or export data for backup.

## Overview

The application uses Supabase (PostgreSQL) as its database. This guide covers:
- Exporting data from Supabase
- Importing data to a new project
- Migration strategies

---

## 1. Export Your Data

### Method 1: Supabase Dashboard Export

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor**
3. Select each table and click **Export as CSV**

Tables to export:
- `profiles` - User profiles
- `link_profiles` - LinkBio profiles
- `blocks` - Link blocks and content
- `analytics_events` - Usage analytics
- `audit_logs` - Activity logs
- `user_roles` - Role assignments

### Method 2: pg_dump (Recommended)

Use PostgreSQL's native backup tool:

```bash
# Full database backup
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres" > backup.sql

# Specific tables only
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres" \
  -t public.profiles \
  -t public.link_profiles \
  -t public.blocks \
  > tables_backup.sql
```

### Method 3: In-App Export

Users can export their own data from:
**Dashboard → Settings → Account → Export Data**

This creates a JSON file with their profile and blocks.

---

## 2. Import Data

### To a New Supabase Project

1. **Create the new project** at [supabase.com](https://supabase.com)

2. **Run migrations first** to create the schema:
   ```bash
   supabase db push
   ```

3. **Import the data**:
   ```bash
   psql "postgresql://postgres:[PASSWORD]@db.[NEW_PROJECT_ID].supabase.co:5432/postgres" < backup.sql
   ```

### Using SQL Import

```sql
-- Disable triggers during import
ALTER TABLE public.profiles DISABLE TRIGGER ALL;
ALTER TABLE public.link_profiles DISABLE TRIGGER ALL;
ALTER TABLE public.blocks DISABLE TRIGGER ALL;

-- Import your data here via SQL INSERT statements
-- ...

-- Re-enable triggers
ALTER TABLE public.profiles ENABLE TRIGGER ALL;
ALTER TABLE public.link_profiles ENABLE TRIGGER ALL;
ALTER TABLE public.blocks ENABLE TRIGGER ALL;
```

---

## 3. Update Application Config

After migration, update your environment:

```env
# .env
VITE_SUPABASE_URL=https://[NEW_PROJECT_ID].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_new_anon_key
```

---

## 4. Migrate Auth Users

### Option A: Password Reset Flow

After migrating profiles, ask users to reset their passwords. This is the simplest approach.

### Option B: Export/Import Users

Export users from old project:
```sql
SELECT id, email, encrypted_password, email_confirmed_at, created_at
FROM auth.users;
```

Import to new project using Supabase Admin API.

---

## 5. Migrate Storage

### Export Files

1. Go to **Storage** in Supabase dashboard
2. Download files from each bucket

### Import Files

Upload files to the new project's storage buckets maintaining the same structure.

---

## 6. Update RLS Policies

Ensure Row Level Security policies are properly set on the new project:

```sql
-- Example: Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);
```

---

## 7. Verify Migration

### Checklist

- [ ] All tables created with correct schema
- [ ] Data imported successfully
- [ ] Auth users can log in
- [ ] Storage files accessible
- [ ] RLS policies active
- [ ] Application connecting to new database
- [ ] Edge functions deployed

### Test Queries

```sql
-- Verify data counts
SELECT 'profiles' as table_name, COUNT(*) FROM profiles
UNION ALL
SELECT 'link_profiles', COUNT(*) FROM link_profiles
UNION ALL
SELECT 'blocks', COUNT(*) FROM blocks;
```

---

## Troubleshooting

### Foreign Key Issues

If you get FK constraint errors, import in this order:
1. `profiles` (users table)
2. `user_roles`
3. `link_profiles`
4. `blocks`
5. `analytics_events`

### UUID Conflicts

If UUIDs conflict with existing data:
```sql
-- Generate new UUIDs while maintaining relationships
-- (Requires custom migration script)
```

### Missing Extensions

Ensure required extensions are enabled:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

## Automated Backup Script

Create a backup script for regular exports:

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
DB_URL="postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres"

mkdir -p $BACKUP_DIR

pg_dump $DB_URL > "$BACKUP_DIR/backup_$DATE.sql"

echo "Backup created: backup_$DATE.sql"
```

---

## Need Help?

For migration assistance, consult the Supabase documentation or reach out to support.
