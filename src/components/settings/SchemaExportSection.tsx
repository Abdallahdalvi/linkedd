import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Download, FileCode, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

type ExportFormat = 'postgresql' | 'mysql' | 'sqlite' | 'mongodb';

const POSTGRESQL_SCHEMA = `-- =============================================
-- LinkDC Complete PostgreSQL Schema
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM TYPES
CREATE TYPE app_role AS ENUM ('super_admin', 'admin', 'client');

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

-- INDEXES
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

-- FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION has_role(user_id UUID, check_role app_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = $1 AND role = $2
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = $1 AND role IN ('super_admin', 'admin')
    );
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
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
`;

const MYSQL_SCHEMA = `-- =============================================
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

-- STORED PROCEDURES
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
`;

const SQLITE_SCHEMA = `-- =============================================
-- LinkDC Complete SQLite Schema
-- =============================================

PRAGMA foreign_keys = ON;

-- Profiles table
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,
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
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'client')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, role)
);

-- Link profiles table
CREATE TABLE link_profiles (
    id TEXT PRIMARY KEY,
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
    id TEXT PRIMARY KEY,
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
    id TEXT PRIMARY KEY,
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
    id TEXT PRIMARY KEY,
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
    id TEXT PRIMARY KEY,
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
    id TEXT PRIMARY KEY,
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

-- Triggers
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
`;

const MONGODB_SCHEMA = `// =============================================
// LinkDC MongoDB Schema Setup
// =============================================
// Run in MongoDB shell or use in Node.js with MongoDB driver

// Create collections with validation

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
db.createCollection("user_roles");
db.user_roles.createIndex({ user_id: 1, role: 1 }, { unique: true });

// Link profiles collection
db.createCollection("link_profiles");
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

console.log("MongoDB schema setup complete!");
`;

export function SchemaExportSection() {
  const [format, setFormat] = useState<ExportFormat>('postgresql');
  const [copied, setCopied] = useState(false);

  const getSchema = () => {
    switch (format) {
      case 'postgresql':
        return POSTGRESQL_SCHEMA;
      case 'mysql':
        return MYSQL_SCHEMA;
      case 'sqlite':
        return SQLITE_SCHEMA;
      case 'mongodb':
        return MONGODB_SCHEMA;
      default:
        return POSTGRESQL_SCHEMA;
    }
  };

  const getFileExtension = () => {
    return format === 'mongodb' ? 'js' : 'sql';
  };

  const handleDownload = () => {
    const schema = getSchema();
    const blob = new Blob([schema], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkdc-schema.${getFileExtension()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Schema downloaded as linkdc-schema.${getFileExtension()}`);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getSchema());
      setCopied(true);
      toast.success('Schema copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy schema');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Schema Export
        </CardTitle>
        <CardDescription>
          Export the complete database schema to migrate to your own server
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="postgresql">PostgreSQL</SelectItem>
              <SelectItem value="mysql">MySQL</SelectItem>
              <SelectItem value="sqlite">SQLite</SelectItem>
              <SelectItem value="mongodb">MongoDB</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button onClick={handleDownload} className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 mr-2" />
              Download Schema
            </Button>
            <Button variant="outline" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-start gap-3">
            <FileCode className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Includes:</p>
              <ul className="text-sm text-muted-foreground space-y-0.5">
                <li>• All 8 tables (profiles, user_roles, link_profiles, blocks, etc.)</li>
                <li>• Indexes for optimal query performance</li>
                <li>• Functions and triggers for auto-updating timestamps</li>
                <li>• Role checking functions (has_role, is_admin)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ExternalLink className="h-4 w-4" />
          <span>See </span>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            SELF_HOSTING_GUIDE.md
          </a>
          <span> for complete migration instructions</span>
        </div>
      </CardContent>
    </Card>
  );
}
