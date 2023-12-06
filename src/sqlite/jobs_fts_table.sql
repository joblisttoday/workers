CREATE VIRTUAL TABLE IF NOT EXISTS jobs_fts USING fts3 (
	objectID, name, url, location, published_date, company_slug, company_title
);
