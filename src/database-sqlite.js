import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import getLocalPath from './utils/get-local-path.js'

const rootPath = getLocalPath(import.meta.url, 2)
let db;

/* console.log('rootPath', rootPath) */

// Initialize SQLite Database
const initDb = async () => {
	db = await open({
		filename: `./joblist.db`,
		driver: sqlite3.Database
	});
};

// Create the necessary tables if they don't exist.
const setupTables = async () => {
	await db.run (`
		CREATE TABLE IF NOT EXISTS companies (
			slug TEXT PRIMARY KEY,
			title TEXT,
			updated_at TEXT,
			tags TEXT,
			description TEXT,
			cities TEXT,
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
};

const insertOrUpdateCompany = async ({title, slug, updated_at, tags, description, cities, positions}) => {
	return db.run(`
				INSERT OR REPLACE INTO companies (title, slug, updated_at, tags, description, cities, positions)
				VALUES (?, ?, ?, ?, ?, ?, ?)
	`, [title, slug, updated_at, tags, description, cities, positions]);
};



const insertOrUpdateCompanies = async (companies) => {
	for (let company of companies) {
		await insertOrUpdateCompany(company);
	}
};

const insertOrUpdateJob = async ({
	objectID, name, url, location, published_date, company_slug, company_title
}) => {
	// Adjust this based on your actual job fields
	await db.run(`
		INSERT OR REPLACE INTO jobs (
			objectID, name, url, location, published_date, company_title, company_slug
		) VALUES (?, ?, ?, ?, ?, ?, ?);
	`, [objectID, name, url, location, published_date, company_title, company_slug]);
};

const insertOrUpdateJobs = async (jobs) => {
	for (let job of jobs) {
		await insertOrUpdateJob(job);
	}
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
