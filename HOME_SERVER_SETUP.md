# Home Server Setup Guide (Ubuntu Server / CasaOS)

Complete guide to self-host this Link-in-Bio application on your own home server with MySQL database.

## 📋 Requirements

### Hardware (Minimum)
- CPU: 2 cores
- RAM: 2GB (4GB recommended)
- Storage: 10GB free space
- Network: Static local IP or dynamic DNS

### Software
- Ubuntu Server 20.04+ or CasaOS
- Node.js 18+ (or Bun)
- MySQL 8.0+
- Nginx (reverse proxy)
- PM2 (process manager)
- Git

---

## 🚀 Quick Start

### Step 1: Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2: Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should show v20.x.x
```

### Step 3: Install MySQL 8

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

Configure MySQL:
```bash
sudo mysql
```

```sql
-- Create database and user
CREATE DATABASE linkbio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'linkbio_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON linkbio.* TO 'linkbio_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 4: Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Step 5: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

---

## 📦 Application Setup

### Step 1: Clone or Upload Project

```bash
# Create app directory
sudo mkdir -p /var/www/linkbio
sudo chown $USER:$USER /var/www/linkbio
cd /var/www/linkbio

# Option A: Clone from GitHub
git clone https://github.com/your-repo/linkbio.git .

# Option B: Upload via SCP from your local machine
# scp -r ./dist/* user@your-server:/var/www/linkbio/
```

### Step 2: Build the Application

```bash
cd /var/www/linkbio

# Install dependencies
npm install

# Build for production
npm run build
```

### Step 3: Set Up Environment Variables

