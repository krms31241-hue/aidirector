const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'database.sqlite');
const db = new Database(dbPath);

// Ensure applied_migrations table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS applied_migrations (
    id TEXT PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const migrationsDir = path.join(__dirname, 'migrations');
if (!fs.existsSync(migrationsDir)) {
  console.log('No migrations dir found, skipping.');
  process.exit(0);
}

const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

for (const file of files) {
  const id = file;
  const already = db.prepare('SELECT 1 FROM applied_migrations WHERE id = ?').get(id);
  if (already) {
    console.log('skip', id);
    continue;
  }
  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  console.log('applying', id);
  db.exec(sql);
  db.prepare('INSERT INTO applied_migrations (id) VALUES (?)').run(id);
}
console.log('migrations applied');
