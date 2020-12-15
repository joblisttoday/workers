const fs = require('fs')
const TOML = require('@iarna/toml')
const simpleGit = require('simple-git')

const getCompanies = async () => {
	const databaseDir = './database'
	const contentBaseDir = `${databaseDir}/content/companies`
	const databaseGit = 'https://github.com/joblistcity/companies.git'

	console.log(`Cloning ${databaseGit} to ${databaseDir}`)

	try {
		await cloneCompaniesGit(databaseDir, databaseGit)
	} catch (error) {
		console.log('Error cloning content/companies git repository', error)
		return
	}

	const fileNames = getFileNames(contentBaseDir)
	const jsonContent = getFileContents(contentBaseDir, fileNames).filter(company => {
		return company.provider && company.hostname
	})
	return jsonContent
}

const cloneCompaniesGit = async (localDir, gitRemote) => {
	const git = simpleGit()
	await git.clone(gitRemote, localDir)
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
		provider: item['job_board_provider'],
		hostname: item['job_board_hostname'],
		title: item.title
	}
}

exports.getCompanies = getCompanies
