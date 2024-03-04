import { initDb, executeSqlFile } from "../databases/database-sqlite.js";

const init = async () => {
	const db = await initDb();
	await executeSqlFile(db, "processing/jobs_update_published_at.sql");
};

init();

export default init;
