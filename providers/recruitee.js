const fetch = require('node-fetch')

const getJobs = async ({
	hostname,
	city,
	country
}) => {
	let data
	const url = `https://${hostname}.recruitee.com/api/offers`

	try {
		data = await fetch(url)
			.then(res => res.json())
			.then(data => {
				return data.offers.filter(item => item.status === 'published')
			})
	} catch (error) {
		console.log('error fetching jobs', error)
	}
	return data
}

exports.getJobs = getJobs
