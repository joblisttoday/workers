-- Create a temporary calendar table with all dates within the specified range
CREATE TABLE heatmap_agg AS

WITH RECURSIVE dates(date) AS (
    SELECT DATE('now', '-1 month')  -- Start date
    UNION ALL
    SELECT DATE(date, '+1 day')     -- Recursive increment by one day
    FROM dates
    WHERE date < DATE('now')         -- End date
), 
company_slugs AS (
    SELECT DISTINCT 
        company_slug 
    FROM jobs
)
SELECT
    c.date AS date,
    s.company_slug AS job_company_slug,
    COUNT(j.ObjectId) AS total,
    strftime('%Y', c.date) AS year,
    strftime('%m', c.date) AS month,
    strftime('%d', c.date) AS day,
    strftime('%j', c.date) AS doy,
    strftime('%W', c.date) AS woy
FROM dates c
CROSS JOIN company_slugs s
LEFT JOIN jobs j 
    ON DATE(j.published_date) = c.date
        AND j.company_slug = s.company_slug
GROUP BY
    c.date, s.company_slug
;