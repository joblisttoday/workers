import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import getLocalPath from './utils/get-local-path.js'

const rootPath = getLocalPath(import.meta.url, 2)
let db;

// Initialize SQLite Database
const initDb = async (filename = "joblist.db") => {
	db = await open({
		filename: `./${filename}`,
		driver: sqlite3.Database
	});
};

const setupTables = async () => {
	/* Create the necessary tables if they don't exist. */
	await db.run(`
		CREATE TABLE IF NOT EXISTS companies (
			slug TEXT PRIMARY KEY,
			title TEXT,
			updated_at TEXT,
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
			positions TEXT
		);
	`);
	await db.run(`
		CREATE TABLE IF NOT EXISTS jobs (
			objectID TEXT PRIMARY KEY,
			name TEXT,
			url TEXT,
			location TEXT,
			published_date TEXT,
			company_slug TEXT,
			company_title TEXT
		);
	`);

	/* create virtual tables for full text search */
	await db.run(`
		CREATE VIRTUAL TABLE IF NOT EXISTS companies_fts USING fts5 (
			slug, title, description, tags, positions
		);
	`);
	await db.run(`
		CREATE VIRTUAL TABLE IF NOT EXISTS jobs_fts USING fts5 (
			objectID, name, location, company_slug, company_title
		);
	`);

	/* create triggers to populate FTS tables when their source table updates */
	await db.run(`
		 CREATE TRIGGER IF NOT EXISTS companies_after_insert AFTER INSERT ON companies BEGIN
		 INSERT OR REPLACE INTO companies_fts (rowid, slug, title, description, tags, positions)
		 VALUES (new.rowid, new.slug, new.title, new.description, new.tags, new.positions);
		 END;
	`);
	await db.run(`
		 CREATE TRIGGER IF NOT EXISTS companies_after_update AFTER UPDATE ON companies BEGIN
		 INSERT OR REPLACE INTO companies_fts (rowid, slug, title, description, tags, positions)
		 VALUES (new.rowid, new.slug, new.title, new.description, new.tags, new.positions);
		 END;
	`);
	await db.run(`
		 CREATE TRIGGER IF NOT EXISTS companies_after_delete AFTER DELETE ON companies BEGIN
		 DELETE FROM companies_fts WHERE rowid = old.rowid;
		 END;
	`);
	await db.run(`
		 CREATE TRIGGER IF NOT EXISTS jobs_after_insert AFTER INSERT ON jobs BEGIN
		 INSERT OR REPLACE INTO jobs_fts (rowid, objectID, name, location, company_slug, company_title)
		 VALUES (new.rowid, new.objectID, new.name, new.location, new.company_slug, new.company_title);
		 END;
	`);
	await db.run(`
		 CREATE TRIGGER IF NOT EXISTS jobs_after_update AFTER UPDATE ON jobs BEGIN
		 INSERT OR REPLACE INTO jobs_fts (rowid, objectID, name, location, company_slug, company_title)
		 VALUES (new.rowid, new.objectID, new.name, new.location, new.company_slug, new.company_title);
		 END;
	`);
	await db.run(`
		 CREATE TRIGGER IF NOT EXISTS jobs_after_delete AFTER DELETE ON jobs BEGIN
		 DELETE FROM jobs_fts WHERE rowid = old.rowid;
		 END;
	`);
};
const insertOrUpdateCompanies = async (companies) => {
	for (let company of companies) {
		await insertOrUpdateCompany(company);
	}
};
const insertOrUpdateJobs = async (jobs) => {
	for (let job of jobs) {
		await insertOrUpdateJob(job);
	}
};

const insertOrUpdateCompany = async ({
	slug = '',
	title = "",
	updated_at = '',
	company_url = "",
	job_board_url = "",
	job_board_provider = "",
	job_board_hostname = "",
	description = '',
	tags = [],
	twitter_url = '',
	linkedin_url = '',
	youtube_url = '',
	instagram_url = '',
	facebook_url = '',
	github_url = '',
	wikipedia_url = '',
	positions = [],
}) => {
	await db.run(`
		INSERT OR REPLACE INTO companies (slug, title, updated_at, company_url, job_board_url, job_board_provider, job_board_hostname, description, tags, twitter_url, linkedin_url, youtube_url, instagram_url, facebook_url, github_url, wikipedia_url, positions)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, [slug, title, updated_at, company_url, job_board_url, job_board_provider, job_board_hostname, description, JSON.stringify(tags), twitter_url, linkedin_url, youtube_url, instagram_url, facebook_url, github_url, wikipedia_url, JSON.stringify(positions)]);
};

const insertOrUpdateJob = async ({
	objectID = "",
	name = "",
	url = "",
	location = "",
	published_date = "",
	company_slug = "",
	company_title = ""
}) => {
	await db.run(`
		INSERT OR REPLACE INTO jobs (
			objectID, name, url, location, published_date, company_slug, company_title
		) VALUES (?, ?, ?, ?, ?, ?, ?);
	`, [objectID, name, url, location, published_date, company_slug, company_title]);
};

// We initialize the database connection and set up the tables when this module is imported.
(async () => {
	await initDb();
	await setupTables();
})();

export {
	insertOrUpdateCompany,
	insertOrUpdateCompanies,
	insertOrUpdateJob,
	insertOrUpdateJobs
};
