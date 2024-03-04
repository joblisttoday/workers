import { initDb, executeSqlFile } from "../databases/database-sqlite.js";

const init = async () => {
	const db = await initDb();
	await executeSqlFile(db, "processing/companies_update_created_at.sql");
	await executeSqlFile(db, "processing/companies_update_updated_at.sql");
};

init();

export default init;
