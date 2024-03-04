import { writeFile, mkdirSync, existsSync } from "fs";
import { cloneDatabase, getAllCompanies } from "../databases/database-git.js";

const init = async () => {
	/* based on gitlab artifact strategy */
	const dirArtifacts = "./public";
	const fileName = "companies.json";

	try {
		await cloneDatabase();
	} catch (error) {
		console.log("Error cloning new database", error);
		return;
	}

	let companies;
	try {
		companies = await getAllCompanies();
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
