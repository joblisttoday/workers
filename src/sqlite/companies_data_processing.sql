
/* Update the companies table with the new created_at column */
UPDATE companies
SET created_at = (
    /* Condition to convert created_at from epoch to date when value starts by 1 */
    CASE 
        WHEN created_at LIKE '1%' THEN datetime(created_at, 'unixepoch')
        WHEN created_at IS NULL THEN '2012-01-01 00:00:00'
        ELSE created_at
    END
);