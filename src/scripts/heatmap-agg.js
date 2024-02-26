import { executeSqlFile } from "../databases/database-sqlite.js";

const init = async () => {
	await executeSqlFile("heatmap_agg.sql");
};
init();

export default init;
