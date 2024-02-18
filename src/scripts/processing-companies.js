import { executeSqlFile } from "../databases/database-sqlite.js";

const init = async () => {
	await executeSqlFile("processing/companies_update_created_at.js");
	await executeSqlFile("processing/companies_update_updated_at.js");
};

init();

export default init;
