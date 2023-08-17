CREATE VIRTUAL TABLE IF NOT EXISTS jobs_fts USING fts5 (
	objectID, name, url, location, published_date, company_slug, company_title
);
