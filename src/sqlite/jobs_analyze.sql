CREATE TABLE IF NOT EXISTS jobs_analyze (
	total_jobs INTEGER
);
INSERT INTO jobs_analyze (total_jobs) SELECT COUNT(*) FROM jobs;
