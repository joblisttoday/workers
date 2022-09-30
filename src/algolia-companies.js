import './utils/fetch-polyfill.js'
import './utils/domparser-polyfill.js'

import dotenv from 'dotenv'
import algoliasearch from 'algoliasearch'
import database from './database.js'

const config = dotenv.config()

/*
	 algolia config
 */

let algoliaAppId = null
let algoliaApiKey = null
let indexName = null

if (process.env.NODE_ENV === 'production') {
	indexName = 'prod_companies'
	algoliaAppId = process.env['ALGOLIA_PROD_APPLICATION_ID']
	algoliaApiKey = process.env ['ALGOLIA_PROD_ADMIN_API_KEY']
} else {
	indexName = 'dev_companies'
	algoliaAppId = config.parsed['ALGOLIA_DEV_APPLICATION_ID']
	algoliaApiKey = config.parsed['ALGOLIA_DEV_ADMIN_API_KEY']
}

const client = algoliasearch(algoliaAppId, algoliaApiKey)
const index = client.initIndex(indexName)

const init = async () => {
	console.info({
		message: 'Initiating script',
		NODE_ENV: process.env.NODE_ENV,
		algoliaIndexName: indexName,
		algoliaAppId: !!algoliaAppId,
		algoliaApiKey: !!algoliaApiKey
	})

	if (!algoliaAppId || !algoliaApiKey || !indexName) {
		console.log('Missing required algoliaAppId && algoliaApiKey && indexName')
		return false
	}

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

	let algoliaCompanies = []
	if (process.env.NODE_ENV === 'production') {
		algoliaCompanies = index.replaceAllObjects(companies).then(({
			objectsIds
		}) => {
			console.info('algolia save success')
			return objectsIds
		}).catch(err => {
			console.log('algolia save error', err)
		})
	} else {
		console.info('Dev: algolia upload has been skipped')
	}

	console.info({
		message: 'Companies & algolia upload',
		totalCompanies: companies.length,
		companiesUploaded: algoliaCompanies.length,
	})
}

init()

export default init
