import fetch from 'node-fetch'

/*
	 docs:
	 - https://dev.smartrecruiters.com/customer-api/posting-api/endpoints/postings/

	 - https://jobs.smartrecruiters.com/sr-jobs/company-lookup?q=a
	 - https://api.smartrecruiters.com/v1/companies/Mitie/postings
 */

const providerId = 'smartrecruiters'
const baseUrl = 'https://api.smartrecruiters.com/v1/companies'
const jobPostingBaseUrl = `https://jobs.smartrecruiters.com`

const serializeJobs = (jobs, hostname, companyTitle) => {
	return jobs.map(job => {
		return {
			/* the one needed for algolia */
			objectID: `${providerId}-${hostname}-${job.uuid}`,
			name: job.name,
			url: `${jobPostingBaseUrl}/${hostname}/${job.id}`,
			publishedDate: job.releasedDate,
			location: `${job.location.city}, ${job.location.country}`,
			companyTitle: companyTitle
		}
	})
}

const getJobs = async ({
	hostname,
	companyTitle,
	city,
	country
}) => {
	const url = `${baseUrl}/${hostname}/postings`

	let jobs = null
	try {
		await fetch(url).then(res => {
			return res.json()
		}).then(data => {
			jobs = data.content
		})
	} catch (error) {
		console.log('error fetching jobs', error)
	}

	return serializeJobs(jobs, hostname, companyTitle)
}

export default {
	getJobs
}
