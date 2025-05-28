import "dotenv/config";
import { subDays } from "date-fns";
import {
	initDb,
	initStripe,
	gatherRecentCheckoutSessions,
} from "../databases/database-stripe.js";

import {
	executeSqlFile,
	insertOrUpdateCompaniesToHighlight,
} from "../databases/database-sqlite.js";

import {
	CS_CF_DICT,
	getCheckoutSessionsCustomFields,
} from "../utils/stripe.js";

const { COMPANY_HIGHLIGHT } = CS_CF_DICT;
const { STRIPE_SECRET } = process.env;

const getCompaniesToHighlight = async () => {
	const stripe = initStripe(STRIPE_SECRET);

	const [checkoutSessions] = await Promise.all([
		gatherRecentCheckoutSessions(stripe),
	]);

	const activeCompanyIds = new Set();

	// 1. From checkout sessions (recent paid or sub starts)
	for (const session of checkoutSessions) {
		const customFields = session.custom_fields ?? [];
		const highlightField = customFields.find(
			(field) => field.key === COMPANY_HIGHLIGHT,
		);
		const value = highlightField?.text?.value.toLowerCase().trim();
		if (value) {
			activeCompanyIds.add(value);
		}
	}

	// Convert to array of { id, cs_id: optional }
	return Array.from(activeCompanyIds).map((id) => ({ id }));
};

const init = async () => {
	const companiesToHighlight = await getCompaniesToHighlight();
	companiesToHighlight.forEach(async (company) => {
		if (!company.id) {
			console.info(
				"Cannot highlight company (see checkout session id)",
				company,
			);
		}
	});
	const stripeDb = await initDb();
	await executeSqlFile(stripeDb, "stripe/highlight_companies_table.sql");
	await insertOrUpdateCompaniesToHighlight(stripeDb, companiesToHighlight);
};

init();

export default init;
