
/* Update the companies table with the new created_at column */
UPDATE jobs
SET published_date = (
    /* Condition to convert created_at from epoch to date when value starts by 1 */
    CASE
        WHEN published_date LIKE '1%' THEN date(datetime(published_date, 'unixepoch'))
        WHEN published_date IS NULL THEN '2012-01-01'
        ELSE date(published_date)
    END
);
