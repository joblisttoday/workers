CREATE VIRTUAL TABLE IF NOT EXISTS jobs_fts USING fts3 (
	id, name, url, location, published_date, company_id, company_title
);
