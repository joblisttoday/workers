import { initDb, executeSqlFile } from "../databases/database-sqlite.js";
import { initDb as initStripeDb } from "../databases/database-stripe.js";

const init = async () => {
	const db = await initDb();
	/* await executeSqlFile(db, "processing/companies_update_created_at.sql"); */
	/* await executeSqlFile(db, "processing/companies_update_updated_at.sql"); */

	const stripeDb = await initStripeDb();
	console.log("stripeDb", stripeDb);
	const companiesSlugs = await stripeDb.all(
		"SELECT * FROM highlight_companies",
	);
	console.log("companiesSlugs", companiesSlugs);
	for (const { slug } of companiesSlugs) {
		db.run("UPDATE companies SET is_highlighted = ? WHERE slug = ?", 1, slug);
		console.log("company highlighted", slug);
	}
	/* await executeSqlFile(db, "processing/companies_update_highlight.sql"); */
};

init();

export default init;
