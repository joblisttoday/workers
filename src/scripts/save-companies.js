import "../utils/fetch-polyfill.js";
import "../utils/domparser-polyfill.js";

import database from "../databases/database-git.js";
import { insertOrUpdateCompanies } from "../databases/database-sqlite.js";

import dotenv from "dotenv";

const config = dotenv.config();

const init = async () => {
	await database.cloneDatabase();
	const companies = await database.getAllCompanies();
	// no need to serialize companies, lets do it at the level of sql
	await insertOrUpdateCompanies(companies);
};

init();

export default init;
