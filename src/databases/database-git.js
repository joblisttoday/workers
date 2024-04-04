import { readdirSync, readFileSync, rmSync } from "fs";
import { writeFile, mkdir, rm } from "fs/promises";
import simpleGit from "simple-git";

const databaseGit = "https://github.com/joblisttoday/companies.git";
const databaseDir = "./.db-github-data";
const databaseDirCompanies = `${databaseDir}/companies`;
const fileExtension = "json";

export const getAllCompaniesWithProvider = async () => {
	const fileNames = getFileNames(databaseDirCompanies);
	const jsonContent = getFileContents(databaseDirCompanies, fileNames).filter(
		(company) => {
			return company.job_board_provider && company.job_board_hostname;
		},
	);
	return jsonContent;
};

export const getAllCompanies = async () => {
	const fileNames = getFileNames(databaseDirCompanies);
	const jsonContent = getFileContents(databaseDirCompanies, fileNames);
	return jsonContent;
};

export const cloneDatabase = async () => {
	try {
		rmSync(databaseDir, { recursive: true, force: true });
	} catch (error) {
		console.error(`Error while deleting ${databaseDir}`, error);
	}

	try {
		const git = simpleGit();
		await git.clone(databaseGit, databaseDir);
	} catch (error) {
		console.log("Error cloning content/companies git repository", error);
		return;
	}
};

export const getFileNames = (dir) => {
	let fileNames = null;
	try {
		fileNames = readdirSync(dir);
	} catch (err) {
		console.log(err);
	}
	return fileNames;
};

export const getFileContents = (dir, fileNames) => {
	const filePaths = fileNames.map((name) => ({
		name,
		path: `${dir}/${name}/index.${fileExtension}`,
	}));
	const fileContents = filePaths.map(({ name, path }) => {
		let content = null;
		try {
			content = readFileSync(path, "utf-8");
		} catch (err) {
			console.error("Error reading files", err);
		}
		return JSON.parse(content)
	});

	return fileContents;
};
