import { writeFile, mkdirSync, existsSync } from "fs";
import database from "../databases/database-git.js";

const init = async () => {
	/* based on gitlab artifact strategy */
	const dirArtifacts = "./public";
	const fileName = "companies.json";

	try {
		await database.cloneDatabase();
	} catch (error) {
		console.log("Error cloning new database", error);
		return;
	}

	let companies;
	try {
		companies = await database.getAllCompanies();
	} catch (error) {
		console.log("Error getting companies from local folder", error);
		return;
	}

	let companiesJSONString = JSON.stringify(companies);

	if (!existsSync(dirArtifacts)) {
		mkdirSync(dirArtifacts);
	}

	writeFile(
		`${dirArtifacts}/${fileName}`,
		companiesJSONString,
		"utf8",
		(error) => {
			if (error) {
				console.log(`Error writing companies file: ${error}`);
			} else {
				console.log(
					`Wrote file at ${dirArtifacts}/${fileName} with ${companies.length} companies`,
				);
			}
		},
	);
};

/* launch the script */
init();
