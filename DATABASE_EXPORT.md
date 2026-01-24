# Database Export & Transfer Guide

This guide explains how to export your data and transfer it to your own database server.

## Export Formats Supported

### 1. JSON (Default)
- **Best for**: JavaScript/Node.js applications, NoSQL databases (MongoDB, CouchDB)
- **File extension**: `.json`
- Human-readable format containing all your profile and blocks data

### 2. SQL (PostgreSQL)
- **Best for**: PostgreSQL databases
- **File extension**: `.sql`
- Contains `CREATE TABLE` statements and `INSERT` commands
- Compatible with PostgreSQL 12+

### 3. SQL (MySQL)
- **Best for**: MySQL/MariaDB databases
- **File extension**: `.sql`
- Uses MySQL-specific syntax and data types

### 4. SQL (SQLite)
- **Best for**: Lightweight local databases, mobile apps
- **File extension**: `.sql`
- SQLite-compatible SQL statements

### 5. CSV
- **Best for**: Spreadsheets, data analysis, simple imports
- **File extension**: `.csv` (ZIP archive)
- Separate CSV files for profiles and blocks

## How to Export

1. Go to **Dashboard → Settings → Account**
2. Find the **"Database Export"** section
3. Select your desired export format
4. Click **"Export Database"**
5. Save the downloaded file

## Importing to Your Own Server

### PostgreSQL

```bash
# Create the database
createdb your_database_name

# Import the SQL file
psql -d your_database_name -f export-postgresql-YYYY-MM-DD.sql
```

### MySQL

```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE your_database_name"

# Import the SQL file
mysql -u root -p your_database_name < export-mysql-YYYY-MM-DD.sql
```

### SQLite

```bash
# Create and import directly
sqlite3 your_database.db < export-sqlite-YYYY-MM-DD.sql
```

### MongoDB (from JSON)

```bash
# Import the JSON file
mongoimport --db your_database --collection profiles --file export-json-YYYY-MM-DD.json --jsonArray
```

### CSV Import

Most database tools support CSV import:
- **PostgreSQL**: Use `\copy` command or pgAdmin
- **MySQL**: Use `LOAD DATA INFILE` or MySQL Workbench
- **SQLite**: Use `.import` command

## Database Schema

### Profiles Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| username | TEXT | Unique username |
| display_name | TEXT | Display name |
| bio | TEXT | Profile biography |
| avatar_url | TEXT | Avatar image URL |
| cover_url | TEXT | Cover image URL |
| location | TEXT | Location |
| theme_preset | TEXT | Theme name |
| background_type | TEXT | solid, gradient, or image |
| background_value | TEXT | Background value |
| social_links | JSONB | Social media links |
| custom_colors | JSONB | Custom color settings |
| custom_fonts | JSONB | Custom font settings |
| seo_title | TEXT | SEO title |
| seo_description | TEXT | SEO description |
| is_public | BOOLEAN | Public visibility |
| total_views | INTEGER | Total profile views |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update date |

### Blocks Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| profile_id | UUID | Foreign key to profiles |
| type | TEXT | Block type (link, text, etc.) |
| title | TEXT | Block title |
| subtitle | TEXT | Block subtitle |
| url | TEXT | Link URL |
| icon | TEXT | Icon name |
| thumbnail_url | TEXT | Thumbnail image URL |
| content | JSONB | Additional content data |
| button_style | JSONB | Button styling |
| position | INTEGER | Display order |
| is_enabled | BOOLEAN | Visibility toggle |
| is_featured | BOOLEAN | Featured flag |
| total_clicks | INTEGER | Click count |
| schedule_start | TIMESTAMP | Scheduled start |
| schedule_end | TIMESTAMP | Scheduled end |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update date |

## Self-Hosting Setup

If you want to run your own instance with exported data:

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/link-in-bio.git
cd link-in-bio
npm install
```

### 2. Set Up Your Database

**PostgreSQL** (Recommended):
```bash
# Install PostgreSQL
sudo apt install postgresql

# Create database and user
sudo -u postgres createdb linkdc
sudo -u postgres createuser linkdc_user

# Import your data
psql -d linkdc -f your-export.sql
```

### 3. Configure Environment

Create a `.env` file:
```env
DATABASE_URL=postgresql://linkdc_user:password@localhost:5432/linkdc
```

### 4. Run the Application

```bash
npm run build
npm run start
```

## Data Privacy

- All exports contain only YOUR data
- No system or other users' data is included
- Sensitive fields (like password hashes) are excluded
- API keys and secrets are never exported

## Troubleshooting

### "Permission denied" errors during import
- Ensure the database user has proper permissions
- On PostgreSQL: `GRANT ALL PRIVILEGES ON DATABASE dbname TO username;`

### Foreign key constraint errors
- Import the profiles table first, then blocks
- The exported SQL files handle this automatically

### Character encoding issues
- Ensure your database uses UTF-8 encoding
- PostgreSQL: `CREATE DATABASE dbname ENCODING 'UTF8';`

## Need Help?

If you encounter issues with database export or import, please:
1. Check the troubleshooting section above
2. Ensure your database server is properly configured
3. Contact support with your specific error messages
