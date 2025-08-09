import duckdb from 'duckdb';
import fs from 'fs';
import path from 'path';

const generateParquetFromSQLite = async (sqliteFilename = 'joblist.db') => {
    console.log('=== Generating Parquet files from SQLite database ===');
    
    const sqlitePath = path.resolve(`./.db-sqlite/${sqliteFilename}`);
    const parquetDir = './.db-duckdb';
    
    // Ensure SQLite file exists
    if (!fs.existsSync(sqlitePath)) {
        throw new Error(`SQLite database not found: ${sqlitePath}`);
    }
    
    // Create parquet directory if it doesn't exist
    if (!fs.existsSync(parquetDir)) {
        fs.mkdirSync(parquetDir, { recursive: true });
    }
    
    try {
        console.log('Initializing DuckDB...');
        const duckDb = new duckdb.Database(':memory:');
        
        // Install and load SQLite extension
        await new Promise((resolve, reject) => {
            duckDb.run(`INSTALL sqlite; LOAD sqlite;`, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Get list of tables directly from SQLite using DuckDB
        console.log('Getting table list...');
        const tables = await new Promise((resolve, reject) => {
            duckDb.all(`
                SELECT tbl_name 
                FROM sqlite_scan('${sqlitePath}', 'sqlite_master') 
                WHERE type = 'table' 
                AND tbl_name NOT LIKE 'sqlite_%' 
                AND tbl_name NOT LIKE '%_fts%'
                AND tbl_name NOT LIKE '%_fts_%'
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        console.log(`Found ${tables.length} tables to export:`, tables.map(t => t.tbl_name).join(', '));
        
        // Export each table to parquet
        for (const table of tables) {
            const tableName = table.tbl_name;
            const parquetPath = `${parquetDir}/${tableName}.parquet`;
            
            console.log(`Exporting ${tableName} to parquet...`);
            
            // Remove existing parquet file
            if (fs.existsSync(parquetPath)) {
                fs.unlinkSync(parquetPath);
            }
            
            // Export directly to parquet using sqlite_scan
            await new Promise((resolve, reject) => {
                duckDb.run(`COPY (SELECT * FROM sqlite_scan('${sqlitePath}', '${tableName}')) TO '${parquetPath}' (FORMAT PARQUET);`, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            // Get file size for reporting
            const stats = fs.statSync(parquetPath);
            console.log(`✅ Exported ${tableName}: ${Math.round(stats.size / 1024)} KB`);
        }
        
        // Close connection
        await new Promise((resolve) => {
            duckDb.close(resolve);
        });
        
        // Calculate total size
        const totalSize = fs.readdirSync(parquetDir)
            .filter(file => file.endsWith('.parquet'))
            .map(file => fs.statSync(`${parquetDir}/${file}`).size)
            .reduce((a, b) => a + b, 0);
            
        console.log(`✅ Parquet export completed successfully!`);
        console.log(`   Directory: ${parquetDir}`);
        console.log(`   Total size: ${Math.round(totalSize / 1024)} KB`);
        console.log(`   Files exported: ${tables.length}`);
        
    } catch (error) {
        console.error('Error generating Parquet files:', error);
        throw error;
    }
};

const init = async () => {
    await generateParquetFromSQLite();
};

// Run if called directly
if (process.argv[1].endsWith('generate-duckdb.js')) {
    init();
}

export { generateParquetFromSQLite };
export default init;