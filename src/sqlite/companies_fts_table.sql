CREATE VIRTUAL TABLE IF NOT EXISTS companies_fts USING fts3 (
	id, title, description, tags, positions
);
