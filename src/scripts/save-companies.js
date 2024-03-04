import "../utils/fetch-polyfill.js";
import "../utils/domparser-polyfill.js";

import { getAllCompanies } from "../databases/database-git.js";
import {
	initDb,
	executeSqlFile,
	insertOrUpdateCompanies,
} from "../databases/database-sqlite.js";

const init = async () => {
	const db = await initDb();
	await executeSqlFile(db, "companies_table.sql");
	await executeSqlFile(db, "companies_fts_table.sql");
	await executeSqlFile(db, "companies_trigger.sql");
	const companies = await getAllCompanies();
	await insertOrUpdateCompanies(db, companies);
	// no need to serialize companies, lets do it at the level of sql
};

init();

export default init;
