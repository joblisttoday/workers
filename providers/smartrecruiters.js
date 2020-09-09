const fetch = require('node-fetch')

/*
	 docs:
	 - https://dev.smartrecruiters.com/customer-api/posting-api/endpoints/postings/

	 - https://jobs.smartrecruiters.com/sr-jobs/company-lookup?q=a
	 - https://api.smartrecruiters.com/v1/companies/Mitie/postings
 */

const baseUrl = 'https://api.smartrecruiters.com/v1/companies'
const jobPostingBaseUrl = `https://jobs.smartrecruiters.com`

const getJobs = async ({
	hostname,
	country,
	city
}) => {
	/* wants city with fist letter upercase */
	const cityName = city.charAt(0).toUpperCase() + city.slice(1)
	const url = `${baseUrl}/${hostname}/postings?city=${cityName}`

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

	return jobs
}

exports.getJobs = getJobs
