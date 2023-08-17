import "./utils/fetch-polyfill.js";
import "./utils/domparser-polyfill.js";

import database from "./database-git.js";
import { insertOrUpdateJobs } from "./database-sqlite.js"
import dotenv from "dotenv";
const config = dotenv.config();

import { getJobs as recruiteeGetJobs } from "@joblist/job-board-providers/src/apis/recruitee.js";
import { getJobs as greenhouseGetJobs } from "@joblist/job-board-providers/src/apis/greenhouse.js";
import { getJobs as personioGetJobs } from "@joblist/job-board-providers/src/apis/personio.js";
import { getJobs as smartrecruitersGetJobs } from "@joblist/job-board-providers/src/apis/smartrecruiters.js";
import { getJobs as ashbyGetJobs } from "@joblist/job-board-providers/src/apis/ashby.js";
import { getJobs as leverGetJobs } from "@joblist/job-board-providers/src/apis/lever.js";
import { getJobs as workableGetJobs } from "@joblist/job-board-providers/src/apis/workable.js";

const providerMethods = {
	recruitee: recruiteeGetJobs,
	greenhouse: greenhouseGetJobs,
	smartrecruiters: smartrecruitersGetJobs,
	personio: personioGetJobs,
	ashby: ashbyGetJobs,
	lever: leverGetJobs,
	workable: workableGetJobs,
};

const init = async () => {
	await database.cloneDatabase();
	const companies = await database.getAllCompaniesWithProvider();
	const allCompaniesGetJobs = companies.reduce((acc, company) => {
		const providerGetJobs = providerMethods[company["job_board_provider"]];
		if (typeof providerGetJobs === "function") {
			const companyJobsPromise = providerGetJobs({
				hostname: company["job_board_hostname"],
				companyTitle: company.title,
				companySlug: company.slug,
			})
			acc.push(companyJobsPromise)
		}
		return acc
	}, []);
	const companiesGetJobsPromises = allCompaniesGetJobs.filter((company) => !!company);
	const responses = await Promise.allSettled(companiesGetJobsPromises).then(responses => {
		return responses.filter((res) => !!res)
	}).catch(error => {
		console.log('Error fetching jobs', error)
	})
	let allJobs = [];
	responses.forEach(({value: jobs = []}) => {
		jobs.forEach((job) => {
			allJobs.push(job);
		});
	});
	const serializedJobs = serializeJobs(allJobs);
	await insertOrUpdateJobs(serializedJobs);
};

// we serialize the jobs to `_` notation
const serializeJobs = (jobs) => {
	return jobs.map(job => ({
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
