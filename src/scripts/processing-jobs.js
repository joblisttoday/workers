import { executeSqlFile } from "../databases/database-sqlite.js";

const init = async () => {
	await executeSqlFile("processing/jobs_update_published_at.sql");
};

init();

export default init;
