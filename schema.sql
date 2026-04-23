-- Run once to initialize the D1 database:
-- wrangler d1 execute frugal-planner-db --file=schema.sql

CREATE TABLE IF NOT EXISTS weeks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_key TEXT NOT NULL UNIQUE,
  week_num INTEGER,
  date_from TEXT,
  date_to TEXT,
  notes TEXT DEFAULT '',
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  week_key TEXT NOT NULL,
  category TEXT NOT NULL,
  text TEXT DEFAULT '',
  done INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (week_key) REFERENCES weeks(week_key)
);

CREATE INDEX IF NOT EXISTS idx_tasks_week ON tasks(week_key);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(week_key, category);
