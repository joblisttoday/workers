import { executeSqlFile } from "../databases/database-sqlite.js";

const init = async () => {
	await executeSqlFile("processing/companies_update_created_at.sql");
	await executeSqlFile("processing/companies_update_updated_at.sql");
	// @TODO: await executeSqlFile("processing/companies_update_highlight.sql");
};

init();

export default init;
