import "./utils/fetch-polyfill.js";
import "./utils/domparser-polyfill.js";

import database from "./database-git.js";
import { insertOrUpdateCompanies } from "./database-sqlite.js"

import dotenv from "dotenv";

const config = dotenv.config();

const init = async () => {
	await database.cloneDatabase();
	const companies = await database.getAllCompanies();
	const companiesSerialized = serializeCompanies(companies);
	await insertOrUpdateCompanies(companiesSerialized);
}

const serializeCompanies = (companies) => {
	const serialized = companies.map((company) => {
		return {
			title: company.title,
			slug: company.slug,
			updated_at: company.updated_at,
			tags: company.tags,
			description: company.description,
			cities: company.cities,
			positions: company.positions,
		};
	});
	return serialized;
};

init();

export default init;
