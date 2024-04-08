import "dotenv/config";
import { subDays } from "date-fns";
import {
	initDb,
	initStripe,
	gatherCheckoutSessions,
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
	const timestamp = subDays(new Date(), 31).getTime();
	const checkoutSessions = await gatherCheckoutSessions(stripe, {
		limit: 100,
		created: {
			lte: timestamp,
		},
	});
	const companyHighlightCustomFields = [COMPANY_HIGHLIGHT];
	const csWithCustomFields = getCheckoutSessionsCustomFields(
		checkoutSessions,
		companyHighlightCustomFields,
	);

	const csWithCustomFieldsDict = Object.fromEntries(
		csWithCustomFields.map(({ id }) => [id, true]),
	);
	const missingCustomFieldOnSessions =
		csWithCustomFields.length !== checkoutSessions.length;

	if (missingCustomFieldOnSessions) {
		const sessionsMissingCustomFields = checkoutSessions.reduce((acc, cs) => {
			const csHasField = csWithCustomFieldsDict[cs.id] === true;
			if (!csHasField) {
				acc.push(cs);
			}
			return acc;
		}, []);

		if (sessionsMissingCustomFields.length) {
			sessionsMissingCustomFields.forEach(({ id, custom_fields }) => {
				console.info(
					"Missing required custom fields on checkout session, and cannot be processed",
					{ id, missing_fields: companyHighlightCustomFields, custom_fields },
				);
			});
		}
	} else {
		console.info(
			"All checkout sessions have the required custom fields to be processed",
		);
	}

	return csWithCustomFields
		.map((checkoutSession) => {
			const { id: cs_id, custom_fields } = checkoutSession;
			const companyHighlightId = custom_fields[0][COMPANY_HIGHLIGHT];
			return { cs_id, id: companyHighlightId };
		})
		.filter(({ id }) => !!id);
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
