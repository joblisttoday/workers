import { analyzeJobs } from "./database-sqlite.js";

const init = async () => {
	await analyzeJobs();
};

init();

export default init;
