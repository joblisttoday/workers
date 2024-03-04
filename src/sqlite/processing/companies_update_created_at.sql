/* convert created_at from epoch to date when value starts by 1 */
UPDATE companies
SET created_at = (
		CASE
        WHEN created_at LIKE '1%' THEN date(datetime(created_at, 'unixepoch'))
        WHEN created_at IS NULL THEN '2012-01-01'
        ELSE date(created_at)
    END
);
