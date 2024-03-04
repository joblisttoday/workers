import { initDb, executeSqlFile } from "../databases/database-sqlite.js";

const init = async () => {
	const db = await initDb();
	await executeSqlFile(db, "jobs_analyze_table.sql");
	await executeSqlFile(db, "jobs_analyze.sql");
};
init();

export default init;
