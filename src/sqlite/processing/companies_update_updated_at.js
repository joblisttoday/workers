/* convert updated_at from epoch to date when value starts by 1 */
UPDATE companies
SET updated_at = (
		CASE
        WHEN updated_at LIKE '1%' THEN date(datetime(updated_at, 'unixepoch'))
        WHEN updated_at IS NULL THEN '2012-01-01'
        ELSE date(updated_at)
    END
);
