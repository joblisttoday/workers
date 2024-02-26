import "../utils/fetch-polyfill.js";
import "../utils/domparser-polyfill.js";

import database from "../databases/database-git.js";
import {
	executeSqlFile,
	insertOrUpdateCompanies,
} from "../databases/database-sqlite.js";

import dotenv from "dotenv";

const config = dotenv.config();

const init = async () => {
	await executeSqlFile("companies_table.sql");
	await executeSqlFile("companies_fts_table.sql");
	await executeSqlFile("companies_trigger.sql");
	const companies = await database.getAllCompanies();
	await insertOrUpdateCompanies(companies);
	// no need to serialize companies, lets do it at the level of sql
};

init();

export default init;
