-- Optimize database for sql.js-httpvfs
-- These PRAGMA statements must be executed BEFORE creating any tables

PRAGMA journal_mode = DELETE;
PRAGMA page_size = 1024;

-- Verify settings
-- The following queries can be used to check that settings were applied correctly:
-- SELECT 'Page size: ' || page_size FROM pragma_page_size();
-- SELECT 'Journal mode: ' || journal_mode FROM pragma_journal_mode();