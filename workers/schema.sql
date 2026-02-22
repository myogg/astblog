-- Create comments table
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page TEXT NOT NULL,
  name TEXT DEFAULT '匿名',
  email TEXT,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_page ON comments(page);
CREATE INDEX idx_created_at ON comments(created_at);
