import { initDb, removeDb } from "../databases/database-sqlite.js";
import fs from "fs";

const optimizeDatabase = async (filename = "joblist.db") => {
	console.log("Optimizing database for sql.js-httpvfs...");
	const dbPath = `./.db-sqlite/${filename}`;
	
	// Check if database exists and get current page size
	let needsRecreation = false;
	if (fs.existsSync(dbPath)) {
		const checkDb = await initDb(filename);
		const currentPageSize = await checkDb.get("PRAGMA page_size;");
		await checkDb.close();
		
		if (currentPageSize.page_size !== 1024) {
			console.log(`Current page size is ${currentPageSize.page_size}, need to recreate database with page_size=1024`);
			needsRecreation = true;
		}
	}

	if (needsRecreation) {
		console.log("Database needs recreation for proper page size. This should be done by running the full build process.");
		console.log("Current database will be optimized in place with other improvements...");
	}

	const db = await initDb(filename);

	try {
		// Step 1: Set journal mode (page size can only be set on empty database)
		console.log("Setting journal mode...");
		await db.exec("PRAGMA journal_mode = DELETE;");

		// Step 2: Optimize FTS tables if they exist
		console.log("Optimizing FTS tables...");
		const ftsTablesResult = await db.all(`
			SELECT name FROM sqlite_master 
			WHERE type = 'table' AND name LIKE '%_fts%' 
			AND name NOT LIKE '%_fts_%'
		`);
		
		for (const table of ftsTablesResult) {
			console.log(`Optimizing FTS table: ${table.name}`);
			await db.exec(`INSERT INTO ${table.name}(${table.name}) VALUES ('optimize');`);
		}

		// Step 3: Create additional covering indexes for better performance
		console.log("Creating covering indexes...");
		
		// Covering index for companies stats query
		await db.exec(`
			CREATE INDEX IF NOT EXISTS idx_companies_highlighted_covering 
			ON companies(is_highlighted) WHERE is_highlighted = 1;
		`).catch(() => {}); // Ignore if exists
		
		// Covering index for jobs analysis
		await db.exec(`
			CREATE INDEX IF NOT EXISTS idx_jobs_company_date_covering 
			ON jobs(company_id, published_date, id);
		`).catch(() => {}); // Ignore if exists

		// Step 4: Analyze tables for query optimization
		console.log("Analyzing tables...");
		await db.exec("ANALYZE;");

		// Step 5: Vacuum to reorganize database and apply page size changes
		console.log("Vacuuming database...");
		await db.exec("VACUUM;");

		// Step 6: Verify optimization
		const pageSize = await db.get("PRAGMA page_size;");
		const journalMode = await db.get("PRAGMA journal_mode;");
		
		console.log(`Database optimization complete:`);
		console.log(`- Page size: ${pageSize.page_size}`);
		console.log(`- Journal mode: ${journalMode.journal_mode}`);
		
		// Get database file size
		const stats = await db.get(`
			SELECT page_count * page_size as size_bytes, 
				   page_count, page_size 
			FROM pragma_page_count, pragma_page_size
		`);
		console.log(`- Database size: ${Math.round(stats.size_bytes / 1024 / 1024 * 100) / 100} MB`);
		console.log(`- Page count: ${stats.page_count}`);

	} catch (error) {
		console.error("Error optimizing database:", error);
		throw error;
	} finally {
		await db.close();
	}
};

const init = async () => {
	await optimizeDatabase();
};

// Run if called directly
if (process.argv[1].endsWith('optimize-database.js')) {
	init();
}

export { optimizeDatabase };
export default init;