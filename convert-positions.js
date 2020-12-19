const frontmatter = require('@github-docs/frontmatter')
const database = require('./database')


const init = async () => {
	try {
		await database.cloneDatabase()
	} catch (error) {
		console.log('Error cloning new database', error)
		return
	}

	let companies
	try {
		companies = await database.getAllCompanies()
	} catch (error) {
		console.log('Error getting companies from local folder', error)
		return
	}

	const sCompanies = companies.map(serializeComapany)

	try {
		await database.saveNewCompanies(sCompanies)
	} catch (error) {
		console.log('Error saving new companies', error)
		return
	}
}

const serializeComapany = (company) => {
	/* originla data */
	const {
		title,
		slug,
		body,
		tags,
		company_url,
		job_board_provider,
		job_board_hostname,
		job_board_url,
		twitter_url,
		linkedin_url,
		instagram_url,
		facebook_url,
		country,
		cities,
		postal_code,
		address,
		latitude,
		longitude,
		created_at,
		updated_at,
	} = company

	/* build positions */
	let position = {}
	if (cities && cities.length) {
		position['city'] = cities[0]
	}
	if (country) {
		position['country'] = country
	}

	if (postal_code) {
		position['postal_code'] = postal_code
	}

	if (address) {
		position['address'] = address
	}

	if (longitude && latitude) {
		position['position'] = JSON.stringify({
			type: 'Point',
			coordinates: [longitude, latitude]
		})
	}

	let positions
	if (Object.keys(position).length) {
		positions = [position]
	}

	/* company data */
	const sCompany = {}
	if (title) {
			sCompany['title'] = title
	}
	if (slug) {
		sCompany['slug'] = slug
	}
	if (body) {
		sCompany['body'] = body
	}
	if (tags && tags.length) {
		sCompany['tags'] = tags
	}
	if (company_url) {
		sCompany['company_url'] = company_url
	}
	if (job_board_url) {
		sCompany['job_board_url'] = job_board_url
	}
	if (job_board_provider) {
		sCompany['job_board_provider'] = job_board_provider
	}
	if (job_board_hostname) {
		sCompany['job_board_hostname'] = job_board_hostname
	}
	if (twitter_url) {
		sCompany['twitter_url'] = twitter_url
	}
	if (linkedin_url) {
		sCompany['linkedin_url'] = linkedin_url
	}
	if (instagram_url) {
		sCompany['instagram_url'] = instagram_url
	}
	if (facebook_url) {
		sCompany['facebook_url'] = facebook_url
	}
	if (cities) {
		sCompany['cities'] = cities
	}
	if (positions && positions.length) {
		sCompany['positions'] = positions
	}
	if (created_at) {
		sCompany['created_at'] = created_at
	}
	if (updated_at) {
		sCompany['updated_at'] = updated_at
	}

	return sCompany
}

/* launch the script */
init()
