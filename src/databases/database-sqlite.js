import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import path from "path";

/* global variable for the db (meh) */
let db;

const initDb = async (filename = "joblist.db") => {
	db = await open({
		filename: `./${filename}`,
		driver: sqlite3.Database,
	});
};

/* general db utils */
const executeQuery = async (query, params = []) => {
	return db.run(query, params);
};

const executeSqlFile = async (filename) => {
	const filePath = path.resolve("src/sqlite", filename);
	const sql = fs.readFileSync(filePath, "utf-8");
	return executeQuery(sql);
};

/* sepecific to our models (meh) */
const insertOrUpdate = async (table, fields, values, conflictColumn) => {
	const placeholders = values.map(() => "?").join(", ");
	const updateSetters = fields
		.map((field) => `${field} = excluded.${field}`)
		.join(", ");
	await executeQuery(
		`
		INSERT INTO ${table} (${fields.join(", ")})
		VALUES (${placeholders})
		ON CONFLICT(${conflictColumn}) DO UPDATE SET
			${updateSetters};
	`,
		values,
	);
};

const insertOrUpdateCompanies = async (companies) => {
	for (const company of companies) {
		await insertOrUpdateCompany(company);
	}
};

const insertOrUpdateJobs = async (jobs) => {
	for (const job of jobs) {
		await insertOrUpdateJob(job);
	}
};

const insertOrUpdateCompany = async (company) => {
	company.positions = JSON.stringify(company.positions);
	company.tags = JSON.stringify(company.tags);
	const fields = Object.keys(company);
	const values = Object.values(company);
	await insertOrUpdate("companies", fields, values, "slug");
};

const insertOrUpdateJob = async (job) => {
	const fields = Object.keys(job);
	const values = Object.values(job);
	await insertOrUpdate("jobs", fields, values, "objectID");
};

/* executed each time this file is imported */
const createTables = async () => {
	await executeSqlFile("companies_table.sql");
	await executeSqlFile("jobs_table.sql");
};

const createFTSTables = async () => {
	await executeSqlFile("companies_fts_table.sql");
	await executeSqlFile("jobs_fts_table.sql");
};

const createTriggers = async () => {
	await executeSqlFile("companies_trigger.sql");
	await executeSqlFile("jobs_trigger.sql");
};

const setupTables = async () => {
	await createTables();
	await createFTSTables();
	await createTriggers();
};

/*
	 initialize the database connection and
	 set up the tables when this module is imported.
 */
await (async () => {
	await initDb();
	await setupTables();
})();

export {
	insertOrUpdateCompany,
	insertOrUpdateCompanies,
	insertOrUpdateJob,
	insertOrUpdateJobs,
	executeSqlFile,
};
