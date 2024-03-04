import { cloneDatabase, getAllCompanies } from "../databases/database-git.js";

const init = async () => {
	await await cloneDatabase();
	const companies = await getAllCompanies();
	console.info("Total companies in github data", companies.length);
};

init();

export default init;
