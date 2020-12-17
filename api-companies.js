const fs = require('fs')
const database = require('./database')

const init = async () => {
	/* based on gitlab artifact strategy */
	const dirArtifacts = './public'
	const fileName = 'companies.json'

	let companies
	try {
		companies = await database.getAllCompanies()
	} catch (error) {
		console.log('Error getting companies from local folder', error)
		return
	}

	let companiesJSONString = JSON.stringify(companies)

	if (!fs.existsSync(dirArtifacts)){
    fs.mkdirSync(dirArtifacts)
	}

	fs.writeFile(`${dirArtifacts}/${fileName}`, companiesJSONString, 'utf8', (error) => {
    if (error) {
      console.log(`Error writing companies file: ${error}`)
    } else {
      console.log(`Wrote file at ${dirArtifacts}/${fileName} with ${companies.length} companies`)
    }
	})
}

/* launch the script */
init()
