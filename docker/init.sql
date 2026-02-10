-- LinkBio Self-Hosted MySQL Schema
-- Compatible with the Lovable Cloud / Supabase schema

CREATE DATABASE IF NOT EXISTS linkbio;
USE linkbio;

-- ─── Users & Auth ───

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  is_suspended BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  role ENUM('super_admin', 'admin', 'client') NOT NULL DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_role (user_id, role)
);

-- ─── Link Profiles ───

CREATE TABLE IF NOT EXISTS link_profiles (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  location VARCHAR(255),
  theme_preset VARCHAR(50) DEFAULT 'default',
  background_type VARCHAR(50),
  background_value TEXT,
  custom_colors JSON,
  custom_fonts JSON,
  social_links JSON,
  seo_title VARCHAR(255),
  seo_description TEXT,
  og_image_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  is_password_protected BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255),
  total_views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Blocks ───

CREATE TABLE IF NOT EXISTS blocks (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  profile_id CHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  subtitle TEXT,
  url TEXT,
  icon VARCHAR(100),
  thumbnail_url TEXT,
  content JSON,
  button_style JSON,
  position INT DEFAULT 0,
  is_enabled BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  open_in_new_tab BOOLEAN DEFAULT TRUE,
  mobile_only BOOLEAN DEFAULT FALSE,
  desktop_only BOOLEAN DEFAULT FALSE,
  schedule_start TIMESTAMP NULL,
  schedule_end TIMESTAMP NULL,
  total_clicks INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES link_profiles(id) ON DELETE CASCADE
);

-- ─── Block Leads (Data Collection Gate) ───

CREATE TABLE IF NOT EXISTS block_leads (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  block_id CHAR(36) NOT NULL,
  profile_id CHAR(36) NOT NULL,
  visitor_id VARCHAR(255),
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE,
  FOREIGN KEY (profile_id) REFERENCES link_profiles(id) ON DELETE CASCADE
);

-- ─── Analytics ───

CREATE TABLE IF NOT EXISTS analytics_events (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  profile_id CHAR(36),
  block_id CHAR(36),
  event_type VARCHAR(50) NOT NULL,
  visitor_id VARCHAR(255),
  referrer TEXT,
  browser VARCHAR(100),
  device_type VARCHAR(50),
  country VARCHAR(100),
  city VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES link_profiles(id) ON DELETE SET NULL,
  FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE SET NULL
);

-- ─── Custom Domains ───

CREATE TABLE IF NOT EXISTS custom_domains (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  profile_id CHAR(36) NOT NULL,
  domain VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  dns_verified BOOLEAN DEFAULT FALSE,
  ssl_status VARCHAR(50),
  verification_token VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES link_profiles(id) ON DELETE CASCADE
);

-- ─── Admin Settings ───

CREATE TABLE IF NOT EXISTS admin_settings (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value JSON,
  updated_by CHAR(36),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Audit Logs ───

CREATE TABLE IF NOT EXISTS audit_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id CHAR(36),
  details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Indexes ───

CREATE INDEX idx_blocks_profile ON blocks(profile_id);
CREATE INDEX idx_blocks_position ON blocks(profile_id, position);
CREATE INDEX idx_analytics_profile ON analytics_events(profile_id);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);
CREATE INDEX idx_leads_profile ON block_leads(profile_id);
CREATE INDEX idx_leads_block ON block_leads(block_id);
CREATE INDEX idx_domains_profile ON custom_domains(profile_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
