UPDATE companies
SET updated_at = (
		CASE
				WHEN updated_at LIKE '1%' THEN date(datetime(updated_at, 'unixepoch'))
				WHEN updated_at IS NULL THEN date(created_at)
				ELSE date(updated_at)
		END
);
