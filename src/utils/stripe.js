export const CS_CF_DICT = {
	COMPANY_HIGHLIGHT: "joblisttodaycompany",
	COMPANY_HOMEPAGE: "joblisttodaycompany",
};
export const CF_GETTERS = {
	[CS_CF_DICT.COMPANY_HIGHLIGHT]: (val) => getCompanyHighlight(val),
};

export const getCompanyHighlight = (fieldValue) => {
	let val;
	if (fieldValue.startsWith("joblist.today/")) {
		val = fieldValue.split("joblist.today/")[1];
	} else if (fieldValue) {
		val = fieldValue;
	}
	let companySlug;
	try {
		const url = new URL(`https://example.org/${val}`);
		companySlug = url.pathname.split("/")[1];
		console.log("companySlug", companySlug);
	} catch (e) {
		console.info("Invalid company highlight custom field value");
	}
	return companySlug;
};

export const getCustomField = (customField) => {
	const { key, text } = customField;
	const val = text.value;
	const customFieldGetter = CF_GETTERS[key];
	return {
		[key]:
			val && typeof customFieldGetter === "function"
				? customFieldGetter(val)
				: undefined,
	};
};

export const getCheckoutSessionCustomFields = (checkoutSession, keys = []) => {
	const { custom_fields } = checkoutSession;
	if (custom_fields) {
		if (keys) {
			return custom_fields
				.filter((cf) => {
					const { key } = cf;
					return keys.includes(key);
				})
				.map(getCustomField);
		} else {
			return custom_fields;
		}
	}
};

export const getCheckoutSessionsCustomFields = (
	checkoutSessions,
	keys = [],
) => {
	return checkoutSessions.reduce((acc, cs) => {
		const custom_fields = getCheckoutSessionCustomFields(cs, keys);
		if (custom_fields.length) {
			acc.push({
				id: cs.id,
				custom_fields,
			});
		}
		return acc;
	}, []);
};
