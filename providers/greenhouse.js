const fetch = require('node-fetch')

const providerId = 'greenhouse'

const getLocation = job => {
	if (!job.offices) {
		return job.location
	}
	return job.offices.map(office => office.location).join('-')
}

const serializeJobs = (jobs, hostname, companyTitle) => {
	return jobs.map(job => {
		return {
			objectID: `${providerId}-${hostname}-${job.id}`,
			name: job.title,
			url: `${job.absolute_url}`,
			publishedDate: job.updated_at,
			location: getLocation(job),
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
	let allJobs = null
	const url = `https://boards-api.greenhouse.io/v1/boards/${hostname}/jobs?content=true`

	try {
		allJobs = await fetch(url)
			.then(res => res.json())
			.then(data => {
				let search = ''
				if (city) {
					search = city
				} else if (country) {
					search = country
				}

				if (!search) {
					return data.jobs
				} else {
					search = search.toLowerCase()

					return data.jobs.filter(item => {
						const s = item.offices.map(office => {
							return `${office.name} ${office.location}`.toLowerCase()
						}).join(' ')
						return s.indexOf(search) > -1
					})
				}
			})
	} catch (error) {
		console.log('error fetching jobs')
	}

	const s = serializeJobs(allJobs, hostname, companyTitle)
	return s
}

exports.getJobs = getJobs
