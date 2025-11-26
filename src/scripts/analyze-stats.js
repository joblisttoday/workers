import { initDb, executeSqlFile } from "../databases/database-sqlite.js";

const init = async () => {
	const db = await initDb();
	await executeSqlFile(db, "stats_table.sql");
	await executeSqlFile(db, "stats.sql");
};

init();

export default init;
