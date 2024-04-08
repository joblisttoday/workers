CREATE TABLE IF NOT EXISTS heatmap_agg AS

WITH RECURSIVE dates(date) AS (
    SELECT DATE('now', '-365 day')  -- Start date
    UNION ALL
    SELECT DATE(date, '+1 day')     -- Recursive increment by one day
    FROM dates
    WHERE date < DATE('now')         -- End date
),
company_ids AS (
    SELECT DISTINCT
        company_id
    FROM jobs
)
SELECT
    c.date AS date,
    s.company_id AS id,
    COUNT(j.ObjectId) AS total,
    strftime('%Y', c.date) AS year,
    strftime('%m', c.date) AS month,
    strftime('%w', c.date) AS dow,
    strftime('%j', c.date) AS doy,
    strftime('%W', c.date) AS woy
FROM dates c
CROSS JOIN company_ids i
LEFT JOIN jobs j
    ON DATE(j.published_date) = c.date
        AND j.company_id = s.company_id
GROUP BY
    c.date, i.company_id
;
