import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Download, FileJson, FileCode, Table, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

type ExportFormat = 'json' | 'postgresql' | 'mysql' | 'sqlite' | 'csv';

interface DatabaseExportSectionProps {
  profile: any;
}

const formatOptions: { value: ExportFormat; label: string; description: string; icon: React.ReactNode }[] = [
  { 
    value: 'json', 
    label: 'JSON', 
    description: 'Universal format, great for NoSQL databases',
    icon: <FileJson className="w-4 h-4" />
  },
  { 
    value: 'postgresql', 
    label: 'PostgreSQL', 
    description: 'SQL format for PostgreSQL databases',
    icon: <Database className="w-4 h-4" />
  },
  { 
    value: 'mysql', 
    label: 'MySQL', 
    description: 'SQL format for MySQL/MariaDB databases',
    icon: <Database className="w-4 h-4" />
  },
  { 
    value: 'sqlite', 
    label: 'SQLite', 
    description: 'Lightweight SQL for local databases',
    icon: <Database className="w-4 h-4" />
  },
  { 
    value: 'csv', 
    label: 'CSV', 
    description: 'Spreadsheet format for easy viewing',
    icon: <Table className="w-4 h-4" />
  },
];

export default function DatabaseExportSection({ profile }: DatabaseExportSectionProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [exporting, setExporting] = useState(false);

  const generatePostgreSQLExport = (profileData: any, blocksData: any[]) => {
    const timestamp = new Date().toISOString();
    let sql = `-- LinkDC Database Export (PostgreSQL)\n`;
    sql += `-- Generated: ${timestamp}\n`;
    sql += `-- Format: PostgreSQL\n\n`;

    // Create profiles table
    sql += `-- Create profiles table\n`;
    sql += `CREATE TABLE IF NOT EXISTS link_profiles (\n`;
    sql += `  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`;
    sql += `  user_id UUID NOT NULL,\n`;
    sql += `  username TEXT NOT NULL UNIQUE,\n`;
    sql += `  display_name TEXT,\n`;
    sql += `  bio TEXT,\n`;
    sql += `  avatar_url TEXT,\n`;
    sql += `  cover_url TEXT,\n`;
    sql += `  location TEXT,\n`;
    sql += `  theme_preset TEXT DEFAULT 'default',\n`;
    sql += `  background_type TEXT DEFAULT 'solid',\n`;
    sql += `  background_value TEXT DEFAULT '#ffffff',\n`;
    sql += `  social_links JSONB DEFAULT '{}',\n`;
    sql += `  custom_colors JSONB DEFAULT '{}',\n`;
    sql += `  custom_fonts JSONB DEFAULT '{}',\n`;
    sql += `  seo_title TEXT,\n`;
    sql += `  seo_description TEXT,\n`;
    sql += `  og_image_url TEXT,\n`;
    sql += `  is_public BOOLEAN DEFAULT true,\n`;
    sql += `  is_password_protected BOOLEAN DEFAULT false,\n`;
    sql += `  total_views INTEGER DEFAULT 0,\n`;
    sql += `  created_at TIMESTAMPTZ DEFAULT now(),\n`;
    sql += `  updated_at TIMESTAMPTZ DEFAULT now()\n`;
    sql += `);\n\n`;

    // Create blocks table
    sql += `-- Create blocks table\n`;
    sql += `CREATE TABLE IF NOT EXISTS blocks (\n`;
    sql += `  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`;
    sql += `  profile_id UUID NOT NULL REFERENCES link_profiles(id) ON DELETE CASCADE,\n`;
    sql += `  type TEXT NOT NULL,\n`;
    sql += `  title TEXT,\n`;
    sql += `  subtitle TEXT,\n`;
    sql += `  url TEXT,\n`;
    sql += `  icon TEXT,\n`;
    sql += `  thumbnail_url TEXT,\n`;
    sql += `  content JSONB DEFAULT '{}',\n`;
    sql += `  button_style JSONB DEFAULT '{}',\n`;
    sql += `  position INTEGER DEFAULT 0,\n`;
    sql += `  is_enabled BOOLEAN DEFAULT true,\n`;
    sql += `  is_featured BOOLEAN DEFAULT false,\n`;
    sql += `  open_in_new_tab BOOLEAN DEFAULT true,\n`;
    sql += `  mobile_only BOOLEAN DEFAULT false,\n`;
    sql += `  desktop_only BOOLEAN DEFAULT false,\n`;
    sql += `  schedule_start TIMESTAMPTZ,\n`;
    sql += `  schedule_end TIMESTAMPTZ,\n`;
    sql += `  total_clicks INTEGER DEFAULT 0,\n`;
    sql += `  created_at TIMESTAMPTZ DEFAULT now(),\n`;
    sql += `  updated_at TIMESTAMPTZ DEFAULT now()\n`;
    sql += `);\n\n`;

    // Insert profile data
    if (profileData) {
      sql += `-- Insert profile data\n`;
      const p = profileData;
      sql += `INSERT INTO link_profiles (id, user_id, username, display_name, bio, avatar_url, cover_url, location, theme_preset, background_type, background_value, social_links, custom_colors, custom_fonts, seo_title, seo_description, is_public, total_views, created_at, updated_at)\n`;
      sql += `VALUES (\n`;
      sql += `  '${p.id}',\n`;
      sql += `  '${p.user_id}',\n`;
      sql += `  '${escapeSQL(p.username)}',\n`;
      sql += `  ${p.display_name ? `'${escapeSQL(p.display_name)}'` : 'NULL'},\n`;
      sql += `  ${p.bio ? `'${escapeSQL(p.bio)}'` : 'NULL'},\n`;
      sql += `  ${p.avatar_url ? `'${escapeSQL(p.avatar_url)}'` : 'NULL'},\n`;
      sql += `  ${p.cover_url ? `'${escapeSQL(p.cover_url)}'` : 'NULL'},\n`;
      sql += `  ${p.location ? `'${escapeSQL(p.location)}'` : 'NULL'},\n`;
      sql += `  '${p.theme_preset || 'default'}',\n`;
      sql += `  '${p.background_type || 'solid'}',\n`;
      sql += `  '${escapeSQL(p.background_value || '#ffffff')}',\n`;
      sql += `  '${JSON.stringify(p.social_links || {})}',\n`;
      sql += `  '${JSON.stringify(p.custom_colors || {})}',\n`;
      sql += `  '${JSON.stringify(p.custom_fonts || {})}',\n`;
      sql += `  ${p.seo_title ? `'${escapeSQL(p.seo_title)}'` : 'NULL'},\n`;
      sql += `  ${p.seo_description ? `'${escapeSQL(p.seo_description)}'` : 'NULL'},\n`;
      sql += `  ${p.is_public ?? true},\n`;
      sql += `  ${p.total_views || 0},\n`;
      sql += `  '${p.created_at}',\n`;
      sql += `  '${p.updated_at}'\n`;
      sql += `);\n\n`;
    }

    // Insert blocks data
    if (blocksData && blocksData.length > 0) {
      sql += `-- Insert blocks data\n`;
      blocksData.forEach((b) => {
        sql += `INSERT INTO blocks (id, profile_id, type, title, subtitle, url, icon, thumbnail_url, content, button_style, position, is_enabled, is_featured, total_clicks, schedule_start, schedule_end, created_at, updated_at)\n`;
        sql += `VALUES (\n`;
        sql += `  '${b.id}',\n`;
        sql += `  '${b.profile_id}',\n`;
        sql += `  '${b.type}',\n`;
        sql += `  ${b.title ? `'${escapeSQL(b.title)}'` : 'NULL'},\n`;
        sql += `  ${b.subtitle ? `'${escapeSQL(b.subtitle)}'` : 'NULL'},\n`;
        sql += `  ${b.url ? `'${escapeSQL(b.url)}'` : 'NULL'},\n`;
        sql += `  ${b.icon ? `'${escapeSQL(b.icon)}'` : 'NULL'},\n`;
        sql += `  ${b.thumbnail_url ? `'${escapeSQL(b.thumbnail_url)}'` : 'NULL'},\n`;
        sql += `  '${JSON.stringify(b.content || {})}',\n`;
        sql += `  '${JSON.stringify(b.button_style || {})}',\n`;
        sql += `  ${b.position || 0},\n`;
        sql += `  ${b.is_enabled ?? true},\n`;
        sql += `  ${b.is_featured ?? false},\n`;
        sql += `  ${b.total_clicks || 0},\n`;
        sql += `  ${b.schedule_start ? `'${b.schedule_start}'` : 'NULL'},\n`;
        sql += `  ${b.schedule_end ? `'${b.schedule_end}'` : 'NULL'},\n`;
        sql += `  '${b.created_at}',\n`;
        sql += `  '${b.updated_at}'\n`;
        sql += `);\n\n`;
      });
    }

    return sql;
  };

  const generateMySQLExport = (profileData: any, blocksData: any[]) => {
    const timestamp = new Date().toISOString();
    let sql = `-- LinkDC Database Export (MySQL)\n`;
    sql += `-- Generated: ${timestamp}\n`;
    sql += `-- Format: MySQL/MariaDB\n\n`;
    sql += `SET NAMES utf8mb4;\n`;
    sql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

    // Create profiles table
    sql += `-- Create profiles table\n`;
    sql += `CREATE TABLE IF NOT EXISTS \`link_profiles\` (\n`;
    sql += `  \`id\` CHAR(36) PRIMARY KEY,\n`;
    sql += `  \`user_id\` CHAR(36) NOT NULL,\n`;
    sql += `  \`username\` VARCHAR(255) NOT NULL UNIQUE,\n`;
    sql += `  \`display_name\` VARCHAR(255),\n`;
    sql += `  \`bio\` TEXT,\n`;
    sql += `  \`avatar_url\` TEXT,\n`;
    sql += `  \`cover_url\` TEXT,\n`;
    sql += `  \`location\` VARCHAR(255),\n`;
    sql += `  \`theme_preset\` VARCHAR(50) DEFAULT 'default',\n`;
    sql += `  \`background_type\` VARCHAR(50) DEFAULT 'solid',\n`;
    sql += `  \`background_value\` VARCHAR(255) DEFAULT '#ffffff',\n`;
    sql += `  \`social_links\` JSON,\n`;
    sql += `  \`custom_colors\` JSON,\n`;
    sql += `  \`custom_fonts\` JSON,\n`;
    sql += `  \`seo_title\` VARCHAR(255),\n`;
    sql += `  \`seo_description\` TEXT,\n`;
    sql += `  \`og_image_url\` TEXT,\n`;
    sql += `  \`is_public\` TINYINT(1) DEFAULT 1,\n`;
    sql += `  \`is_password_protected\` TINYINT(1) DEFAULT 0,\n`;
    sql += `  \`total_views\` INT DEFAULT 0,\n`;
    sql += `  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,\n`;
    sql += `  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

    // Create blocks table
    sql += `-- Create blocks table\n`;
    sql += `CREATE TABLE IF NOT EXISTS \`blocks\` (\n`;
    sql += `  \`id\` CHAR(36) PRIMARY KEY,\n`;
    sql += `  \`profile_id\` CHAR(36) NOT NULL,\n`;
    sql += `  \`type\` VARCHAR(50) NOT NULL,\n`;
    sql += `  \`title\` VARCHAR(255),\n`;
    sql += `  \`subtitle\` VARCHAR(255),\n`;
    sql += `  \`url\` TEXT,\n`;
    sql += `  \`icon\` VARCHAR(100),\n`;
    sql += `  \`thumbnail_url\` TEXT,\n`;
    sql += `  \`content\` JSON,\n`;
    sql += `  \`button_style\` JSON,\n`;
    sql += `  \`position\` INT DEFAULT 0,\n`;
    sql += `  \`is_enabled\` TINYINT(1) DEFAULT 1,\n`;
    sql += `  \`is_featured\` TINYINT(1) DEFAULT 0,\n`;
    sql += `  \`open_in_new_tab\` TINYINT(1) DEFAULT 1,\n`;
    sql += `  \`mobile_only\` TINYINT(1) DEFAULT 0,\n`;
    sql += `  \`desktop_only\` TINYINT(1) DEFAULT 0,\n`;
    sql += `  \`schedule_start\` DATETIME,\n`;
    sql += `  \`schedule_end\` DATETIME,\n`;
    sql += `  \`total_clicks\` INT DEFAULT 0,\n`;
    sql += `  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,\n`;
    sql += `  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n`;
    sql += `  FOREIGN KEY (\`profile_id\`) REFERENCES \`link_profiles\`(\`id\`) ON DELETE CASCADE\n`;
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

    // Insert profile data
    if (profileData) {
      sql += `-- Insert profile data\n`;
      const p = profileData;
      sql += `INSERT INTO \`link_profiles\` (\`id\`, \`user_id\`, \`username\`, \`display_name\`, \`bio\`, \`avatar_url\`, \`cover_url\`, \`location\`, \`theme_preset\`, \`background_type\`, \`background_value\`, \`social_links\`, \`custom_colors\`, \`custom_fonts\`, \`seo_title\`, \`seo_description\`, \`is_public\`, \`total_views\`, \`created_at\`, \`updated_at\`)\n`;
      sql += `VALUES (\n`;
      sql += `  '${p.id}',\n`;
      sql += `  '${p.user_id}',\n`;
      sql += `  '${escapeSQL(p.username)}',\n`;
      sql += `  ${p.display_name ? `'${escapeSQL(p.display_name)}'` : 'NULL'},\n`;
      sql += `  ${p.bio ? `'${escapeSQL(p.bio)}'` : 'NULL'},\n`;
      sql += `  ${p.avatar_url ? `'${escapeSQL(p.avatar_url)}'` : 'NULL'},\n`;
      sql += `  ${p.cover_url ? `'${escapeSQL(p.cover_url)}'` : 'NULL'},\n`;
      sql += `  ${p.location ? `'${escapeSQL(p.location)}'` : 'NULL'},\n`;
      sql += `  '${p.theme_preset || 'default'}',\n`;
      sql += `  '${p.background_type || 'solid'}',\n`;
      sql += `  '${escapeSQL(p.background_value || '#ffffff')}',\n`;
      sql += `  '${JSON.stringify(p.social_links || {})}',\n`;
      sql += `  '${JSON.stringify(p.custom_colors || {})}',\n`;
      sql += `  '${JSON.stringify(p.custom_fonts || {})}',\n`;
      sql += `  ${p.seo_title ? `'${escapeSQL(p.seo_title)}'` : 'NULL'},\n`;
      sql += `  ${p.seo_description ? `'${escapeSQL(p.seo_description)}'` : 'NULL'},\n`;
      sql += `  ${p.is_public ? 1 : 0},\n`;
      sql += `  ${p.total_views || 0},\n`;
      sql += `  '${formatMySQLDate(p.created_at)}',\n`;
      sql += `  '${formatMySQLDate(p.updated_at)}'\n`;
      sql += `);\n\n`;
    }

    // Insert blocks data
    if (blocksData && blocksData.length > 0) {
      sql += `-- Insert blocks data\n`;
      blocksData.forEach((b) => {
        sql += `INSERT INTO \`blocks\` (\`id\`, \`profile_id\`, \`type\`, \`title\`, \`subtitle\`, \`url\`, \`icon\`, \`thumbnail_url\`, \`content\`, \`button_style\`, \`position\`, \`is_enabled\`, \`is_featured\`, \`total_clicks\`, \`schedule_start\`, \`schedule_end\`, \`created_at\`, \`updated_at\`)\n`;
        sql += `VALUES (\n`;
        sql += `  '${b.id}',\n`;
        sql += `  '${b.profile_id}',\n`;
        sql += `  '${b.type}',\n`;
        sql += `  ${b.title ? `'${escapeSQL(b.title)}'` : 'NULL'},\n`;
        sql += `  ${b.subtitle ? `'${escapeSQL(b.subtitle)}'` : 'NULL'},\n`;
        sql += `  ${b.url ? `'${escapeSQL(b.url)}'` : 'NULL'},\n`;
        sql += `  ${b.icon ? `'${escapeSQL(b.icon)}'` : 'NULL'},\n`;
        sql += `  ${b.thumbnail_url ? `'${escapeSQL(b.thumbnail_url)}'` : 'NULL'},\n`;
        sql += `  '${JSON.stringify(b.content || {})}',\n`;
        sql += `  '${JSON.stringify(b.button_style || {})}',\n`;
        sql += `  ${b.position || 0},\n`;
        sql += `  ${b.is_enabled ? 1 : 0},\n`;
        sql += `  ${b.is_featured ? 1 : 0},\n`;
        sql += `  ${b.total_clicks || 0},\n`;
        sql += `  ${b.schedule_start ? `'${formatMySQLDate(b.schedule_start)}'` : 'NULL'},\n`;
        sql += `  ${b.schedule_end ? `'${formatMySQLDate(b.schedule_end)}'` : 'NULL'},\n`;
        sql += `  '${formatMySQLDate(b.created_at)}',\n`;
        sql += `  '${formatMySQLDate(b.updated_at)}'\n`;
        sql += `);\n\n`;
      });
    }

    sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;
    return sql;
  };

  const generateSQLiteExport = (profileData: any, blocksData: any[]) => {
    const timestamp = new Date().toISOString();
    let sql = `-- LinkDC Database Export (SQLite)\n`;
    sql += `-- Generated: ${timestamp}\n`;
    sql += `-- Format: SQLite\n\n`;
    sql += `PRAGMA foreign_keys = OFF;\n\n`;

    // Create profiles table
    sql += `-- Create profiles table\n`;
    sql += `CREATE TABLE IF NOT EXISTS link_profiles (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  user_id TEXT NOT NULL,\n`;
    sql += `  username TEXT NOT NULL UNIQUE,\n`;
    sql += `  display_name TEXT,\n`;
    sql += `  bio TEXT,\n`;
    sql += `  avatar_url TEXT,\n`;
    sql += `  cover_url TEXT,\n`;
    sql += `  location TEXT,\n`;
    sql += `  theme_preset TEXT DEFAULT 'default',\n`;
    sql += `  background_type TEXT DEFAULT 'solid',\n`;
    sql += `  background_value TEXT DEFAULT '#ffffff',\n`;
    sql += `  social_links TEXT,\n`;
    sql += `  custom_colors TEXT,\n`;
    sql += `  custom_fonts TEXT,\n`;
    sql += `  seo_title TEXT,\n`;
    sql += `  seo_description TEXT,\n`;
    sql += `  og_image_url TEXT,\n`;
    sql += `  is_public INTEGER DEFAULT 1,\n`;
    sql += `  is_password_protected INTEGER DEFAULT 0,\n`;
    sql += `  total_views INTEGER DEFAULT 0,\n`;
    sql += `  created_at TEXT,\n`;
    sql += `  updated_at TEXT\n`;
    sql += `);\n\n`;

    // Create blocks table
    sql += `-- Create blocks table\n`;
    sql += `CREATE TABLE IF NOT EXISTS blocks (\n`;
    sql += `  id TEXT PRIMARY KEY,\n`;
    sql += `  profile_id TEXT NOT NULL REFERENCES link_profiles(id) ON DELETE CASCADE,\n`;
    sql += `  type TEXT NOT NULL,\n`;
    sql += `  title TEXT,\n`;
    sql += `  subtitle TEXT,\n`;
    sql += `  url TEXT,\n`;
    sql += `  icon TEXT,\n`;
    sql += `  thumbnail_url TEXT,\n`;
    sql += `  content TEXT,\n`;
    sql += `  button_style TEXT,\n`;
    sql += `  position INTEGER DEFAULT 0,\n`;
    sql += `  is_enabled INTEGER DEFAULT 1,\n`;
    sql += `  is_featured INTEGER DEFAULT 0,\n`;
    sql += `  open_in_new_tab INTEGER DEFAULT 1,\n`;
    sql += `  mobile_only INTEGER DEFAULT 0,\n`;
    sql += `  desktop_only INTEGER DEFAULT 0,\n`;
    sql += `  schedule_start TEXT,\n`;
    sql += `  schedule_end TEXT,\n`;
    sql += `  total_clicks INTEGER DEFAULT 0,\n`;
    sql += `  created_at TEXT,\n`;
    sql += `  updated_at TEXT\n`;
    sql += `);\n\n`;

    // Insert profile data
    if (profileData) {
      sql += `-- Insert profile data\n`;
      const p = profileData;
      sql += `INSERT INTO link_profiles (id, user_id, username, display_name, bio, avatar_url, cover_url, location, theme_preset, background_type, background_value, social_links, custom_colors, custom_fonts, seo_title, seo_description, is_public, total_views, created_at, updated_at)\n`;
      sql += `VALUES (\n`;
      sql += `  '${p.id}',\n`;
      sql += `  '${p.user_id}',\n`;
      sql += `  '${escapeSQL(p.username)}',\n`;
      sql += `  ${p.display_name ? `'${escapeSQL(p.display_name)}'` : 'NULL'},\n`;
      sql += `  ${p.bio ? `'${escapeSQL(p.bio)}'` : 'NULL'},\n`;
      sql += `  ${p.avatar_url ? `'${escapeSQL(p.avatar_url)}'` : 'NULL'},\n`;
      sql += `  ${p.cover_url ? `'${escapeSQL(p.cover_url)}'` : 'NULL'},\n`;
      sql += `  ${p.location ? `'${escapeSQL(p.location)}'` : 'NULL'},\n`;
      sql += `  '${p.theme_preset || 'default'}',\n`;
      sql += `  '${p.background_type || 'solid'}',\n`;
      sql += `  '${escapeSQL(p.background_value || '#ffffff')}',\n`;
      sql += `  '${JSON.stringify(p.social_links || {})}',\n`;
      sql += `  '${JSON.stringify(p.custom_colors || {})}',\n`;
      sql += `  '${JSON.stringify(p.custom_fonts || {})}',\n`;
      sql += `  ${p.seo_title ? `'${escapeSQL(p.seo_title)}'` : 'NULL'},\n`;
      sql += `  ${p.seo_description ? `'${escapeSQL(p.seo_description)}'` : 'NULL'},\n`;
      sql += `  ${p.is_public ? 1 : 0},\n`;
      sql += `  ${p.total_views || 0},\n`;
      sql += `  '${p.created_at}',\n`;
      sql += `  '${p.updated_at}'\n`;
      sql += `);\n\n`;
    }

    // Insert blocks data
    if (blocksData && blocksData.length > 0) {
      sql += `-- Insert blocks data\n`;
      blocksData.forEach((b) => {
        sql += `INSERT INTO blocks (id, profile_id, type, title, subtitle, url, icon, thumbnail_url, content, button_style, position, is_enabled, is_featured, total_clicks, schedule_start, schedule_end, created_at, updated_at)\n`;
        sql += `VALUES (\n`;
        sql += `  '${b.id}',\n`;
        sql += `  '${b.profile_id}',\n`;
        sql += `  '${b.type}',\n`;
        sql += `  ${b.title ? `'${escapeSQL(b.title)}'` : 'NULL'},\n`;
        sql += `  ${b.subtitle ? `'${escapeSQL(b.subtitle)}'` : 'NULL'},\n`;
        sql += `  ${b.url ? `'${escapeSQL(b.url)}'` : 'NULL'},\n`;
        sql += `  ${b.icon ? `'${escapeSQL(b.icon)}'` : 'NULL'},\n`;
        sql += `  ${b.thumbnail_url ? `'${escapeSQL(b.thumbnail_url)}'` : 'NULL'},\n`;
        sql += `  '${JSON.stringify(b.content || {})}',\n`;
        sql += `  '${JSON.stringify(b.button_style || {})}',\n`;
        sql += `  ${b.position || 0},\n`;
        sql += `  ${b.is_enabled ? 1 : 0},\n`;
        sql += `  ${b.is_featured ? 1 : 0},\n`;
        sql += `  ${b.total_clicks || 0},\n`;
        sql += `  ${b.schedule_start ? `'${b.schedule_start}'` : 'NULL'},\n`;
        sql += `  ${b.schedule_end ? `'${b.schedule_end}'` : 'NULL'},\n`;
        sql += `  '${b.created_at}',\n`;
        sql += `  '${b.updated_at}'\n`;
        sql += `);\n\n`;
      });
    }

    sql += `PRAGMA foreign_keys = ON;\n`;
    return sql;
  };

  const generateCSVExport = (profileData: any, blocksData: any[]) => {
    // Profile CSV
    let profileCsv = 'id,username,display_name,bio,avatar_url,cover_url,location,theme_preset,background_type,background_value,is_public,total_views,created_at,updated_at\n';
    if (profileData) {
      const p = profileData;
      profileCsv += `"${p.id}","${p.username}","${escapeCSV(p.display_name || '')}","${escapeCSV(p.bio || '')}","${p.avatar_url || ''}","${p.cover_url || ''}","${escapeCSV(p.location || '')}","${p.theme_preset || 'default'}","${p.background_type || 'solid'}","${p.background_value || '#ffffff'}",${p.is_public ? 'true' : 'false'},${p.total_views || 0},"${p.created_at}","${p.updated_at}"\n`;
    }

    // Blocks CSV
    let blocksCsv = 'id,profile_id,type,title,subtitle,url,icon,position,is_enabled,is_featured,total_clicks,created_at,updated_at\n';
    if (blocksData && blocksData.length > 0) {
      blocksData.forEach((b) => {
        blocksCsv += `"${b.id}","${b.profile_id}","${b.type}","${escapeCSV(b.title || '')}","${escapeCSV(b.subtitle || '')}","${b.url || ''}","${b.icon || ''}",${b.position || 0},${b.is_enabled ? 'true' : 'false'},${b.is_featured ? 'true' : 'false'},${b.total_clicks || 0},"${b.created_at}","${b.updated_at}"\n`;
      });
    }

    return { profiles: profileCsv, blocks: blocksCsv };
  };

  const escapeSQL = (str: string): string => {
    return str?.replace(/'/g, "''") || '';
  };

  const escapeCSV = (str: string): string => {
    return str?.replace(/"/g, '""') || '';
  };

  const formatMySQLDate = (isoDate: string): string => {
    return isoDate?.replace('T', ' ').replace('Z', '').split('.')[0] || '';
  };

  const handleExportDatabase = async () => {
    setExporting(true);
    try {
      // Gather all user data
      let blocksData: any[] = [];
      
      if (profile?.id) {
        const { data: blocks } = await supabase
          .from('blocks')
          .select('*')
          .eq('profile_id', profile.id)
          .order('position', { ascending: true });
        
        if (blocks) {
          blocksData = blocks;
        }
      }

      let content: string;
      let filename: string;
      let mimeType: string;
      const dateStr = new Date().toISOString().split('T')[0];

      switch (exportFormat) {
        case 'postgresql':
          content = generatePostgreSQLExport(profile, blocksData);
          filename = `linkdc-export-postgresql-${dateStr}.sql`;
          mimeType = 'application/sql';
          break;
        case 'mysql':
          content = generateMySQLExport(profile, blocksData);
          filename = `linkdc-export-mysql-${dateStr}.sql`;
          mimeType = 'application/sql';
          break;
        case 'sqlite':
          content = generateSQLiteExport(profile, blocksData);
          filename = `linkdc-export-sqlite-${dateStr}.sql`;
          mimeType = 'application/sql';
          break;
        case 'csv':
          const csvData = generateCSVExport(profile, blocksData);
          // Create a simple text file with both CSVs
          content = `=== PROFILES ===\n${csvData.profiles}\n=== BLOCKS ===\n${csvData.blocks}`;
          filename = `linkdc-export-csv-${dateStr}.txt`;
          mimeType = 'text/plain';
          break;
        default:
          content = JSON.stringify({
            profile: profile,
            blocks: blocksData,
            exportedAt: new Date().toISOString(),
            format: 'json',
          }, null, 2);
          filename = `linkdc-export-json-${dateStr}.json`;
          mimeType = 'application/json';
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Database exported as ${exportFormat.toUpperCase()}!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export database');
    }
    setExporting(false);
  };

  const selectedFormat = formatOptions.find(f => f.value === exportFormat);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Database Export
        </h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p>Export your data to transfer to your own database server. See DATABASE_EXPORT.md for detailed instructions.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Export your data to transfer to PostgreSQL, MySQL, SQLite, or other databases.
      </p>

      <div className="space-y-4">
        <div>
          <Label>Export Format</Label>
          <Select value={exportFormat} onValueChange={(v: ExportFormat) => setExportFormat(v)}>
            <SelectTrigger className="mt-2">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {selectedFormat?.icon}
                  <span>{selectedFormat?.label}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {formatOptions.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  <div className="flex items-center gap-2">
                    {format.icon}
                    <div>
                      <div className="font-medium">{format.label}</div>
                      <div className="text-xs text-muted-foreground">{format.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={handleExportDatabase}
          disabled={exporting}
        >
          <Download className="w-4 h-4 mr-2" />
          {exporting ? 'Exporting...' : `Export as ${selectedFormat?.label}`}
        </Button>

        <p className="text-xs text-muted-foreground">
          See <code className="bg-muted px-1 rounded">DATABASE_EXPORT.md</code> for import instructions.
        </p>
      </div>
    </motion.div>
  );
}
