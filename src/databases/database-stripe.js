import { Stripe } from "stripe";
import { subDays } from "date-fns";
import { initDb as initSqliteDb, removeDb } from "./database-sqlite.js";

/* where we store the result of stripe api queries, and our transformations */
const databaseFileName = "stripe.db";

export const initDb = (database = databaseFileName) => {
	removeDb(database);
	return initSqliteDb(database);
};

export const initStripe = (secret) => {
	return new Stripe(secret);
};

/* https://docs.stripe.com/api/payment_intents/list */
export const getPaymentIntents = (stripe, options = {}) => {
	return stripe.paymentIntents.list(options);
};

/* https://docs.stripe.com/api/checkout/sessions/list */
export const getCheckoutSessions = (stripe, options = {}) => {
	return stripe.checkout.sessions.list(options);
};

export const gatherRecentCheckoutSessions = async (stripe) => {
	const startDate = subDays(new Date(), 31);
	const startTimestamp = Math.floor(startDate.getTime() / 1000);

	const sessions = await gatherCheckoutSessions(stripe, {
		created: { gte: startTimestamp },
		limit: 100,
	});

	return sessions.filter(
		(cs) =>
			cs.payment_status === "paid" || // one-time
			(cs.mode === "subscription" && cs.subscription), // subscription
	);
};

export const gatherCheckoutSessions = async (
	stripe,
	options = {},
	gatheredSessions = [],
) => {
	const { has_more, data } = await getCheckoutSessions(stripe, options);
	gatheredSessions.push(...data);

	if (has_more) {
		const { id: starting_after } = data[data.length - 1];
		await gatherCheckoutSessions(
			stripe,
			{ ...options, starting_after },
			gatheredSessions,
		);
	}

	return gatheredSessions;
};
