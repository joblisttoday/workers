import { Stripe } from "stripe";

export const initStripe = (secret) => {
	return new Stripe(secret);
};

/* https://docs.stripe.com/api/payment_intents/list */
export const getPaymentIntents = (stripe, options = {}) => {
	return stripe.paymentIntents.list(options);
};

export const gatherPaymentIntents = async (
	stripe,
	options = {},
	gatheredIntents = [],
) => {
	const { has_more, data } = await getPaymentIntents(stripe, options);
	gatheredIntents.push(...data);

	if (has_more) {
		const { id: starting_after } = data[data.length - 1];
		await gatherPaymentIntents(
			stripe,
			{ ...options, starting_after },
			gatheredIntents,
		);
	}

	return gatheredIntents;
};

/* https://docs.stripe.com/api/checkout/sessions/list */
export const getCheckoutSessions = (stripe, options = {}) => {
	return stripe.checkout.sessions.list(options);
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
