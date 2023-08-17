CREATE TRIGGER IF NOT EXISTS companies_after_insert AFTER INSERT ON companies BEGIN
INSERT OR REPLACE INTO companies_fts (rowid, slug, title, description, tags, positions)
VALUES (new.rowid, new.slug, new.title, new.description, new.tags, new.positions);
END;

CREATE TRIGGER IF NOT EXISTS companies_after_update AFTER UPDATE ON companies BEGIN
INSERT OR REPLACE INTO companies_fts (rowid, slug, title, description, tags, positions)
VALUES (new.rowid, new.slug, new.title, new.description, new.tags, new.positions);
END;

CREATE TRIGGER IF NOT EXISTS companies_after_delete AFTER DELETE ON companies BEGIN
DELETE FROM companies_fts WHERE rowid = old.rowid;
END;
