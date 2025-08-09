import "../utils/fetch-polyfill.js";
import "../utils/domparser-polyfill.js";


import { getAllCompaniesWithProvider } from "../databases/database-git.js";
import {
	initDb,
	executeSqlFile,
	insertOrUpdateJobs,
} from "../databases/database-sqlite.js";

import providers from "@joblist/components/providers";

const init = async () => {
	const db = await initDb();
	await executeSqlFile(db, "jobs_table.sql");
	await executeSqlFile(db, "jobs_fts_table.sql");
	await executeSqlFile(db, "jobs_trigger.sql");

	const companies = await getAllCompaniesWithProvider();
	const jobPromises = companies.map(async (company) => {
		try {
			const companyProvider = company["job_board_provider"];
			const provider = providers[companyProvider];
			if (typeof provider?.getJobs !== "function") {
				return { company, jobs: [], error: "Invalid provider or getJobs function" };
			}
			const jobs = await provider.getJobs({
				hostname: company["job_board_hostname"],
				companyTitle: company.title,
				companyId: company.id,
			});
			return { company, jobs };
		} catch (error) {
			return { company, jobs: [], error };
		}
	});

	const results = await Promise.all(jobPromises);
	
	const allJobs = [];
	results.forEach(result => {
		const { company, jobs, error } = result;
		if (error) {
			console.error(`Error fetching jobs for ${company.title}:`, error.message);
		} else {
			allJobs.push(...(jobs || []));
		}
	});

	const serializedJobs = serializeJobs(allJobs);
	await insertOrUpdateJobs(db, serializedJobs);
};

// we serialize the jobs to `_` notation
const serializeJobs = (jobs) => {
	return jobs.map((job) => ({
		id: job.id,
		name: job.name,
		url: job.url,
		location: job.location,
		published_date: job.publishedDate || "",
		company_id: job.companyId,
		company_title: job.companyTitle,
	}));
};

init();

export default init;
