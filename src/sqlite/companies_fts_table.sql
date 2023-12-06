CREATE VIRTUAL TABLE IF NOT EXISTS companies_fts USING fts3 (
	slug, title, description, tags, positions
);
