/* convert created_at from epoch to date when value starts by 1 */
UPDATE jobs
SET published_date = (
    CASE
        WHEN published_date LIKE '1%' THEN date(datetime(published_date, 'unixepoch'))
        ELSE date(published_date)
    END
);
