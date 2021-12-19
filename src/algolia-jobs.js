import dotenv from 'dotenv'
import algoliasearch from 'algoliasearch'

import recruitee from './providers/recruitee.js'
import greenhouse from './providers/greenhouse.js'
import smartrecruiters from './providers/smartrecruiters.js'

import database from './database.js'

const config = dotenv.config()
/*
	 algolia config
 */

let algoliaAppId = null
let algoliaApiKey = null
let indexName = null

if (process.env.NODE_ENV === 'production') {
	indexName = 'prod_jobs'
	algoliaAppId = process.env['ALGOLIA_PROD_APPLICATION_ID']
	algoliaApiKey = process.env ['ALGOLIA_PROD_ADMIN_API_KEY']
} else {
	indexName = 'dev_jobs'
	algoliaAppId = config.parsed['ALGOLIA_DEV_APPLICATION_ID']
	algoliaApiKey = config.parsed['ALGOLIA_DEV_ADMIN_API_KEY']
}

const client = algoliasearch(algoliaAppId, algoliaApiKey)
const index = client.initIndex(indexName)


/*
	 test the providers
 */

const providerMethods = {
	recruitee: recruitee.getJobs,
	greenhouse: greenhouse.getJobs,
	smartrecruiters: smartrecruiters.getJobs
}

const init = async () => {
	if (!algoliaAppId || !algoliaApiKey || !indexName) {
		console.log('Required algoliaAppId && algoliaApiKey && indexName')
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
		companies = await database.getAllCompaniesWithProvider()
	} catch (error) {
		console.log('Error getting companies from local folder', error)
		return
	}

	const promises = companies.map(company => {
		const providerMethod = providerMethods[company['job_board_provider']]
		if (typeof providerMethod === 'function') {
			return providerMethod({
				hostname: company['job_board_hostname'],
				companyTitle: company.title
			})
		} else {
			return null
		}
	})

	Promise.all(promises).then(responses => {
		let allJobs = []
		responses.filter(res => res).forEach(jobs => {
			jobs.forEach(job => {
				allJobs.push(job)
			})
		})

		console.info('Jobs:', allJobs.length)

		if (process.env.NODE_ENV === 'production') {
			index.replaceAllObjects(allJobs).then(({ objectsIds }) => {
				console.info('algolia save success')
			}).catch(err => {
				console.log('algolia save error', err)
			})
		} else {
			console.info('Dev: algolia upload has been skipped')
		}
	}).catch(err => {
		console.error(err)
	})
}

export default init
