const config = require('dotenv').config()

const algoliasearch = require("algoliasearch")

const database = require('./database')
const recruitee = require('./providers/recruitee')
const greenhouse = require('./providers/greenhouse')
const smartrecruiters = require('./providers/smartrecruiters')


/*
	 test algolia
 */

if (process.env.NODE_ENV === 'production') {
	const indexName = 'prod_jobs'
	const {
		'ALGOLIA_PROD_APPLICATION_ID': algoliaAppId,
		'ALGOLIA_PROD_ADMIN_API_KEY': algoliaApiKey
	} = process.env
} else {
	const indexName = 'dev_jobs'
	const {
		'ALGOLIA_DEV_APPLICATION_ID': algoliaAppId,
		'ALGOLIA_DEV_ADMIN_API_KEY': algoliaApiKey
	} = config.parsed
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
const city = 'berlin'
const companies = database.getCompanies()

const promises = companies.map(company => {
	const providerMethod = providerMethods[company.provider]
	if (typeof providerMethod === 'function') {
		return providerMethod({
			hostname: company.hostname
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

	index.saveObjects(allJobs).then(({ objectsIds }) => {
 		console.log('algolia save success')
 	}).catch(err => {
 		console.log('algolia save error', err)
 	})
}).catch(err => {
	console.error(err)
})
