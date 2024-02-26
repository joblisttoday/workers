import { executeSqlFile } from "../databases/database-sqlite.js";

const init = async () => {
	await executeSqlFile("companies_analyze_table.sql");
	await executeSqlFile("companies_analyze.sql");
};

init();

export default init;
