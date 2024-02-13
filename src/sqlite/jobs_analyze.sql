DROP TABLE IF EXISTS jobs_analyze;
CREATE TABLE jobs_analyze (
	total_jobs INTEGER
);
INSERT INTO jobs_analyze (total_jobs) SELECT COUNT(*) FROM jobs;
