import type { AnimationOptionsWithOverrides } from "motion";
import type { KeyframesDefinition } from "../types";

export const calculateKeyframesFromAToB = (
	a?: KeyframesDefinition,
	b?: KeyframesDefinition,
	defaultTransition?: AnimationOptionsWithOverrides,
) => {
	if (!a || !b) {
		return {
			...merge(a, b),
			transition: b?.transition ?? defaultTransition,
		};
	}

	return {
		...merge(a, b),
		transition: b.transition ?? defaultTransition,
	};
};

export const merge = <T extends Record<string, any>>(a?: T, b?: T): T => {
	if (!a || !b) {
		return a || b || Object.create(null);
	}

	const isNullish = (value: unknown): value is null | undefined =>
		value === null || value === undefined;

	const initialToFinal = Object.fromEntries(
		Object.entries(b).map(([key, value]: any[]) => {
			if (
				(Array.isArray(value) && Array.isArray(a[key])) ||
				(Array.isArray(a[key]) && !Array.isArray(value)) ||
				(!Array.isArray(a[key]) && Array.isArray(value))
			) {
				return [
					key,
					[a[key], value].flat(2).filter(value => !isNullish(value)),
				];
			}

			if (typeof a[key] === "object" && typeof value === "object") {
				return [key, merge(a[key], value)];
			}

			const mergedValues = [a[key], value].filter(value => !isNullish(value));

			if (mergedValues.length === 1) {
				return [key, mergedValues].flat();
			}

			return [key, mergedValues];
		}),
	);
	const entriesInInitialNotInFinal = Object.fromEntries(
		Object.entries(a).filter(([key]) => !initialToFinal[key]),
	);

	return {
		...initialToFinal,
		...entriesInInitialNotInFinal,
	};
};
