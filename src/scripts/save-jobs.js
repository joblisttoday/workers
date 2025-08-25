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
	let db;
	
	try {
		console.log("Initializing database...");
		db = await initDb();
		
		console.log("Setting up database tables...");
		await executeSqlFile(db, "jobs_table.sql");
		
		console.log("Getting companies with job board providers...");
		const companies = await getAllCompaniesWithProvider();
		
		if (!companies || companies.length === 0) {
			console.warn("No companies found with job board providers");
			return;
		}
		
		console.log(`Found ${companies.length} companies to process`);
		
		const jobPromises = companies.map(async (company) => {
			try {
				const companyProvider = company["job_board_provider"];
				const provider = providers[companyProvider];
				
				if (!provider) {
					console.warn(`No provider found for ${company.title} (${companyProvider})`);
					return { company, jobs: [], error: `Provider '${companyProvider}' not found` };
				}
				
				if (typeof provider.getJobs !== "function") {
					console.warn(`Invalid getJobs function for ${company.title} (${companyProvider})`);
					return { company, jobs: [], error: "Invalid provider or getJobs function" };
				}
				
				console.log(`Fetching jobs for ${company.title}...`);
				const jobs = await provider.getJobs({
					hostname: company["job_board_hostname"],
					companyTitle: company.title,
					companyId: company.id,
				});
				
				const validJobs = Array.isArray(jobs) ? jobs : [];
				console.log(`Found ${validJobs.length} jobs for ${company.title}`);
				
				return { company, jobs: validJobs };
			} catch (error) {
				console.error(`Error fetching jobs for ${company.title}:`, error.message || error);
				return { company, jobs: [], error };
			}
		});

		console.log("Processing all companies...");
		const results = await Promise.all(jobPromises);
		
		const allJobs = [];
		let successfulCompanies = 0;
		let failedCompanies = 0;
		
		results.forEach(result => {
			const { company, jobs, error } = result;
			if (error) {
				console.error(`Failed to fetch jobs for ${company.title}:`, error.message || error);
				failedCompanies++;
			} else {
				allJobs.push(...(jobs || []));
				successfulCompanies++;
			}
		});

		console.log(`Job fetching complete: ${successfulCompanies} successful, ${failedCompanies} failed`);
		console.log(`Total jobs collected: ${allJobs.length}`);
		
		if (allJobs.length === 0) {
			console.warn("No jobs were collected from any company");
			return;
		}

		console.log("Serializing jobs...");
		const serializedJobs = serializeJobs(allJobs);
		
		console.log("Saving jobs to database...");
		await insertOrUpdateJobs(db, serializedJobs);
		
		console.log("✅ Jobs saved successfully");
		
	} catch (error) {
		console.error("Fatal error in job saving process:", error);
		throw error;
	} finally {
		if (db) {
			try {
				await db.close();
				console.log("Database connection closed");
			} catch (closeError) {
				console.error("Error closing database:", closeError);
			}
		}
	}
};

// we serialize the jobs to `_` notation
const serializeJobs = (jobs) => {
	return jobs.map((job) => ({
		id: job.id,
		name: job.name,
		url: job.url,
		description: job.description || "",
		location: job.location,
		published_date: job.publishedDate || "",
		employment_type: job.employmentType || "",
		department: job.department || "",
		company_id: job.companyId,
		company_title: job.companyTitle,
	}));
};

init();

export default init;
