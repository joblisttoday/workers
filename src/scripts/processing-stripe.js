import { initDb, executeSqlFile } from "../databases/database-sqlite.js";
import { initDb as initStripeDb } from "../databases/database-stripe.js";

const init = async () => {
	/* get data from stripe db (not public) */
	const stripeDb = await initStripeDb();
	const companiesToHighight = await stripeDb.all(
		"SELECT * FROM highlight_companies",
	);

	/* update the pubic joblist db with the info */
	const db = await initDb();
	for (const { id } of companiesToHighight) {
		db.run("UPDATE companies SET is_highlighted = ? WHERE id = ?", 1, id);
		console.info("Highlighted company", id);
	}
};

init();

export default init;
