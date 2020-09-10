const fetch = require('node-fetch')

const providerId = 'recruitee'

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
	let data
	const url = `https://${hostname}.recruitee.com/api/offers`

	try {
		data = await fetch(url)
			.then(res => {
				if (res.url === url) {
					return res.json()
				} else {
					return {}
				}
			})
			.then(data => {
				if (data && data.offers) {
					return data.offers.filter(item => item.status === 'published')
				} else {
					return []
				}
			})
	} catch (error) {
		console.log('error fetching jobs', url, error)
	}

	if (data) {
		return serializeJobs(data, hostname)
	} else {
		return []
	}
}

exports.getJobs = getJobs
