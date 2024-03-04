import { readdirSync, readFileSync, rmSync } from "fs";

import { writeFile, mkdir, rm } from "fs/promises";

import simpleGit from "simple-git";
import matter from "gray-matter";

const databaseGit = "https://github.com/joblisttoday/companies.git";
const databaseDir = "./.db-github-data";
const databaseDirCompanies = `${databaseDir}/companies`;
const fileExtension = "md";

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

export const saveNewCompanies = async (companies) => {
	const dirNewCompanies = `${databaseDir}/companies-new`;

	try {
		await rm(dirNewCompanies, { recursive: true, force: true });
		console.log(`${dirNewCompanies} is deleted`);
	} catch (error) {
		console.error(`Error while deleting ${dirNewCompanies}`, error);
	}

	try {
		await mkdir(dirNewCompanies);
		console.log(`${dirNewCompanies} is created`);
	} catch (error) {
		console.error(`Error while creating ${dirNewCompanies}`, error);
	}

	const operations = companies.map((company) => {
		if (!company.slug) {
			console.log("No slug for", company.title);
		}
		const fileData = matter.stringify("", company);
		const folderPath = `${dirNewCompanies}/${company.slug}`;
		const filePath = `${folderPath}/index.${fileExtension}`;
		return {
			folderPath,
			filePath,
			fileData,
		};
	});

	const operationPromises = operations.map((operation) => {
		const { folderPath, filePath, fileData } = operation;
		return mkdir(folderPath).then(() => {
			return writeFile(filePath, fileData);
		});
	});

	try {
		await Promise.all(operationPromises);
	} catch (error) {
		console.log("Error while saving new companies files to disk", error);
		return;
	}
	console.log("Wrote new companies");

	const oldCompanies = await getAllCompanies();

	console.log("Stats: ", {
		companies: companies.length,
		oldCompanies: oldCompanies.length,
	});
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

		let frontMatter = matter(content);
		return serializeJson(frontMatter);
	});

	return fileContents;
};

export const serializeJson = (item) => {
	return {
		title: item.data["title"],
		slug: item.data["slug"],
		description: item.data["description"],
		tags: item.data["tags"],
		company_url: item.data["company_url"],
		job_board_provider: item.data["job_board_provider"],
		job_board_hostname: item.data["job_board_hostname"],
		job_board_url: item.data["job_board_url"],
		twitter_url: item.data["twitter_url"],
		linkedin_url: item.data["linkedin_url"],
		instagram_url: item.data["instagram_url"],
		facebook_url: item.data["facebook_url"],
		positions: item.data["positions"],
		created_at: item.data["created_at"],
		updated_at: item.data["updated_at"],
	};
};
