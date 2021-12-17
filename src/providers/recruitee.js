const fetch = require('node-fetch')

const providerId = 'recruitee'

const serializeJobs = (jobs, hostname, companyTitle) => {
	return jobs.map(job => {
		return {
			/* the one needed for algolia */
			objectID: `${providerId}-${hostname}-${job.id}`,
			name: job.title,
			url: `${job.carreers_url}`,
			publishedDate: job.created_at,
			location: `${job.city}, ${job.country}`,
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
	let data
	const url = `https://${hostname}.recruitee.com/api/offers`
	const options = {
		method: 'GET',
		headers: {Accept: 'application/json', 'Content-Type': 'application/json'}
	};

	try {
		data = await fetch(url, options)
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
		return serializeJobs(data, hostname, companyTitle)
	} else {
		return []
	}
}

exports.getJobs = getJobs
