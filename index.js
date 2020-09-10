const config = require('dotenv').config()
const algoliasearch = require("algoliasearch")
const recruitee = require('./providers/recruitee')
const greenhouse = require('./providers/greenhouse')
const smartrecruiters = require('./providers/smartrecruiters')


/*
	 test algolia
 */

const {
	'ALGOLIA_DEV_APPLICATION_ID': algoliaAppId,
	'ALGOLIA_DEV_ADMIN_API_KEY': algoliaApiKey
} = config.parsed
const indexName = 'dev_jobs'


const client = algoliasearch(algoliaAppId, algoliaApiKey)
const index = client.initIndex(indexName)


/*
	 test the providers
 */

const city = 'berlin'
const recruiteeHost = 'idealocareer'
const greenhouseHost = 'fulfillment'
const smartrecruitersHost = 'smartrecruiters'

/* recruitee.getJobs({hostname: recruiteeHost}).then(jobs => {
 * 	console.log('recruitee jobs', jobs)
 * }) */

/* greenhouse.getJobs({hostname: greenhouseHost}).then(jobs => {
 *  	console.log('greenhouse jobs', jobs)
 * }) */

smartrecruiters.getJobs({
 	hostname: smartrecruitersHost,
 	city: city
}).then(jobs => {
 	/* console.log('smartrecruiters jobs', jobs) */
	index.saveObjects(jobs).then(({ objectsIds }) => {
		console.log(objectsIds)
	}).catch(err => {
		console.log(err)
	})
})
