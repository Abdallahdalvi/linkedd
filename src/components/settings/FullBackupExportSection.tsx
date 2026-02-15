import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Download, FileArchive, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { t } from '@/lib/schema-prefix';
import { useAuth } from '@/contexts/AuthContext';

type ExportFormat = 'postgresql' | 'mysql' | 'sqlite' | 'json';

interface TableData {
  profiles: any[];
  user_roles: any[];
  link_profiles: any[];
  blocks: any[];
  custom_domains: any[];
  analytics_events: any[];
  audit_logs: any[];
  admin_settings: any[];
}

export function FullBackupExportSection() {
  const { user } = useAuth();
  const [format, setFormat] = useState<ExportFormat>('postgresql');
  const [isExporting, setIsExporting] = useState(false);

  const fetchAllData = async (): Promise<TableData> => {
    // Fetch data from all tables - using service role through edge function would be ideal
    // but for now we fetch what the user has access to
    const [
      profilesRes,
      userRolesRes,
      linkProfilesRes,
      blocksRes,
      customDomainsRes,
      analyticsRes,
      auditLogsRes,
      adminSettingsRes
    ] = await Promise.all([
      supabase.from(t('profiles')).select('*'),
      supabase.from(t('user_roles')).select('*'),
      supabase.from(t('link_profiles')).select('*'),
      supabase.from(t('blocks')).select('*'),
      supabase.from(t('custom_domains')).select('*'),
      supabase.from(t('analytics_events')).select('*').limit(10000),
      supabase.from(t('audit_logs')).select('*').limit(10000),
      supabase.from(t('admin_settings')).select('*')
    ]);

    return {
      profiles: profilesRes.data || [],
      user_roles: userRolesRes.data || [],
      link_profiles: linkProfilesRes.data || [],
      blocks: blocksRes.data || [],
      custom_domains: customDomainsRes.data || [],
      analytics_events: analyticsRes.data || [],
      audit_logs: auditLogsRes.data || [],
      admin_settings: adminSettingsRes.data || []
    };
  };

  const escapeValue = (value: any, format: ExportFormat): string => {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'boolean') {
      if (format === 'sqlite') return value ? '1' : '0';
      return value ? 'TRUE' : 'FALSE';
    }
    if (typeof value === 'number') return String(value);
    if (typeof value === 'object') {
      const jsonStr = JSON.stringify(value).replace(/'/g, "''");
      return `'${jsonStr}'`;
    }
    return `'${String(value).replace(/'/g, "''")}'`;
  };

  const generateInsertStatements = (tableName: string, data: any[], format: ExportFormat): string => {
    if (data.length === 0) return `-- No data in ${tableName}\n`;

    const columns = Object.keys(data[0]);
    let sql = `-- ${tableName} data (${data.length} records)\n`;

    for (const row of data) {
      const values = columns.map(col => escapeValue(row[col], format)).join(', ');
      sql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values});\n`;
    }

    return sql + '\n';
  };

  const generatePostgreSQLBackup = (data: TableData): string => {
    let sql = `-- =============================================
-- LinkDC Complete Database Backup (PostgreSQL)
-- Generated: ${new Date().toISOString()}
-- =============================================

-- IMPORTANT: Run schema first, then this data file
-- Or use this complete backup which includes both

SET client_encoding = 'UTF8';

-- Disable foreign key checks during import
SET session_replication_role = replica;

`;

    // Schema
    sql += `-- =============================================
-- SCHEMA
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE app_role AS ENUM ('super_admin', 'admin', 'client');

CREATE TABLE IF NOT EXISTS profiles (
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

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

CREATE TABLE IF NOT EXISTS link_profiles (
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

CREATE TABLE IF NOT EXISTS blocks (
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

CREATE TABLE IF NOT EXISTS custom_domains (
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

CREATE TABLE IF NOT EXISTS analytics_events (
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

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_link_profiles_user_id ON link_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_link_profiles_username ON link_profiles(username);
CREATE INDEX IF NOT EXISTS idx_blocks_profile_id ON blocks(profile_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_analytics_profile_id ON analytics_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Functions
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

`;

    // Data
    sql += `-- =============================================
-- DATA
-- =============================================

`;

    // Insert in order of dependencies
    sql += generateInsertStatements('profiles', data.profiles, 'postgresql');
    sql += generateInsertStatements('user_roles', data.user_roles, 'postgresql');
    sql += generateInsertStatements('link_profiles', data.link_profiles, 'postgresql');
    sql += generateInsertStatements('blocks', data.blocks, 'postgresql');
    sql += generateInsertStatements('custom_domains', data.custom_domains, 'postgresql');
    sql += generateInsertStatements('analytics_events', data.analytics_events, 'postgresql');
    sql += generateInsertStatements('audit_logs', data.audit_logs, 'postgresql');
    sql += generateInsertStatements('admin_settings', data.admin_settings, 'postgresql');

    sql += `
-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- =============================================
-- BACKUP COMPLETE
-- =============================================
`;

    return sql;
  };

  const generateMySQLBackup = (data: TableData): string => {
    let sql = `-- =============================================
-- LinkDC Complete Database Backup (MySQL)
-- Generated: ${new Date().toISOString()}
-- =============================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET NAMES utf8mb4;

-- =============================================
-- SCHEMA
-- =============================================

CREATE TABLE IF NOT EXISTS profiles (
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

CREATE TABLE IF NOT EXISTS user_roles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    role ENUM('super_admin', 'admin', 'client') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role),
    INDEX idx_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS link_profiles (
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

CREATE TABLE IF NOT EXISTS blocks (
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
    INDEX idx_profile_id (profile_id)
);

CREATE TABLE IF NOT EXISTS custom_domains (
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
    INDEX idx_domain (domain)
);

CREATE TABLE IF NOT EXISTS analytics_events (
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
    INDEX idx_profile_id (profile_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id CHAR(36),
    details JSON DEFAULT (JSON_OBJECT()),
    ip_address VARCHAR(45),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS admin_settings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value JSON NOT NULL,
    updated_by CHAR(36),
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES profiles(id) ON DELETE SET NULL
);

-- =============================================
-- DATA
-- =============================================

`;

    sql += generateInsertStatements('profiles', data.profiles, 'mysql');
    sql += generateInsertStatements('user_roles', data.user_roles, 'mysql');
    sql += generateInsertStatements('link_profiles', data.link_profiles, 'mysql');
    sql += generateInsertStatements('blocks', data.blocks, 'mysql');
    sql += generateInsertStatements('custom_domains', data.custom_domains, 'mysql');
    sql += generateInsertStatements('analytics_events', data.analytics_events, 'mysql');
    sql += generateInsertStatements('audit_logs', data.audit_logs, 'mysql');
    sql += generateInsertStatements('admin_settings', data.admin_settings, 'mysql');

    sql += `
SET FOREIGN_KEY_CHECKS = 1;

-- BACKUP COMPLETE
`;

    return sql;
  };

  const generateSQLiteBackup = (data: TableData): string => {
    let sql = `-- =============================================
-- LinkDC Complete Database Backup (SQLite)
-- Generated: ${new Date().toISOString()}
-- =============================================

PRAGMA foreign_keys = OFF;

-- =============================================
-- SCHEMA
-- =============================================

CREATE TABLE IF NOT EXISTS profiles (
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

CREATE TABLE IF NOT EXISTS user_roles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'client')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, role)
);

CREATE TABLE IF NOT EXISTS link_profiles (
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

CREATE TABLE IF NOT EXISTS blocks (
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

CREATE TABLE IF NOT EXISTS custom_domains (
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

CREATE TABLE IF NOT EXISTS analytics_events (
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

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details TEXT DEFAULT '{}',
    ip_address TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_settings (
    id TEXT PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    updated_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_link_profiles_user_id ON link_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_link_profiles_username ON link_profiles(username);
CREATE INDEX IF NOT EXISTS idx_blocks_profile_id ON blocks(profile_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_analytics_profile_id ON analytics_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- =============================================
-- DATA
-- =============================================

`;

    sql += generateInsertStatements('profiles', data.profiles, 'sqlite');
    sql += generateInsertStatements('user_roles', data.user_roles, 'sqlite');
    sql += generateInsertStatements('link_profiles', data.link_profiles, 'sqlite');
    sql += generateInsertStatements('blocks', data.blocks, 'sqlite');
    sql += generateInsertStatements('custom_domains', data.custom_domains, 'sqlite');
    sql += generateInsertStatements('analytics_events', data.analytics_events, 'sqlite');
    sql += generateInsertStatements('audit_logs', data.audit_logs, 'sqlite');
    sql += generateInsertStatements('admin_settings', data.admin_settings, 'sqlite');

    sql += `
PRAGMA foreign_keys = ON;

-- BACKUP COMPLETE
`;

    return sql;
  };

  const generateJSONBackup = (data: TableData): string => {
    const backup = {
      metadata: {
        generated_at: new Date().toISOString(),
        version: '1.0.0',
        tables: Object.keys(data),
        record_counts: {
          profiles: data.profiles.length,
          user_roles: data.user_roles.length,
          link_profiles: data.link_profiles.length,
          blocks: data.blocks.length,
          custom_domains: data.custom_domains.length,
          analytics_events: data.analytics_events.length,
          audit_logs: data.audit_logs.length,
          admin_settings: data.admin_settings.length
        }
      },
      data
    };

    return JSON.stringify(backup, null, 2);
  };

  const handleExport = async () => {
    if (!user) {
      toast.error('Please log in to export data');
      return;
    }

    setIsExporting(true);
    try {
      const data = await fetchAllData();
      
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (format) {
        case 'postgresql':
          content = generatePostgreSQLBackup(data);
          filename = `linkdc-backup-postgresql-${new Date().toISOString().split('T')[0]}.sql`;
          mimeType = 'text/sql';
          break;
        case 'mysql':
          content = generateMySQLBackup(data);
          filename = `linkdc-backup-mysql-${new Date().toISOString().split('T')[0]}.sql`;
          mimeType = 'text/sql';
          break;
        case 'sqlite':
          content = generateSQLiteBackup(data);
          filename = `linkdc-backup-sqlite-${new Date().toISOString().split('T')[0]}.sql`;
          mimeType = 'text/sql';
          break;
        case 'json':
          content = generateJSONBackup(data);
          filename = `linkdc-backup-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
        default:
          throw new Error('Unsupported format');
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const totalRecords = Object.values(data).reduce((sum, arr) => sum + arr.length, 0);
      toast.success(`Backup exported successfully! (${totalRecords} total records)`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export backup');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileArchive className="h-5 w-5" />
          Full Database Backup
        </CardTitle>
        <CardDescription>
          Export complete database backup with schema and all records for migration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="postgresql">PostgreSQL (.sql)</SelectItem>
              <SelectItem value="mysql">MySQL (.sql)</SelectItem>
              <SelectItem value="sqlite">SQLite (.sql)</SelectItem>
              <SelectItem value="json">JSON (.json)</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="flex-1 sm:flex-none"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Full Backup
              </>
            )}
          </Button>
        </div>

        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Backup includes:</p>
              <ul className="text-sm text-muted-foreground space-y-0.5">
                <li>• Complete database schema (tables, indexes, functions)</li>
                <li>• All profiles and user accounts</li>
                <li>• Link profiles, blocks, and custom domains</li>
                <li>• Analytics events and audit logs</li>
                <li>• Admin settings and configurations</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-500">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            Backup exports data you have access to. Admin users can export all records; 
            regular users export their own data only.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
