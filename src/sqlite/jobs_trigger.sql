CREATE TRIGGER IF NOT EXISTS jobs_after_insert AFTER INSERT ON jobs BEGIN
INSERT OR REPLACE INTO jobs_fts (rowid, id, url, name, location, published_date, company_id, company_title)
VALUES (new.rowid, new.id, new.url, new.name, new.location, new.published_date, new.company_id, new.company_title);
END;

CREATE TRIGGER IF NOT EXISTS jobs_after_update AFTER UPDATE ON jobs BEGIN
INSERT OR REPLACE INTO jobs_fts (rowid, id, url, name, location, published_date, company_id, company_title)
VALUES (new.rowid, new.id, new.url, new.name, new.location, new.published_date, new.company_id, new.company_title);
END;

CREATE TRIGGER IF NOT EXISTS jobs_after_delete AFTER DELETE ON jobs BEGIN
DELETE FROM jobs_fts WHERE rowid = old.rowid;
END;
