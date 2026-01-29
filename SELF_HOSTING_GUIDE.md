# Self-Hosting Guide - Complete Database Migration

This guide covers migrating the entire LinkDC backend from Lovable Cloud to your own server with PostgreSQL, MySQL, SQLite, or other databases.

## Table of Contents

1. [Quick Start - Full Backup Export](#quick-start---full-backup-export)
2. [Database Schema Overview](#database-schema-overview)
3. [PostgreSQL Migration](#postgresql-migration)
4. [MySQL Migration](#mysql-migration)
5. [SQLite Migration](#sqlite-migration)
6. [MongoDB Migration](#mongodb-migration)
7. [Authentication Setup](#authentication-setup)
8. [Storage Setup](#storage-setup)
9. [Environment Variables](#environment-variables)

---

## Quick Start - Full Backup Export

The easiest way to migrate your database is using the **Full Database Backup** feature in the app.

### How to Export

1. Go to **Dashboard → Settings → Account**
2. Find the **"Full Database Backup"** section
3. Select your target database format:
   - **PostgreSQL** (.sql) - Recommended for production
   - **MySQL** (.sql) - For MySQL/MariaDB servers
   - **SQLite** (.sql) - For lightweight deployments
   - **JSON** (.json) - For NoSQL databases or custom imports
4. Click **"Export Full Backup"**
5. The file includes both **schema AND all data**

### What's Included in the Backup

| Component | Description |
|-----------|-------------|
| **Schema** | Complete table definitions, indexes, functions, triggers |
| **Profiles** | User accounts and authentication data |
| **User Roles** | Admin/client role assignments |
| **Link Profiles** | All public bio pages with settings |
| **Blocks** | All content blocks (links, text, images, etc.) |
| **Custom Domains** | Domain configurations and verification status |
| **Analytics** | Page views and click tracking data |
| **Audit Logs** | Admin action history |
| **Admin Settings** | Global configuration settings |

### Importing the Backup

#### PostgreSQL
```bash
# Create database
createdb linkdc_production

# Import the backup
psql -d linkdc_production -f linkdc-backup-postgresql-2024-01-15.sql
```

#### MySQL
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE linkdc_production CHARACTER SET utf8mb4"

# Import the backup
mysql -u root -p linkdc_production < linkdc-backup-mysql-2024-01-15.sql
```

#### SQLite
```bash
# Create and import directly
sqlite3 linkdc.db < linkdc-backup-sqlite-2024-01-15.sql
```

#### JSON (for MongoDB or custom)
```bash
# For MongoDB - import each collection
mongoimport --db linkdc --collection profiles --file backup.json --jsonArray

# For custom imports, parse the JSON file which has this structure:
# {
#   "metadata": { "generated_at": "...", "record_counts": {...} },
#   "data": {
#     "profiles": [...],
#     "link_profiles": [...],
#     "blocks": [...],
#     ...
#   }
# }
```

### Data Access Levels

- **Admin users**: Can export ALL records from all tables
- **Regular users**: Can only export their own data

---

## Database Schema Overview

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | User account profiles (linked to auth) |
| `user_roles` | User role assignments (admin, client, super_admin) |
| `link_profiles` | Public link-in-bio profiles |
| `blocks` | Content blocks for each profile |
| `custom_domains` | Custom domain configurations |
| `analytics_events` | Page view and click analytics |
| `audit_logs` | Admin action audit trail |
| `admin_settings` | Global application settings |

### Relationships

```
auth.users (1) ──── (1) profiles
     │
     └──── (1) user_roles
     │
     └──── (1) link_profiles ──── (*) blocks
                    │
                    └──── (*) custom_domains
                    │
                    └──── (*) analytics_events
```

---

## PostgreSQL Migration

### Complete Schema

```sql
-- =============================================
-- LinkDC Complete PostgreSQL Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUM TYPES
-- =============================================

CREATE TYPE app_role AS ENUM ('super_admin', 'admin', 'client');

-- =============================================
-- TABLES
-- =============================================

-- Profiles table (user accounts)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role app_role NOT NULL DEFAULT 'client',
    is_verified BOOLEAN DEFAULT false,
    is_suspended BOOLEAN DEFAULT false,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Link profiles table (public bio pages)
CREATE TABLE link_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    location TEXT,
    theme_preset TEXT DEFAULT 'default',
    custom_colors JSONB DEFAULT '{}',
    custom_fonts JSONB DEFAULT '{}',
    background_type TEXT DEFAULT 'solid',
    background_value TEXT DEFAULT '#ffffff',
    social_links JSONB DEFAULT '{}',
    seo_title TEXT,
    seo_description TEXT,
    og_image_url TEXT,
    is_public BOOLEAN DEFAULT true,
    is_password_protected BOOLEAN DEFAULT false,
    password_hash TEXT,
    total_views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blocks table (content blocks)
CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES link_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    url TEXT,
    thumbnail_url TEXT,
    icon TEXT,
    content JSONB DEFAULT '{}',
    button_style JSONB DEFAULT '{}',
    is_enabled BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    open_in_new_tab BOOLEAN DEFAULT true,
    mobile_only BOOLEAN DEFAULT false,
    desktop_only BOOLEAN DEFAULT false,
    schedule_start TIMESTAMPTZ,
    schedule_end TIMESTAMPTZ,
    position INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Custom domains table
CREATE TABLE custom_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES link_profiles(id) ON DELETE CASCADE,
    domain VARCHAR NOT NULL UNIQUE,
    is_primary BOOLEAN DEFAULT false,
    dns_verified BOOLEAN DEFAULT false,
    status VARCHAR NOT NULL DEFAULT 'pending',
    verification_token VARCHAR,
    ssl_status VARCHAR DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics events table
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES link_profiles(id) ON DELETE SET NULL,
    block_id UUID REFERENCES blocks(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    visitor_id TEXT,
    country TEXT,
    city TEXT,
    device_type TEXT,
    browser TEXT,
    referrer TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin settings table
CREATE TABLE admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_link_profiles_user_id ON link_profiles(user_id);
CREATE INDEX idx_link_profiles_username ON link_profiles(username);
CREATE INDEX idx_blocks_profile_id ON blocks(profile_id);
CREATE INDEX idx_blocks_position ON blocks(profile_id, position);
CREATE INDEX idx_custom_domains_profile_id ON custom_domains(profile_id);
CREATE INDEX idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX idx_analytics_profile_id ON analytics_events(profile_id);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if user has role
CREATE OR REPLACE FUNCTION has_role(user_id UUID, check_role app_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = $1 AND role = $2
    );
END;
$$ LANGUAGE plpgsql;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = $1 AND role IN ('super_admin', 'admin')
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_link_profiles_updated_at
    BEFORE UPDATE ON link_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blocks_updated_at
    BEFORE UPDATE ON blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_domains_updated_at
    BEFORE UPDATE ON custom_domains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## MySQL Migration

```sql
-- =============================================
-- LinkDC Complete MySQL Schema
-- =============================================

-- Profiles table
CREATE TABLE profiles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role ENUM('super_admin', 'admin', 'client') NOT NULL DEFAULT 'client',
    is_verified BOOLEAN DEFAULT FALSE,
    is_suspended BOOLEAN DEFAULT FALSE,
    last_login_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- User roles table
CREATE TABLE user_roles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    role ENUM('super_admin', 'admin', 'client') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role),
    INDEX idx_user_id (user_id)
);

-- Link profiles table
CREATE TABLE link_profiles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    bio TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    location VARCHAR(255),
    theme_preset VARCHAR(50) DEFAULT 'default',
    custom_colors JSON DEFAULT (JSON_OBJECT()),
    custom_fonts JSON DEFAULT (JSON_OBJECT()),
    background_type VARCHAR(50) DEFAULT 'solid',
    background_value VARCHAR(255) DEFAULT '#ffffff',
    social_links JSON DEFAULT (JSON_OBJECT()),
    seo_title VARCHAR(255),
    seo_description TEXT,
    og_image_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    is_password_protected BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),
    total_views INT DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_username (username)
);

-- Blocks table
CREATE TABLE blocks (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    profile_id CHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    url TEXT,
    thumbnail_url TEXT,
    icon VARCHAR(100),
    content JSON DEFAULT (JSON_OBJECT()),
    button_style JSON DEFAULT (JSON_OBJECT()),
    is_enabled BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    open_in_new_tab BOOLEAN DEFAULT TRUE,
    mobile_only BOOLEAN DEFAULT FALSE,
    desktop_only BOOLEAN DEFAULT FALSE,
    schedule_start DATETIME,
    schedule_end DATETIME,
    position INT DEFAULT 0,
    total_clicks INT DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES link_profiles(id) ON DELETE CASCADE,
    INDEX idx_profile_id (profile_id),
    INDEX idx_position (profile_id, position)
);

-- Custom domains table
CREATE TABLE custom_domains (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    profile_id CHAR(36) NOT NULL,
    domain VARCHAR(255) NOT NULL UNIQUE,
    is_primary BOOLEAN DEFAULT FALSE,
    dns_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    verification_token VARCHAR(255),
    ssl_status VARCHAR(50) DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES link_profiles(id) ON DELETE CASCADE,
    INDEX idx_profile_id (profile_id),
    INDEX idx_domain (domain)
);

-- Analytics events table
CREATE TABLE analytics_events (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    profile_id CHAR(36),
    block_id CHAR(36),
    event_type VARCHAR(50) NOT NULL,
    visitor_id VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    referrer TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES link_profiles(id) ON DELETE SET NULL,
    FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE SET NULL,
    INDEX idx_profile_id (profile_id),
    INDEX idx_created_at (created_at)
);

-- Audit logs table
CREATE TABLE audit_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id CHAR(36),
    details JSON DEFAULT (JSON_OBJECT()),
    ip_address VARCHAR(45),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Admin settings table
CREATE TABLE admin_settings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value JSON NOT NULL,
    updated_by CHAR(36),
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES profiles(id) ON DELETE SET NULL
);

-- =============================================
-- STORED PROCEDURES
-- =============================================

DELIMITER //

CREATE FUNCTION has_role(p_user_id CHAR(36), p_role VARCHAR(20))
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = p_user_id AND role = p_role
    );
END //

CREATE FUNCTION is_admin(p_user_id CHAR(36))
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = p_user_id AND role IN ('super_admin', 'admin')
    );
END //

DELIMITER ;
```

---

## SQLite Migration

```sql
-- =============================================
-- LinkDC Complete SQLite Schema
-- =============================================

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Profiles table
CREATE TABLE profiles (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('super_admin', 'admin', 'client')),
    is_verified INTEGER DEFAULT 0,
    is_suspended INTEGER DEFAULT 0,
    last_login_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- User roles table
CREATE TABLE user_roles (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'client')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, role)
);

-- Link profiles table
CREATE TABLE link_profiles (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    location TEXT,
    theme_preset TEXT DEFAULT 'default',
    custom_colors TEXT DEFAULT '{}',
    custom_fonts TEXT DEFAULT '{}',
    background_type TEXT DEFAULT 'solid',
    background_value TEXT DEFAULT '#ffffff',
    social_links TEXT DEFAULT '{}',
    seo_title TEXT,
    seo_description TEXT,
    og_image_url TEXT,
    is_public INTEGER DEFAULT 1,
    is_password_protected INTEGER DEFAULT 0,
    password_hash TEXT,
    total_views INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Blocks table
CREATE TABLE blocks (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
    profile_id TEXT NOT NULL REFERENCES link_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    url TEXT,
    thumbnail_url TEXT,
    icon TEXT,
    content TEXT DEFAULT '{}',
    button_style TEXT DEFAULT '{}',
    is_enabled INTEGER DEFAULT 1,
    is_featured INTEGER DEFAULT 0,
    open_in_new_tab INTEGER DEFAULT 1,
    mobile_only INTEGER DEFAULT 0,
    desktop_only INTEGER DEFAULT 0,
    schedule_start TEXT,
    schedule_end TEXT,
    position INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Custom domains table
CREATE TABLE custom_domains (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
    profile_id TEXT NOT NULL REFERENCES link_profiles(id) ON DELETE CASCADE,
    domain TEXT NOT NULL UNIQUE,
    is_primary INTEGER DEFAULT 0,
    dns_verified INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    verification_token TEXT,
    ssl_status TEXT DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Analytics events table
CREATE TABLE analytics_events (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
    profile_id TEXT REFERENCES link_profiles(id) ON DELETE SET NULL,
    block_id TEXT REFERENCES blocks(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    visitor_id TEXT,
    country TEXT,
    city TEXT,
    device_type TEXT,
    browser TEXT,
    referrer TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Audit logs table
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
    user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details TEXT DEFAULT '{}',
    ip_address TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Admin settings table
CREATE TABLE admin_settings (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6)))),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    updated_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_link_profiles_user_id ON link_profiles(user_id);
CREATE INDEX idx_link_profiles_username ON link_profiles(username);
CREATE INDEX idx_blocks_profile_id ON blocks(profile_id);
CREATE INDEX idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX idx_analytics_profile_id ON analytics_events(profile_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

-- Triggers for updated_at
CREATE TRIGGER update_profiles_timestamp 
    AFTER UPDATE ON profiles
    BEGIN
        UPDATE profiles SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER update_link_profiles_timestamp 
    AFTER UPDATE ON link_profiles
    BEGIN
        UPDATE link_profiles SET updated_at = datetime('now') WHERE id = NEW.id;
    END;

CREATE TRIGGER update_blocks_timestamp 
    AFTER UPDATE ON blocks
    BEGIN
        UPDATE blocks SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
```

---

## MongoDB Migration

```javascript
// =============================================
// LinkDC MongoDB Schema (Collections)
// =============================================

// Run in MongoDB shell or use in Node.js

// Profiles collection
db.createCollection("profiles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "role", "created_at"],
      properties: {
        _id: { bsonType: "string" },
        email: { bsonType: "string" },
        full_name: { bsonType: "string" },
        avatar_url: { bsonType: "string" },
        role: { enum: ["super_admin", "admin", "client"] },
        is_verified: { bsonType: "bool" },
        is_suspended: { bsonType: "bool" },
        last_login_at: { bsonType: "date" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

db.profiles.createIndex({ email: 1 }, { unique: true });

// User roles collection
db.createCollection("user_roles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "role"],
      properties: {
        user_id: { bsonType: "string" },
        role: { enum: ["super_admin", "admin", "client"] },
        created_at: { bsonType: "date" }
      }
    }
  }
});

db.user_roles.createIndex({ user_id: 1, role: 1 }, { unique: true });

// Link profiles collection
db.createCollection("link_profiles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "username"],
      properties: {
        user_id: { bsonType: "string" },
        username: { bsonType: "string" },
        display_name: { bsonType: "string" },
        bio: { bsonType: "string" },
        avatar_url: { bsonType: "string" },
        cover_url: { bsonType: "string" },
        location: { bsonType: "string" },
        theme_preset: { bsonType: "string" },
        custom_colors: { bsonType: "object" },
        custom_fonts: { bsonType: "object" },
        background_type: { bsonType: "string" },
        background_value: { bsonType: "string" },
        social_links: { bsonType: "object" },
        seo_title: { bsonType: "string" },
        seo_description: { bsonType: "string" },
        og_image_url: { bsonType: "string" },
        is_public: { bsonType: "bool" },
        is_password_protected: { bsonType: "bool" },
        password_hash: { bsonType: "string" },
        total_views: { bsonType: "int" }
      }
    }
  }
});

db.link_profiles.createIndex({ username: 1 }, { unique: true });
db.link_profiles.createIndex({ user_id: 1 });

// Blocks collection
db.createCollection("blocks");
db.blocks.createIndex({ profile_id: 1, position: 1 });

// Custom domains collection  
db.createCollection("custom_domains");
db.custom_domains.createIndex({ domain: 1 }, { unique: true });
db.custom_domains.createIndex({ profile_id: 1 });

// Analytics events collection
db.createCollection("analytics_events");
db.analytics_events.createIndex({ profile_id: 1 });
db.analytics_events.createIndex({ created_at: -1 });

// Audit logs collection
db.createCollection("audit_logs");
db.audit_logs.createIndex({ user_id: 1 });
db.audit_logs.createIndex({ created_at: -1 });

// Admin settings collection
db.createCollection("admin_settings");
db.admin_settings.createIndex({ setting_key: 1 }, { unique: true });
```

---

## Authentication Setup

### For Self-Hosted Authentication

You'll need to implement your own auth system. Recommended options:

#### Option 1: Passport.js (Node.js)

```javascript
// auth.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    const user = await db.query('SELECT * FROM profiles WHERE email = $1', [email]);
    if (!user) return done(null, false);
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return done(null, false);
    
    return done(null, user);
  }
));
```

#### Option 2: NextAuth.js

```javascript
// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export default NextAuth({
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Verify against your database
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    }
  }
});
```

#### Option 3: JWT Manual Implementation

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Login
async function login(email, password) {
  const user = await db.findUser(email);
  if (!user || !await bcrypt.compare(password, user.password_hash)) {
    throw new Error('Invalid credentials');
  }
  
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return { token, user };
}

// Middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

---

## Storage Setup

### Local File Storage

```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/profile-images',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    cb(null, `${uniqueName}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const valid = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(valid ? null : new Error('Invalid file type'), valid);
  }
});
```

### AWS S3 Storage

```javascript
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'your-bucket-name',
    acl: 'public-read',
    key: (req, file, cb) => {
      cb(null, `profile-images/${Date.now()}-${file.originalname}`);
    }
  })
});
```

---

## Environment Variables

Create a `.env` file for your self-hosted setup:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/linkdc
# or for MySQL
# DATABASE_URL=mysql://user:password@localhost:3306/linkdc

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
SESSION_SECRET=your-session-secret

# Storage (choose one)
# Local
UPLOAD_DIR=./uploads

# AWS S3
AWS_ACCESS_KEY=your-access-key
AWS_SECRET_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_BUCKET=your-bucket

# App
APP_URL=https://yourdomain.com
PORT=3000
NODE_ENV=production
```

---

## Data Migration Script

To export existing data from the current database:

```javascript
// migrate-data.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function exportData() {
  const tables = [
    'profiles',
    'user_roles', 
    'link_profiles',
    'blocks',
    'custom_domains',
    'analytics_events',
    'audit_logs',
    'admin_settings'
  ];

  const data = {};

  for (const table of tables) {
    const { data: rows, error } = await supabase
      .from(table)
      .select('*');
    
    if (error) {
      console.error(`Error exporting ${table}:`, error);
      continue;
    }
    
    data[table] = rows;
    console.log(`Exported ${rows.length} rows from ${table}`);
  }

  fs.writeFileSync('database-export.json', JSON.stringify(data, null, 2));
  console.log('Export complete: database-export.json');
}

exportData();
```

---

## Need Help?

For additional assistance with self-hosting:

1. **PostgreSQL**: [Official Documentation](https://www.postgresql.org/docs/)
2. **MySQL**: [Official Documentation](https://dev.mysql.com/doc/)
3. **SQLite**: [Official Documentation](https://sqlite.org/docs.html)
4. **MongoDB**: [Official Documentation](https://docs.mongodb.com/)
