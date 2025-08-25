CREATE TABLE IF NOT EXISTS jobs (
	id TEXT PRIMARY KEY,
	name TEXT,
	url TEXT,
	description TEXT,
	location TEXT,
	published_date TEXT,
	employment_type TEXT,
	department TEXT,
	company_id TEXT,
	company_title TEXT
);
