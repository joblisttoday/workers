import dotenv from "dotenv";
import { subDays } from "date-fns";
import {
	initStripe,
	gatherCheckoutSessions,
} from "../databases/database-stripe.js";
import {
	CS_CF_DICT,
	getCheckoutSessionsCustomFields,
} from "../utils/stripe.js";

const { COMPANY_HIGHLIGHT } = CS_CF_DICT;

const { parsed } = dotenv.config();
const { STRIPE_SECRET } = parsed;

const init = async () => {
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

	const companiesToHighlight = csWithCustomFields
		.map((checkoutSession) => {
			const { id: cs_id, custom_fields } = checkoutSession;
			const companyHighlightSlug = custom_fields[0][COMPANY_HIGHLIGHT];
			return { cs_id, slug: companyHighlightSlug };
		})
		.filter(({ slug }) => !!slug);

	companiesToHighlight.forEach(async (company) => {
		if (company.slug) {
			console.info("Should highlight company", company);
		} else {
			console.info(
				"Cannot highlight company (see checkout session id)",
				company,
			);
		}
	});
};

init();

export default init;
