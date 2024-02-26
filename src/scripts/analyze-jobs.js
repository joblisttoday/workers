import { executeSqlFile } from "../databases/database-sqlite.js";

const init = async () => {
	await executeSqlFile("jobs_analyze_table.sql");
	await executeSqlFile("jobs_analyze.sql");
};
init();

export default init;
