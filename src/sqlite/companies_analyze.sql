DROP TABLE IF EXISTS companies_analyze;
CREATE TABLE companies_analyze (
	total_companies INTEGER
);
INSERT INTO companies_analyze (total_companies) SELECT COUNT(*) FROM companies;
