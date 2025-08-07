import { initDb } from "../databases/database-sqlite.js";
import fs from "fs";

const optimizeDatabase = async (filename = "joblist.db") => {
	console.log("=== Optimizing database for sql.js-httpvfs (Final Step) ===");
	const dbPath = `./.db-sqlite/${filename}`;
	const optimizedPath = `./.db-sqlite/${filename}.temp`;
	
	if (!fs.existsSync(dbPath)) {
		throw new Error(`Database file not found: ${dbPath}`);
	}

	try {
		console.log("Step 1: Creating optimized database with page_size=1024...");
		
		// Remove temp file if it exists
		if (fs.existsSync(optimizedPath)) {
			fs.unlinkSync(optimizedPath);
		}
		
		// Try VACUUM INTO first (SQLite 3.27+)
		console.log("Attempting VACUUM INTO approach...");
		const sourceDb = await initDb(filename);
		
		try {
			// Set page size and use VACUUM INTO to create optimized copy
			await sourceDb.exec(`
				PRAGMA page_size = 1024;
				VACUUM INTO '${optimizedPath}';
			`);
			
			console.log("✅ VACUUM INTO successful");
			await sourceDb.close();
			
		} catch (vacuumError) {
			console.log("⚠️ VACUUM INTO failed, falling back to manual approach:", vacuumError.message);
			await sourceDb.close();
			
			// Fallback: Manual optimization approach
			console.log("Creating new database with page_size=1024...");
			const newDb = await initDb(filename + '.temp');
			
			// Set optimization settings on empty database
			await newDb.exec("PRAGMA journal_mode = DELETE");
			await newDb.exec("PRAGMA page_size = 1024");
			
			// Get all table schemas and data manually
			const originalDb = await initDb(filename);
			
			// Copy schema
			const tables = await originalDb.all(`
				SELECT sql FROM sqlite_master 
				WHERE type='table' AND name NOT LIKE 'sqlite_%'
			`);
			
			for (const table of tables) {
				if (table.sql) {
					await newDb.exec(table.sql);
				}
			}
			
			// Copy indexes
			const indexes = await originalDb.all(`
				SELECT sql FROM sqlite_master 
				WHERE type='index' AND name NOT LIKE 'sqlite_%' AND sql IS NOT NULL
			`);
			
			for (const index of indexes) {
				if (index.sql) {
					try {
						await newDb.exec(index.sql);
					} catch (e) {
						console.log("Skipping index (likely auto-created):", e.message);
					}
				}
			}
			
			// Copy triggers
			const triggers = await originalDb.all(`
				SELECT sql FROM sqlite_master 
				WHERE type='trigger' AND sql IS NOT NULL
			`);
			
			for (const trigger of triggers) {
				if (trigger.sql) {
					await newDb.exec(trigger.sql);
				}
			}
			
			// Copy data from each table
			const tableNames = await originalDb.all(`
				SELECT name FROM sqlite_master 
				WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '%_fts%'
			`);
			
			for (const table of tableNames) {
				console.log(`Copying data from table: ${table.name}`);
				const rows = await originalDb.all(`SELECT * FROM "${table.name}"`);
				
				if (rows.length > 0) {
					const columns = Object.keys(rows[0]);
					const placeholders = columns.map(() => '?').join(', ');
					const insertSql = `INSERT INTO "${table.name}" (${columns.join(', ')}) VALUES (${placeholders})`;
					
					const stmt = await newDb.prepare(insertSql);
					for (const row of rows) {
						await stmt.run(Object.values(row));
					}
					await stmt.finalize();
				}
			}
			
			await originalDb.close();
			await newDb.close();
		}
		
		console.log("Step 2: Applying FTS optimization...");
		const db = await initDb(filename + '.temp');
		
		// Optimize FTS tables (as recommended in docs)
		const ftsTablesResult = await db.all(`
			SELECT name FROM sqlite_master 
			WHERE type = 'table' AND name LIKE '%_fts' 
			AND name NOT LIKE '%_fts_%'
		`);
		
		for (const table of ftsTablesResult) {
			console.log(`Optimizing FTS table: ${table.name}`);
			try {
				await db.exec(`INSERT INTO ${table.name}(${table.name}) VALUES ('optimize');`);
			} catch (e) {
				console.log(`FTS optimization failed for ${table.name}:`, e.message);
			}
		}

		console.log("Step 3: Running ANALYZE and final VACUUM...");
		await db.exec("ANALYZE;");
		await db.exec("VACUUM;");
		
		// Verify optimization worked
		const pageSize = await db.get("PRAGMA page_size;");
		const journalMode = await db.get("PRAGMA journal_mode;");
		const stats = await db.get(`
			SELECT page_count * page_size as size_bytes, 
				   page_count, page_size 
			FROM pragma_page_count, pragma_page_size
		`);
		
		console.log(`✅ Database optimization complete:`);
		console.log(`   Page size: ${pageSize.page_size}`);
		console.log(`   Journal mode: ${journalMode.journal_mode}`);
		console.log(`   Database size: ${Math.round(stats.size_bytes / 1024 / 1024 * 100) / 100} MB`);
		console.log(`   Page count: ${stats.page_count}`);
		
		if (pageSize.page_size !== 1024) {
			throw new Error(`Optimization failed: expected page_size=1024, got ${pageSize.page_size}`);
		}
		
		await db.close();
		
		// Replace original with optimized version
		console.log("Step 4: Replacing original database with optimized version...");
		fs.renameSync(optimizedPath, dbPath);
		
		console.log("🎉 Database successfully optimized for sql.js-httpvfs!");
		
	} catch (error) {
		console.error("Error during optimization:", error);
		
		// Clean up temp file on error
		if (fs.existsSync(optimizedPath)) {
			fs.unlinkSync(optimizedPath);
		}
		
		throw error;
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