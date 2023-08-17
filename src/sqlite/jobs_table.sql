CREATE TABLE IF NOT EXISTS jobs (
	objectID TEXT PRIMARY KEY,
	name TEXT,
	url TEXT,
	location TEXT,
	published_date TEXT,
	company_slug TEXT,
	company_title TEXT
);
