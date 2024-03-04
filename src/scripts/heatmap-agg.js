import { initDb, executeSqlFile } from "../databases/database-sqlite.js";

const init = async () => {
	const db = await initDb();
	await executeSqlFile(db, "heatmap_agg.sql");
};
init();

export default init;