Create `/var/www/linkbio/.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=linkbio
DB_USER=linkbio_user
DB_PASSWORD=your_secure_password

# Application
NODE_ENV=production
PORT=3001
APP_URL=http://your-domain.com

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_jwt_secret_here

# Optional: Email (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 🗄️ Database Schema Setup

### Import the Schema

Create `/var/www/linkbio/schema.sql`:

```sql
-- =====================================================
-- Link-in-Bio Complete MySQL Schema
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------
-- Table: profiles (User accounts)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role ENUM('super_admin', 'admin', 'client') DEFAULT 'client',
  is_verified BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_profiles_email (email),
  INDEX idx_profiles_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: link_profiles (Public profile pages)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS link_profiles (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  location VARCHAR(255),
  theme_preset VARCHAR(50) DEFAULT 'default',
  background_type ENUM('solid', 'gradient', 'image') DEFAULT 'solid',
  background_value VARCHAR(500),
  social_links JSON,
  custom_colors JSON,
  custom_fonts JSON,
  seo_title VARCHAR(255),
  seo_description TEXT,
  og_image_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  is_password_protected BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255),
  total_views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_link_profiles_username (username),
  INDEX idx_link_profiles_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: blocks (Content blocks on profiles)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS blocks (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  profile_id CHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  subtitle VARCHAR(255),
  url TEXT,
  icon VARCHAR(50),
  thumbnail_url TEXT,
  content JSON,
  button_style JSON,
  position INT DEFAULT 0,
  is_enabled BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  open_in_new_tab BOOLEAN DEFAULT TRUE,
  mobile_only BOOLEAN DEFAULT FALSE,
  desktop_only BOOLEAN DEFAULT FALSE,
  total_clicks INT DEFAULT 0,
  schedule_start TIMESTAMP NULL,
  schedule_end TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES link_profiles(id) ON DELETE CASCADE,
  INDEX idx_blocks_profile_id (profile_id),
  INDEX idx_blocks_position (position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: custom_domains
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS custom_domains (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  profile_id CHAR(36) NOT NULL,
  domain VARCHAR(255) NOT NULL UNIQUE,
  status ENUM('pending', 'verifying', 'active', 'failed') DEFAULT 'pending',
  verification_token VARCHAR(255),
  dns_verified BOOLEAN DEFAULT FALSE,
  ssl_status VARCHAR(50),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES link_profiles(id) ON DELETE CASCADE,
  INDEX idx_custom_domains_domain (domain),
  INDEX idx_custom_domains_profile_id (profile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: analytics_events
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_events (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  profile_id CHAR(36),
  block_id CHAR(36),
  event_type VARCHAR(50) NOT NULL,
  visitor_id VARCHAR(255),
  referrer TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(50),
  browser VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES link_profiles(id) ON DELETE SET NULL,
  FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE SET NULL,
  INDEX idx_analytics_profile_id (profile_id),
  INDEX idx_analytics_created_at (created_at),
  INDEX idx_analytics_event_type (event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: audit_logs
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id CHAR(36),
  details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_user_id (user_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: admin_settings
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_settings (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value JSON NOT NULL,
  updated_by CHAR(36),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admin_settings_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table: user_roles
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS user_roles (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  role ENUM('super_admin', 'admin', 'client') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_role (user_id, role),
  INDEX idx_user_roles_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------
-- Helper Functions (as Stored Procedures)
-- -----------------------------------------------------

DELIMITER //

CREATE PROCEDURE has_role(IN p_role VARCHAR(50), IN p_user_id CHAR(36), OUT result BOOLEAN)
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM user_roles WHERE user_id = p_user_id AND role = p_role
  ) OR EXISTS(
    SELECT 1 FROM profiles WHERE id = p_user_id AND role = p_role
  ) INTO result;
END //

CREATE PROCEDURE is_admin(IN p_user_id CHAR(36), OUT result BOOLEAN)
BEGIN
  CALL has_role('admin', p_user_id, @is_admin);
  CALL has_role('super_admin', p_user_id, @is_super);
  SET result = @is_admin OR @is_super;
END //

DELIMITER ;

-- -----------------------------------------------------
-- Create Default Admin User
-- Password: admin123 (change immediately!)
-- -----------------------------------------------------
INSERT INTO profiles (id, email, password_hash, full_name, role, is_verified)
VALUES (
  UUID(),
  'admin@localhost',
  '$2b$10$rQZ8K.FmAh5xF5F5F5F5F.HASHED_PASSWORD_HERE',
  'Administrator',
  'super_admin',
  TRUE
);
```

Import the schema:
```bash
mysql -u linkbio_user -p linkbio < /var/www/linkbio/schema.sql
```

---

## 🌐 Backend API Setup

You'll need a simple Node.js/Express backend to replace Supabase. Create `/var/www/linkbio/server/`:

### `server/index.js`

```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// Auth middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await pool.query('SELECT * FROM profiles WHERE id = ?', [decoded.userId]);
    if (!users.length) return res.status(401).json({ error: 'User not found' });
    req.user = users[0];
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============ AUTH ROUTES ============

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = require('crypto').randomUUID();
    
    await pool.query(
      'INSERT INTO profiles (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
      [userId, email, hashedPassword, fullName]
    );
    
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: userId, email, full_name: fullName }, token });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Sign In
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query('SELECT * FROM profiles WHERE email = ?', [email]);
    
    if (!users.length) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, users[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    
    // Update last login
    await pool.query('UPDATE profiles SET last_login_at = NOW() WHERE id = ?', [users[0].id]);
    
    const token = jwt.sign({ userId: users[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: users[0], token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Current User
app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// ============ PROFILE ROUTES ============

// Get user's link profile
app.get('/api/profiles/me', authenticate, async (req, res) => {
  try {
    const [profiles] = await pool.query(
      'SELECT * FROM link_profiles WHERE user_id = ?',
      [req.user.id]
    );
    res.json(profiles[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get public profile by username
app.get('/api/profiles/:username', async (req, res) => {
  try {
    const [profiles] = await pool.query(
      'SELECT * FROM link_profiles WHERE username = ? AND is_public = TRUE',
      [req.params.username]
    );
    if (!profiles.length) return res.status(404).json({ error: 'Profile not found' });
    
    // Increment view count
    await pool.query(
      'UPDATE link_profiles SET total_views = total_views + 1 WHERE id = ?',
      [profiles[0].id]
    );
    
    res.json(profiles[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile
app.put('/api/profiles/me', authenticate, async (req, res) => {
  try {
    const updates = req.body;
    const [existing] = await pool.query(
      'SELECT id FROM link_profiles WHERE user_id = ?',
      [req.user.id]
    );
    
    if (!existing.length) {
      // Create new profile
      const profileId = require('crypto').randomUUID();
      await pool.query(
        'INSERT INTO link_profiles (id, user_id, username) VALUES (?, ?, ?)',
        [profileId, req.user.id, updates.username || req.user.email.split('@')[0]]
      );
    }
    
    // Update profile
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    await pool.query(
      `UPDATE link_profiles SET ${fields} WHERE user_id = ?`,
      [...Object.values(updates), req.user.id]
    );
    
    const [profiles] = await pool.query(
      'SELECT * FROM link_profiles WHERE user_id = ?',
      [req.user.id]
    );
    res.json(profiles[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ BLOCKS ROUTES ============

// Get blocks for a profile
app.get('/api/blocks/:profileId', async (req, res) => {
  try {
    const [blocks] = await pool.query(
      'SELECT * FROM blocks WHERE profile_id = ? ORDER BY position',
      [req.params.profileId]
    );
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create block
app.post('/api/blocks', authenticate, async (req, res) => {
  try {
    const blockId = require('crypto').randomUUID();
    const { profile_id, type, title, url, ...rest } = req.body;
    
    await pool.query(
      'INSERT INTO blocks (id, profile_id, type, title, url, content, button_style) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [blockId, profile_id, type, title, url, JSON.stringify(rest.content || {}), JSON.stringify(rest.button_style || {})]
    );
    
    const [blocks] = await pool.query('SELECT * FROM blocks WHERE id = ?', [blockId]);
    res.json(blocks[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update block
app.put('/api/blocks/:id', authenticate, async (req, res) => {
  try {
    const updates = req.body;
    if (updates.content) updates.content = JSON.stringify(updates.content);
    if (updates.button_style) updates.button_style = JSON.stringify(updates.button_style);
    
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    await pool.query(
      `UPDATE blocks SET ${fields} WHERE id = ?`,
      [...Object.values(updates), req.params.id]
    );
    
    const [blocks] = await pool.query('SELECT * FROM blocks WHERE id = ?', [req.params.id]);
    res.json(blocks[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete block
app.delete('/api/blocks/:id', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM blocks WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ ANALYTICS ============

// Track event
app.post('/api/analytics', async (req, res) => {
  try {
    const eventId = require('crypto').randomUUID();
    const { profile_id, block_id, event_type, visitor_id, referrer } = req.body;
    
    await pool.query(
      'INSERT INTO analytics_events (id, profile_id, block_id, event_type, visitor_id, referrer) VALUES (?, ?, ?, ?, ?, ?)',
      [eventId, profile_id, block_id, event_type, visitor_id, referrer]
    );
    
    // Update click count if block click
    if (block_id && event_type === 'click') {
      await pool.query('UPDATE blocks SET total_clicks = total_clicks + 1 WHERE id = ?', [block_id]);
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ SERVE STATIC FILES ============

// Serve the built React app
app.use(express.static(path.join(__dirname, '../dist')));

// SPA fallback - all other routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Install Backend Dependencies

```bash
cd /var/www/linkbio/server
npm init -y
npm install express mysql2 bcrypt jsonwebtoken cors dotenv
```

---

## ⚙️ Nginx Configuration

Create `/etc/nginx/sites-available/linkbio`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # For local network access (replace with your server's local IP)
    # server_name 192.168.1.100;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase upload size for images
    client_max_body_size 10M;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/linkbio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔄 PM2 Process Manager

Create `/var/www/linkbio/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'linkbio',
    script: './server/index.js',
    cwd: '/var/www/linkbio',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/var/log/linkbio/error.log',
    out_file: '/var/log/linkbio/output.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

Start the application:
```bash
# Create log directory
sudo mkdir -p /var/log/linkbio
sudo chown $USER:$USER /var/log/linkbio

# Start with PM2
cd /var/www/linkbio
pm2 start ecosystem.config.js

# Save PM2 config to auto-restart on reboot
pm2 save
pm2 startup
```

---

## 🏠 CasaOS Specific Setup

If using CasaOS, you can create a custom app:

### Option 1: Use CasaOS App Store
Install MySQL and Nginx from the CasaOS app store first.

### Option 2: Docker Compose

Create `/var/www/linkbio/docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DB_HOST=db
      - DB_PORT=3306
      - DB_NAME=linkbio
      - DB_USER=linkbio_user
      - DB_PASSWORD=your_secure_password
      - JWT_SECRET=your_jwt_secret
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=linkbio
      - MYSQL_USER=linkbio_user
      - MYSQL_PASSWORD=your_secure_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./schema.sql:/docker-entrypoint-initdb.d/schema.sql
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mysql_data:
```

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["node", "server/index.js"]
```

Run with Docker:
```bash
docker-compose up -d
```

---

## 🔐 SSL Certificate (Optional)

For external access with HTTPS:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is enabled by default
sudo certbot renew --dry-run
```

---

## 🌍 External Access

### Option 1: Port Forwarding
1. Log into your router (usually 192.168.1.1)
2. Forward port 80 (and 443 for HTTPS) to your server's local IP
3. Use a dynamic DNS service if you don't have a static IP

### Option 2: Cloudflare Tunnel (Recommended)
```bash
# Install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create linkbio

# Configure tunnel
cloudflared tunnel route dns linkbio your-domain.com

# Run tunnel
cloudflared tunnel run linkbio
```

---

## 📝 Maintenance Commands

```bash
# View logs
pm2 logs linkbio

# Restart app
pm2 restart linkbio

# Update app
cd /var/www/linkbio
git pull
npm install
npm run build
pm2 restart linkbio

# Database backup
mysqldump -u linkbio_user -p linkbio > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u linkbio_user -p linkbio < backup_20240101.sql
```

---

## 🔧 Troubleshooting

### App won't start
```bash
# Check logs
pm2 logs linkbio --lines 50

# Check if port is in use
sudo lsof -i :3001
```

### Database connection failed
```bash
# Test MySQL connection
mysql -u linkbio_user -p -e "SELECT 1"

# Check MySQL is running
sudo systemctl status mysql
```

### Nginx errors
```bash
# Test config
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log
```

### Permission issues
```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/linkbio
chmod -R 755 /var/www/linkbio
```

---

## 📊 Monitoring

### Simple monitoring with PM2
```bash
pm2 monit
```

### System resources
```bash
htop
```

### Disk space
```bash
df -h
```

---

## 🎉 You're Done!

Your Link-in-Bio app should now be running at:
- **Local**: http://your-server-ip
- **External**: http://your-domain.com (if configured)

Default admin login (change immediately!):
- Email: admin@localhost
- Password: admin123
