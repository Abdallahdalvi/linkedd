require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// ─── Middleware ───
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

// ─── MySQL Pool ───
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'linkbio',
  user: process.env.DB_USER || 'linkbio_user',
  password: process.env.DB_PASSWORD || 'linkbio_pass',
  waitForConnections: true,
  connectionLimit: 10,
});

// ─── File Upload ───
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ─── Auth Middleware ───
function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

async function adminOnly(req, res, next) {
  const [rows] = await pool.query(
    "SELECT role FROM user_roles WHERE user_id = ? AND role IN ('admin','super_admin')",
    [req.user.id]
  );
  if (rows.length === 0) return res.status(403).json({ error: 'Admin access required' });
  next();
}

// ─── Auth Routes ───
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const id = uuidv4();
    await pool.query(
      'INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
      [id, email, hash, full_name || email]
    );
    await pool.query(
      "INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, 'client')",
      [uuidv4(), id]
    );
    const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id, email, full_name } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    if (user.is_suspended) return res.status(403).json({ error: 'Account suspended' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
    const [roleRows] = await pool.query('SELECT role FROM user_roles WHERE user_id = ?', [user.id]);
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user.id, email: user.email, full_name: user.full_name,
        avatar_url: user.avatar_url,
        roles: roleRows.map(r => r.role),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  const [rows] = await pool.query('SELECT id, email, full_name, avatar_url FROM users WHERE id = ?', [req.user.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
  const [roleRows] = await pool.query('SELECT role FROM user_roles WHERE user_id = ?', [req.user.id]);
  res.json({ ...rows[0], roles: roleRows.map(r => r.role) });
});

// ─── Profile Routes ───
app.get('/api/profiles/:username', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM link_profiles WHERE username = ? AND is_public = TRUE', [req.params.username]);
  if (rows.length === 0) return res.status(404).json({ error: 'Profile not found' });
  const profile = rows[0];
  const [blocks] = await pool.query(
    'SELECT * FROM blocks WHERE profile_id = ? AND is_enabled = TRUE ORDER BY position',
    [profile.id]
  );
  await pool.query('UPDATE link_profiles SET total_views = total_views + 1 WHERE id = ?', [profile.id]);
  res.json({ profile, blocks });
});

app.get('/api/my/profile', auth, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM link_profiles WHERE user_id = ?', [req.user.id]);
  if (rows.length === 0) return res.json({ profile: null, blocks: [] });
  const profile = rows[0];
  const [blocks] = await pool.query('SELECT * FROM blocks WHERE profile_id = ? ORDER BY position', [profile.id]);
  res.json({ profile, blocks });
});

