CREATE TABLE IF NOT EXISTS companies_analyze (
	total_companies INTEGER
);
INSERT INTO companies_analyze (total_companies) SELECT COUNT(*) FROM companies;
