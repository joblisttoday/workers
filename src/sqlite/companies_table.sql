CREATE TABLE IF NOT EXISTS companies (
	id TEXT PRIMARY KEY,
	title TEXT,
	company_url TEXT,
	job_board_url TEXT,
	job_board_provider TEXT,
	job_board_hostname TEXT,
	description TEXT,
	tags TEXT,
	twitter_url TEXT,
	linkedin_url TEXT,
	youtube_url TEXT,
	instagram_url TEXT,
	facebook_url TEXT,
	github_url TEXT,
	wikipedia_url TEXT,
	positions TEXT,
	is_highlighted BOOLEAN CHECK (is_highlighted IN (0, 1))
);
