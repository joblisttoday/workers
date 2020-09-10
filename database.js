const fs = require('fs')
const TOML = require('@iarna/toml')

const databaseDir = './content'

const getCompanies = () => {
	const fileNames = getFileNames()
	const jsonContent = getFileContents(fileNames).filter(company => {
		return company.provider && company.hostname
	})
	return jsonContent
}

const getFileNames = () => {
	let fileNames = null
	try {
    fileNames = fs.readdirSync(databaseDir)
	} catch (err) {
    console.log(err)
	}
	return fileNames
}

const getFileContents = (fileNames) => {
	const filePaths = fileNames.map(name => `${databaseDir}/${name}`)
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
		hostname: item['job_board_hostname']
	}
}

exports.getCompanies = getCompanies
