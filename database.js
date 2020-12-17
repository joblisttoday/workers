const fs = require('fs')
const TOML = require('@iarna/toml')
const simpleGit = require('simple-git')

const databaseGit = 'https://github.com/joblistcity/companies.git'
const databaseDir = './.db'
const databaseDirCompanies = `${databaseDir}/companies`

const getAllCompaniesWithProvider = async () => {
	const fileNames = getFileNames(databaseDirCompanies)
	const jsonContent = getFileContents(databaseDirCompanies, fileNames).filter(company => {
		return company.job_board_provider && company.job_board_hostname
	})
	return jsonContent
}

const getAllCompanies = async () => {
	const fileNames = getFileNames(databaseDirCompanies)
	const jsonContent = getFileContents(databaseDirCompanies, fileNames)
	return jsonContent
}

const cloneDatabase = async () => {
	try {
    fs.rmdirSync(databaseDir, { recursive: true })
    console.log(`${databaseDir} is deleted!`)
	} catch (error) {
    console.error(`Error while deleting ${databaseDir}`, error)
	}

	try {
		const git = simpleGit()
		await git.clone(databaseGit, databaseDir)
	} catch (error) {
		console.log('Error cloning content/companies git repository', error)
		return
	}
}

const getFileNames = (dir) => {
	let fileNames = null
	try {
    fileNames = fs.readdirSync(dir)
	} catch (err) {
    console.log(err)
	}
	return fileNames
}

const getFileContents = (dir, fileNames) => {
	const filePaths = fileNames.map(name => `${dir}/${name}/index.toml`)
	const fileContents = filePaths.map(path => {
		let content = null
		try {
			content = fs.readFileSync(path, 'utf-8')
		} catch (err) {
			console.error('Error reading files', err)
		}

		let jsonContent = null
		try {
			jsonContent= TOML.parse(content)
		} catch (err) {
			console.error('Error reading files', path, err)
		}

		return serializeJson(jsonContent)
	})

	return fileContents
}

const serializeJson = (item) => {
	return {
		address: item['address'],
		body: item['body'],
		city: item['city'],
		company_url: item['company_url'],
		country: item['country'],
		created_at: item['created_at'],
		job_board_hostname: item['job_board_hostname'],
		job_board_provider: item['job_board_provider'],
		job_board_url: item['job_board_url'],
		latitude: item['latitude'],
		longitude: item['longitude'],
		postal_code: item['postal_code'],
		slug: item['slug'],
		tags: item['tags'],
		title: item['title'],
		twitter_url: item['twitter_url'],
		linkedin_url: item['linkedin_url'],
		facebook_url: item['facebook_url'],
		instagram_url: item['instagram_url'],
		updated_at: item['updated_at']
	}
}

exports.cloneDatabase = cloneDatabase
exports.getAllCompanies = getAllCompanies
exports.getAllCompaniesWithProvider = getAllCompaniesWithProvider
