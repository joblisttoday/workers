import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import path from "path";

const initDb = async (filename = "joblist.db") => {
	return open({
		filename: `./.db-sqlite/${filename}`,
		driver: sqlite3.Database,
	});
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
	await insertOrUpdate(db, "companies", fields, values, "slug");
};

const insertOrUpdateJob = async (db, job) => {
	const fields = Object.keys(job);
	const values = Object.values(job);
	await insertOrUpdate(db, "jobs", fields, values, "objectID");
};

const insertOrUpdateCompanyToHighlight = async (db, checkoutSessionCompany) => {
	const fields = Object.keys(checkoutSessionCompany);
	const values = Object.values(checkoutSessionCompany);
	console.log(fields, values);
	await insertOrUpdate(db, "highlight_companies", fields, values, "slug");
};

export {
	initDb,
	insertOrUpdateCompany,
	insertOrUpdateCompanies,
	insertOrUpdateJob,
	insertOrUpdateJobs,
	insertOrUpdateCompaniesToHighlight,
	insertOrUpdateCompanyToHighlight,
	executeSqlFile,
};
