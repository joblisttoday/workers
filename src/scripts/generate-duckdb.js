import duckdb from "duckdb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ensureDir = (dir) => {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Create a single DuckDB database file populated from the SQLite source.
const generateDuckDBFromSQLite = async (sqliteFilename = "joblist.db") => {
	console.log("=== Building DuckDB from SQLite ===");

	const sqlitePath = path.resolve(`./.db-sqlite/${sqliteFilename}`);
	const outDir = "./.db-duckdb";
	const outFile = path.join(outDir, "joblist.duckdb");
	const parquetDir = path.join(outDir, "parquet");

	if (!fs.existsSync(sqlitePath)) {
		throw new Error(`SQLite database not found: ${sqlitePath}`);
	}

	ensureDir(outDir);
	ensureDir(parquetDir);
	if (fs.existsSync(outFile)) fs.unlinkSync(outFile);

	try {
		console.log("Initializing DuckDB (file-backed)...");
		const db = new duckdb.Database(outFile);

		// Decide which tables to import (no listing step)
		const envList = process.env.DUCKDB_TABLES || "";
		const tables = envList
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);

		const tablesToImport = tables.length
			? tables
			: ["jobs", "companies", "jobs_analyze", "companies_analyze"];

		console.log(`Importing tables: ${tablesToImport.join(", ")}`);

		// Helper to safely quote identifiers
		const qident = (name) => `"${String(name).replace(/"/g, '""')}"`;

		for (const table of tablesToImport) {
			console.log(`Importing ${table}...`);
			await new Promise((resolve, reject) => {
				db.run(
					`CREATE OR REPLACE TABLE ${qident(table)} AS SELECT * FROM sqlite_scan('${sqlitePath}', '${table}');`,
					(err) => (err ? reject(err) : resolve()),
				);
			});
		}

		// Optional: checkpoint to ensure data is persisted
		await new Promise((resolve, reject) => {
			db.run(`CHECKPOINT;`, (err) => (err ? reject(err) : resolve()));
		});

		// Export Parquet files for each imported table
		console.log("Exporting Parquet files...");
		for (const table of tablesToImport) {
			const parquetPath = path.join(parquetDir, `${table}.parquet`);
			if (fs.existsSync(parquetPath)) fs.unlinkSync(parquetPath);
			await new Promise((resolve, reject) => {
				db.run(
					`COPY ${qident(table)} TO '${parquetPath}' (FORMAT PARQUET);`,
					(err) => (err ? reject(err) : resolve()),
				);
			});

			const sizeKB = fs.existsSync(parquetPath)
				? Math.round(fs.statSync(parquetPath).size / 1024)
				: 0;
			console.log(`   Wrote ${path.basename(parquetPath)} (${sizeKB} KB)`);
		}

		await new Promise((resolve) => db.close(resolve));

		const sizeKB = Math.round(fs.statSync(outFile).size / 1024);
		console.log("✅ DuckDB build complete");
		console.log(`   File: ${outFile}`);
		console.log(`   Size: ${sizeKB} KB`);
	} catch (error) {
		console.error("Error generating DuckDB file:", error);
		throw error;
	}
};

const init = async () => {
	await generateDuckDBFromSQLite();
};

// Run if called directly (robust for ESM)
try {
	const thisFile = fileURLToPath(import.meta.url);
	const calledAsScript =
		process.argv &&
		process.argv[1] &&
		path.resolve(process.argv[1]) === path.resolve(thisFile);
	if (calledAsScript) init();
} catch (_) {
	// ignore when imported programmatically
}

export { generateDuckDBFromSQLite };
export default init;
