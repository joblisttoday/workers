INSERT INTO stats (generated_at, total_jobs, total_companies)
SELECT
	datetime('now'),
	(SELECT COUNT(*) FROM jobs),
	(SELECT COUNT(*) FROM companies);
