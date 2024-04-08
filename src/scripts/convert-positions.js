import {
	cloneDatabase,
	getAllCompanies,
	saveNewCompanies,
} from "../databases/database-git.js";

const init = async () => {
	try {
		await cloneDatabase();
	} catch (error) {
		console.log("Error cloning new database", error);
		return;
	}

	let companies;
	try {
		companies = await getAllCompanies();
	} catch (error) {
		console.log("Error getting companies from local folder", error);
		return;
	}

	const sCompanies = companies.map(serializeCompany);

	try {
		await saveNewCompanies(sCompanies);
	} catch (error) {
		console.log("Error saving new companies", error);
		return;
	}
};

const serializeCompany = (company) => {
	/* originla data */
	const {
		title,
		id,
		description,
		tags,
		company_url,
		job_board_provider,
		job_board_hostname,
		job_board_url,
		twitter_url,
		linkedin_url,
		instagram_url,
		facebook_url,
		positions,
		created_at,
		updated_at,
	} = company;

	/* company data */
	const sCompany = {};
	if (title) {
		sCompany["title"] = title;
	}
	if (id) {
		sCompany["id"] = id;
	}
	if (description) {
		sCompany["description"] = description;
	}
	if (tags && tags.length) {
		sCompany["tags"] = tags;
	}
	if (company_url) {
		sCompany["company_url"] = company_url;
	}
	if (job_board_url) {
		sCompany["job_board_url"] = job_board_url;
	}
	if (job_board_provider) {
		sCompany["job_board_provider"] = job_board_provider;
	}
	if (job_board_hostname) {
		sCompany["job_board_hostname"] = job_board_hostname;
	}
	if (twitter_url) {
		sCompany["twitter_url"] = twitter_url;
	}
	if (linkedin_url) {
		sCompany["linkedin_url"] = linkedin_url;
	}
	if (instagram_url) {
		sCompany["instagram_url"] = instagram_url;
	}
	if (facebook_url) {
		sCompany["facebook_url"] = facebook_url;
	}
	if (created_at) {
		sCompany["created_at"] = created_at;
	}
	if (updated_at) {
		sCompany["updated_at"] = updated_at;
	}
	if (positions && positions.length) {
		sCompany["positions"] = positions;
	}

	return sCompany;
};

/* launch the script */
init();
