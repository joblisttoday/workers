
/* Update the companies table with the new created_at column */
UPDATE companies
SET created_at = (
    /* Condition to convert created_at from epoch to date when value starts by 1 */
		CASE
        WHEN created_at LIKE '1%' THEN date(datetime(created_at, 'unixepoch'))
        WHEN created_at IS NULL THEN '2012-01-01'
        ELSE date(created_at)
    END
);

UPDATE companies
SET updated_at = (
    /* Condition to convert updated_at from epoch to date when value starts by 1 */
		CASE
        WHEN updated_at LIKE '1%' THEN date(datetime(updated_at, 'unixepoch'))
        WHEN updated_at IS NULL THEN '2012-01-01'
        ELSE date(updated_at)
    END
);