app.post('/api/my/profile', auth, async (req, res) => {
  const { username } = req.body;
  const id = uuidv4();
  try {
    await pool.query('INSERT INTO link_profiles (id, user_id, username) VALUES (?, ?, ?)', [id, req.user.id, username]);
    res.json({ id, username });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username taken' });
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/my/profile', auth, async (req, res) => {
  const fields = req.body;
  const [existing] = await pool.query('SELECT id FROM link_profiles WHERE user_id = ?', [req.user.id]);
  if (existing.length === 0) return res.status(404).json({ error: 'No profile' });
  const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
  const values = Object.values(fields).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
  await pool.query(`UPDATE link_profiles SET ${setClauses} WHERE user_id = ?`, [...values, req.user.id]);
  res.json({ success: true });
});

// ─── Block Routes ───
app.post('/api/my/blocks', auth, async (req, res) => {
  const [profile] = await pool.query('SELECT id FROM link_profiles WHERE user_id = ?', [req.user.id]);
  if (profile.length === 0) return res.status(404).json({ error: 'No profile' });
  const id = uuidv4();
  const { type, title, subtitle, url, icon, thumbnail_url, content, button_style, is_featured, open_in_new_tab } = req.body;
  const [maxPos] = await pool.query('SELECT COALESCE(MAX(position), -1) + 1 AS pos FROM blocks WHERE profile_id = ?', [profile[0].id]);
  await pool.query(
    `INSERT INTO blocks (id, profile_id, type, title, subtitle, url, icon, thumbnail_url, content, button_style, position, is_featured, open_in_new_tab)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, profile[0].id, type, title, subtitle, url, icon, thumbnail_url,
      content ? JSON.stringify(content) : null, button_style ? JSON.stringify(button_style) : null,
      maxPos[0].pos, is_featured || false, open_in_new_tab ?? true]
  );
  res.json({ id });
});

app.put('/api/my/blocks/:id', auth, async (req, res) => {
  const fields = req.body;
  const jsonFields = ['content', 'button_style'];
  const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
  const values = Object.values(fields).map((v, i) =>
    jsonFields.includes(Object.keys(fields)[i]) && typeof v === 'object' ? JSON.stringify(v) : v
  );
  await pool.query(`UPDATE blocks SET ${setClauses} WHERE id = ?`, [...values, req.params.id]);
  res.json({ success: true });
});

app.delete('/api/my/blocks/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM blocks WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

app.put('/api/my/blocks/reorder', auth, async (req, res) => {
  const { order } = req.body; // [{ id, position }]
  for (const item of order) {
    await pool.query('UPDATE blocks SET position = ? WHERE id = ?', [item.position, item.id]);
  }
  res.json({ success: true });
});

// ─── Leads Routes ───
app.post('/api/leads', async (req, res) => {
  const { block_id, profile_id, visitor_id, name, email, phone } = req.body;
  const id = uuidv4();
  await pool.query(
    'INSERT INTO block_leads (id, block_id, profile_id, visitor_id, name, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, block_id, profile_id, visitor_id, name, email, phone]
  );
  res.json({ id });
});

app.get('/api/my/leads', auth, async (req, res) => {
  const [profile] = await pool.query('SELECT id FROM link_profiles WHERE user_id = ?', [req.user.id]);
  if (profile.length === 0) return res.json([]);
  const [leads] = await pool.query(
    `SELECT bl.*, b.title AS block_title, b.type AS block_type
     FROM block_leads bl JOIN blocks b ON bl.block_id = b.id
     WHERE bl.profile_id = ? ORDER BY bl.created_at DESC`,
    [profile[0].id]
  );
  res.json(leads);
});

app.delete('/api/my/leads/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM block_leads WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ─── Analytics Routes ───
app.post('/api/analytics', async (req, res) => {
  const id = uuidv4();
  const { profile_id, block_id, event_type, visitor_id, referrer, browser, device_type, country, city } = req.body;
  await pool.query(
    'INSERT INTO analytics_events (id, profile_id, block_id, event_type, visitor_id, referrer, browser, device_type, country, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, profile_id, block_id, event_type, visitor_id, referrer, browser, device_type, country, city]
  );
  if (block_id) await pool.query('UPDATE blocks SET total_clicks = total_clicks + 1 WHERE id = ?', [block_id]);
  res.json({ id });
});

app.get('/api/my/analytics', auth, async (req, res) => {
  const [profile] = await pool.query('SELECT id FROM link_profiles WHERE user_id = ?', [req.user.id]);
  if (profile.length === 0) return res.json([]);
  const [events] = await pool.query(
    'SELECT * FROM analytics_events WHERE profile_id = ? ORDER BY created_at DESC LIMIT 1000',
    [profile[0].id]
  );
  res.json(events);
});

// ─── File Upload ───
app.post('/api/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// ─── Admin Routes ───
app.get('/api/admin/users', auth, adminOnly, async (req, res) => {
  const [users] = await pool.query(
    `SELECT u.id, u.email, u.full_name, u.avatar_url, u.is_suspended, u.is_verified, u.last_login_at, u.created_at,
     GROUP_CONCAT(ur.role) AS roles
     FROM users u LEFT JOIN user_roles ur ON u.id = ur.user_id GROUP BY u.id ORDER BY u.created_at DESC`
  );
  res.json(users.map(u => ({ ...u, roles: u.roles ? u.roles.split(',') : ['client'] })));
});

app.put('/api/admin/users/:id/role', auth, adminOnly, async (req, res) => {
  const { role } = req.body;
  await pool.query('DELETE FROM user_roles WHERE user_id = ?', [req.params.id]);
  await pool.query('INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)', [uuidv4(), req.params.id, role]);
  res.json({ success: true });
});

app.put('/api/admin/users/:id/suspend', auth, adminOnly, async (req, res) => {
  const { suspended } = req.body;
  await pool.query('UPDATE users SET is_suspended = ? WHERE id = ?', [suspended, req.params.id]);
  res.json({ success: true });
});

app.get('/api/admin/settings', auth, adminOnly, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM admin_settings');
  res.json(rows);
});

app.put('/api/admin/settings/:key', auth, adminOnly, async (req, res) => {
  const { value } = req.body;
  await pool.query(
    `INSERT INTO admin_settings (id, setting_key, setting_value, updated_by) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)`,
    [uuidv4(), req.params.key, JSON.stringify(value), req.user.id]
  );
  res.json({ success: true });
});

// ─── Health Check ───
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', app: process.env.APP_NAME || 'LinkBio' });
  } catch {
    res.status(500).json({ status: 'error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 ${process.env.APP_NAME || 'LinkBio'} API running on port ${PORT}`);
});
