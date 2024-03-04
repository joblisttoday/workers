import { initDb, executeSqlFile } from "../databases/database-sqlite.js";

const init = async () => {
	const db = await initDb();
	await executeSqlFile(db, "companies_analyze_table.sql");
	await executeSqlFile(db, "companies_analyze.sql");
};

init();

export default init;
