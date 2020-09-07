const fetch = require('node-fetch')

const country = 'germany'
const city = 'berlin'
const hostname = 'idealocareer'

const getJobs = async (host) => {
	const url = `https://${host}.recruitee.com/api/offers`
	let data
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

getJobs(hostname).then(jobs => {
	console.log('jobs', jobs)
})
