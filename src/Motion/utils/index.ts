import { animate, inView, scroll } from "motion";
import type {
	AnimationOptionsWithOverrides,
	InViewOptions,
	ScrollOptions,
} from "motion";
import type {
	AnimateInitialOptions,
	AnimateChangeOptions,
	KeyframesDefinition,
	AnimateEventOptions,
} from "../types";

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

export const animateInitial =
	({
		isInitialRender,
		initial: initialKeyframesDefinition,
		animate: animateKeyframesDefinition,
		defaultTransition,
		scrollOptions,
		inViewOptions,
	}: AnimateInitialOptions) =>
	(instance: HTMLElement | null) => {
		if (
			!instance ||
			!isInitialRender ||
			!initialKeyframesDefinition ||
			!(initialKeyframesDefinition && animateKeyframesDefinition) ||
			(scrollOptions && inViewOptions)
		) {
			return;
		}

		const keyframes = !isRecord(initialKeyframesDefinition)
			? animateKeyframesDefinition
			: initialKeyframesDefinition;
		const withScroll = isRecord(scroll);
		const withInView = isRecord(inViewOptions);

		const controls = animate(
			instance,
			keyframes,
			keyframes?.transition ?? defaultTransition,
		);

		if (withScroll) {
			scroll(controls, scrollOptions as ScrollOptions);
		} else if (withInView) {
			inView(instance, controls.stop, inViewOptions as InViewOptions);
		}

		return controls;
	};

export const animateChange =
	({
		isInitialRender,
		initial,
		final,
		defaultTransition,
	}: AnimateChangeOptions) =>
	(instance: HTMLElement | null) => {
		if (!instance || isInitialRender) {
			return;
		}

		const keyframes = merge(initial, final);

		const controls = animate(
			instance,
			keyframes,
			keyframes?.transition ?? defaultTransition,
		);

		return controls;
	};

export const animateEvent =
	({
		initial: initialKeyframesDefinition,
		animate: animateKeyframesDefinition,
		event,
		defaultTransition,
		reverse,
	}: AnimateEventOptions) =>
	(instance: null | HTMLElement) => {
		if (!instance || !event) {
			return;
		}

		const from = isRecord(initialKeyframesDefinition)
			? initialKeyframesDefinition
			: animateKeyframesDefinition;
		const keyframes = reverse ? merge(event, from) : merge(from, event);

		const controls = animate(
			instance,
			keyframes,
			event.transition ?? defaultTransition,
		);

		return controls;
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

export const isRecord = (x: unknown): x is KeyframesDefinition =>
	typeof x === "object";
