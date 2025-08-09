import duckdb from "duckdb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ensureDir = (dir) => {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Generate Parquet files from SQLite database
const generateDuckDBFromSQLite = async (sqliteFilename = "joblist.db") => {
	console.log("=== Building Parquet files from SQLite ===");

	const sqlitePath = path.resolve(`./.db-sqlite/${sqliteFilename}`);
	const parquetDir = "./.db-duckdb";

	if (!fs.existsSync(sqlitePath)) {
		throw new Error(`SQLite database not found: ${sqlitePath}`);
	}

	ensureDir(parquetDir);

	let db;
	try {
		console.log("Initializing DuckDB in-memory...");
		db = new duckdb.Database(":memory:");

		// Install and load FTS extension
		await new Promise((resolve, reject) => {
			db.run("INSTALL fts; LOAD fts;", (err) => (err ? reject(err) : resolve()));
		});

		// Core tables and their FTS indexes
		const tablesToImport = ["jobs", "companies"];
		const ftsConfigs = {
			jobs: {
				id_col: "id",
				text_cols: ["name", "location", "company_title"],
				stemmer: "porter",
				stopwords: "english"
			},
			companies: {
				id_col: "id", 
				text_cols: ["title", "tags"],
				stemmer: "porter",
				stopwords: "english"
			}
		};

		console.log(`Exporting tables: ${tablesToImport.join(", ")}`);

		// Helper to safely quote identifiers
		const qident = (name) => `"${String(name).replace(/"/g, '""')}"`;

		// Export base tables and create FTS indexes
		for (const table of tablesToImport) {
			console.log(`Processing ${table}...`);
			
			// Import table from SQLite
			await new Promise((resolve, reject) => {
				db.run(
					`CREATE TABLE ${qident(table)} AS SELECT * FROM sqlite_scan('${sqlitePath}', '${table}');`,
					(err) => (err ? reject(err) : resolve()),
				);
			});

			// Export base table to Parquet
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
			console.log(`   ✅ ${path.basename(parquetPath)} (${sizeKB} KB)`);

			// Create FTS index if configuration exists
			if (ftsConfigs[table]) {
				console.log(`Creating FTS index for ${table}...`);
				const config = ftsConfigs[table];
				
				await new Promise((resolve, reject) => {
					const textColsStr = config.text_cols.map(col => `'${col}'`).join(', ');
					db.run(
						`PRAGMA create_fts_index('${table}', '${config.id_col}', ${textColsStr});`,
						(err) => (err ? reject(err) : resolve()),
					);
				});

				// Export FTS index to Parquet
				const ftsParquetPath = path.join(parquetDir, `${table}_fts.parquet`);
				if (fs.existsSync(ftsParquetPath)) fs.unlinkSync(ftsParquetPath);
				
				await new Promise((resolve, reject) => {
					db.run(
						`COPY fts_main_${table}.docs TO '${ftsParquetPath}' (FORMAT PARQUET);`,
						(err) => (err ? reject(err) : resolve()),
					);
				});

				const ftsSizeKB = fs.existsSync(ftsParquetPath)
					? Math.round(fs.statSync(ftsParquetPath).size / 1024)
					: 0;
				console.log(`   ✅ ${path.basename(ftsParquetPath)} (${ftsSizeKB} KB)`);
			}
		}

		console.log("✅ Parquet export complete");
		
	} catch (error) {
		console.error("Error generating Parquet files:", error);
		throw error;
	} finally {
		if (db) {
			await new Promise((resolve) => db.close(resolve));
		}
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
