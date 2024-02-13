import { analyzeCompanies } from "./database-sqlite.js";

const init = async () => {
	await analyzeCompanies();
};

init();

export default init;
