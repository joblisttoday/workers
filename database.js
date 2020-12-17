const fs = require('fs')
const frontmatter = require('@github-docs/frontmatter')
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
	const extension = 'md'
	const filePaths = fileNames.map(name => `${dir}/${name}/index.${extension}`)
	const fileContents = filePaths.map(path => {
		let content = null
		try {
			content = fs.readFileSync(path, 'utf-8')
		} catch (err) {
			console.error('Error reading files', err)
		}

		let frontMatter = frontmatter(content)
		return serializeJson(frontMatter)

	})

	return fileContents
}

const serializeJson = (item) => {
	return {
		address: item.data['address'],
		body: item.data['body'],
		city: item.data['city'],
		company_url: item.data['company_url'],
		country: item.data['country'],
		created_at: item.data['created_at'],
		job_board_hostname: item.data['job_board_hostname'],
		job_board_provider: item.data['job_board_provider'],
		job_board_url: item.data['job_board_url'],
		latitude: item.data['latitude'],
		longitude: item.data['longitude'],
		postal_code: item.data['postal_code'],
		slug: item.data['slug'],
		tags: item.data['tags'],
		title: item.data['title'],
		twitter_url: item.data['twitter_url'],
		linkedin_url: item.data['linkedin_url'],
		facebook_url: item.data['facebook_url'],
		instagram_url: item.data['instagram_url'],
		updated_at: item.data['updated_at']
	}
}

exports.cloneDatabase = cloneDatabase
exports.getAllCompanies = getAllCompanies
exports.getAllCompaniesWithProvider = getAllCompaniesWithProvider
