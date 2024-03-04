import "../utils/fetch-polyfill.js";
import "../utils/domparser-polyfill.js";

import { getAllCompaniesWithProvider } from "../databases/database-git.js";
import {
	initDb,
	executeSqlFile,
	insertOrUpdateJobs,
} from "../databases/database-sqlite.js";

import joblist from "@joblist/components";

const { providers } = joblist;

const init = async () => {
	const db = await initDb();
	await executeSqlFile(db, "jobs_table.sql");
	await executeSqlFile(db, "jobs_fts_table.sql");
	await executeSqlFile(db, "jobs_trigger.sql");

	const companies = await getAllCompaniesWithProvider();
	const allCompaniesGetJobs = companies.reduce((acc, company) => {
		const companyProvider = company["job_board_provider"];
		const provider = providers[companyProvider];
		if (typeof provider?.getJobs === "function") {
			const companyJobsPromise = provider.getJobs({
				hostname: company["job_board_hostname"],
				companyTitle: company.title,
				companySlug: company.slug,
			});
			acc.push(companyJobsPromise);
		}
		return acc;
	}, []);
	const companiesGetJobsPromises = allCompaniesGetJobs.filter(
		(company) => !!company,
	);
	const responses = await Promise.allSettled(companiesGetJobsPromises)
		.then((responses) => {
			return responses.filter((res) => !!res);
		})
		.catch((error) => {
			console.log("Error fetching jobs", error);
		});
	let allJobs = [];
	responses.forEach(({ value: jobs = [] }) => {
		jobs.forEach((job) => {
			allJobs.push(job);
		});
	});
	const serializedJobs = serializeJobs(allJobs);
	await insertOrUpdateJobs(db, serializedJobs);
};

// we serialize the jobs to `_` notation
const serializeJobs = (jobs) => {
	return jobs.map((job) => ({
		objectID: job.objectID,
		name: job.name,
		url: job.url,
		location: job.location,
		published_date: job.publishedDate,
		company_slug: job.companySlug,
		company_title: job.companyTitle,
	}));
};

init();

export default init;
