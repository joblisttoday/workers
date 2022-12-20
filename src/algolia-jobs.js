import './utils/fetch-polyfill.js'
import './utils/domparser-polyfill.js'

import dotenv from 'dotenv'
import algoliasearch from 'algoliasearch'

import { getJobs as recruiteeGetJobs } from '@joblist/job-board-providers/src/apis/recruitee.js'
import { getJobs as greenhouseGetJobs } from '@joblist/job-board-providers/src/apis/greenhouse.js'
import { getJobs as personioGetJobs } from '@joblist/job-board-providers/src/apis/personio.js'
import { getJobs as smartrecruitersGetJobs } from '@joblist/job-board-providers/src/apis/smartrecruiters.js'
import { getJobs as ashbyGetJobs } from '@joblist/job-board-providers/src/apis/ashby.js'
import { getJobs as leverGetJobs } from '@joblist/job-board-providers/src/apis/lever.js'
import { getJobs as workableGetJobs } from '@joblist/job-board-providers/src/apis/workable.js'


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
	recruitee: recruiteeGetJobs,
	greenhouse: greenhouseGetJobs,
	smartrecruiters: smartrecruitersGetJobs,
	personio: personioGetJobs,
	ashby: ashbyGetJobs,
	lever: leverGetJobs,
	workable: workableGetJobs,
}

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
		companies = await database.getAllCompaniesWithProvider()
	} catch (error) {
		console.log('Error getting companies from local folder', error)
		return
	}


	const allCompaniesGetJobs = companies.map(company => {
		const providerGetJobs = providerMethods[company['job_board_provider']]
		if (typeof providerGetJobs === 'function') {
			return providerGetJobs({
				hostname: company['job_board_hostname'],
				companyTitle: company.title,
				companySlug: company.slug,
			})
		} else {
			console.info({
				message: 'Unkown provider',
				company: company.slug,
				provider: company['job_board_provider']
			})
			return null
		}
	})

	const companiesGetJobs = allCompaniesGetJobs.filter(company => !!company)

	Promise.all(companiesGetJobs).then(responses => {
		let allJobs = []
		responses.filter(res => res).forEach(jobs => {
			jobs.forEach(job => {
				allJobs.push(job)
			})
		})

		let algoliaJobs = []
		if (process.env.NODE_ENV === 'production') {
			algoliaJobs = index.replaceAllObjects(allJobs).then(({ objectsIds }) => {
				console.info('algolia save success')
				return objectsIds
			}).catch(err => {
				console.log('algolia save error', err)
			})
		} else {
			console.info('Dev: algolia upload has been skipped')
		}

		console.info({
			message: 'Jobs & algolia upload',
			totalCompaniesWithProviders: companies.length,
			toalCompaniesWithKnownProviders: companiesGetJobs.length,
			jobs: allJobs.length,
			jobsUploaded: algoliaJobs.length,
		})

	}).catch(err => {
		console.error(err)
	})
}

init()

export default init
