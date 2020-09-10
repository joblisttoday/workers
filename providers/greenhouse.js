const fetch = require('node-fetch')

const providerId = 'greenhouse'

const serializeJobs = (jobs, hostname) => {
	return jobs.map(job => {
		return {
			/* the one needed for algolia */
			objectID: `${providerId}-${hostname}-${job.id}`,
			name: job.title,
			url: `${job.carreers_url}`,
			publishedDate: job.created_at
		}
	})
}

const getJobs = async ({
	hostname,
	city,
	country
}) => {
	let data = null
	const url = `https://boards-api.greenhouse.io/v1/boards/${hostname}/jobs?content=true`

	try {
		data = await fetch(url)
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

	return data
}

exports.getJobs = getJobs
