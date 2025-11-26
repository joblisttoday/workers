CREATE TABLE IF NOT EXISTS stats (
	generated_at TEXT DEFAULT (datetime('now')),
	total_jobs INTEGER,
	total_companies INTEGER
);
