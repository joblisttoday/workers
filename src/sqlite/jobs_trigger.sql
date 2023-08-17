CREATE TRIGGER IF NOT EXISTS jobs_after_insert AFTER INSERT ON jobs BEGIN
INSERT OR REPLACE INTO jobs_fts (rowid, objectID, url, name, location, company_slug, company_title)
VALUES (new.rowid, new.objectID, new.url, new.name, new.location, new.company_slug, new.company_title);
END;

CREATE TRIGGER IF NOT EXISTS jobs_after_update AFTER UPDATE ON jobs BEGIN
INSERT OR REPLACE INTO jobs_fts (rowid, objectID, url, name, location, company_slug, company_title)
VALUES (new.rowid, new.objectID, new.url, new.name, new.location, new.company_slug, new.company_title);
END;

CREATE TRIGGER IF NOT EXISTS jobs_after_delete AFTER DELETE ON jobs BEGIN
DELETE FROM jobs_fts WHERE rowid = old.rowid;
END;
