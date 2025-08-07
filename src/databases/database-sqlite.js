import { rmSync } from "fs";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import path from "path";

const removeDb = async (filename = "joblist.db") => {
	const databaseDir = `./.db-sqlite/${filename}`;
	try {
		rmSync(databaseDir, { recursive: true, force: true });
	} catch (error) {
		console.error(`Error while deleting ${databaseDir}`, error);
	}
};

const initDb = async (filename = "joblist.db") => {
	const db = await open({
		filename: `./.db-sqlite/${filename}`,
		driver: sqlite3.Database,
	});
	
	// Optimize for sql.js-httpvfs - set page size BEFORE creating any tables
	console.log("Setting database optimization for sql.js-httpvfs...");
	await db.exec("PRAGMA journal_mode = DELETE;");
	await db.exec("PRAGMA page_size = 1024;");
	
	// Verify settings were applied
	const pageSize = await db.get("PRAGMA page_size;");
	const journalMode = await db.get("PRAGMA journal_mode;");
	console.log(`Database initialized with page_size=${pageSize.page_size}, journal_mode=${journalMode.journal_mode}`);
	
	return db;
};

/* general db utils */
const executeQuery = async (db, query, params = []) => {
	return db.run(query, params);
};

const executeSqlFile = async (db, filename) => {
	const filePath = path.resolve("src/sqlite", filename);
	const sql = fs.readFileSync(filePath, "utf-8");
	return executeQuery(db, sql);
};

/* sepecific to our models (meh) */
const insertOrUpdate = async (db, table, fields, values, conflictColumn) => {
	const placeholders = values.map(() => "?").join(", ");
	const updateSetters = fields
		.map((field) => `${field} = excluded.${field}`)
		.join(", ");
	await executeQuery(
		db,
		`
		INSERT INTO ${table} (${fields.join(", ")})
		VALUES (${placeholders})
		ON CONFLICT(${conflictColumn}) DO UPDATE SET
			${updateSetters};
		`,
		values,
	);
};

const insertOrUpdateCompanies = async (db, companies) => {
	for (const company of companies) {
		await insertOrUpdateCompany(db, company);
	}
};

const insertOrUpdateJobs = async (db, jobs) => {
	for (const job of jobs) {
		await insertOrUpdateJob(db, job);
	}
};

const insertOrUpdateCompaniesToHighlight = async (
	db,
	checkoutSessionCompanies,
) => {
	for (const company of checkoutSessionCompanies) {
		await insertOrUpdateCompanyToHighlight(db, company);
	}
};

const insertOrUpdateCompany = async (db, company) => {
	company.positions = JSON.stringify(company.positions);
	company.tags = JSON.stringify(company.tags);
	const fields = Object.keys(company);
	const values = Object.values(company);
	await insertOrUpdate(db, "companies", fields, values, "id");
};

const insertOrUpdateJob = async (db, job) => {
	const fields = Object.keys(job);
	const values = Object.values(job);
	await insertOrUpdate(db, "jobs", fields, values, "id");
};

const insertOrUpdateCompanyToHighlight = async (db, checkoutSessionCompany) => {
	const fields = Object.keys(checkoutSessionCompany);
	const values = Object.values(checkoutSessionCompany);
	await insertOrUpdate(db, "highlight_companies", fields, values, "id");
};

export {
	removeDb,
	initDb,
	insertOrUpdateCompany,
	insertOrUpdateCompanies,
	insertOrUpdateJob,
	insertOrUpdateJobs,
	insertOrUpdateCompaniesToHighlight,
	insertOrUpdateCompanyToHighlight,
	executeSqlFile,
};
