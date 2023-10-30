import type { PresenceProps, ReactElementWithKey } from "./types";
import React from "react";
import {
	animateExit,
	applyProps,
	isMotionChildWithKey,
	createLookup,
	toArray,
} from "./utils";
import { PresenceContext } from "./context";

export const Presence: React.FC<React.PropsWithChildren<PresenceProps>> = ({
	initial,
	children,
	exitBeforeEnter,
}) => {
	const context = React.useContext(PresenceContext);

	const nextChildren = toArray(children)
		.filter(isMotionChildWithKey)
		.map(applyProps({ initial }));
	const nextChildrenLookup = createLookup(nextChildren);

	const [_, setForcedRerenders] = React.useState(0);
	const isInitialRender = React.useRef(true);

	const currentChildrenRef = React.useRef(createLookup(nextChildren));

	const forceRerender = () =>
		setForcedRerenders(forcedRerenders => forcedRerenders + 1);

	React.useLayoutEffect(() => {
		isInitialRender.current = false;

		currentChildrenRef.current = createLookup(nextChildren);
	});

	if (isInitialRender.current) {
		return nextChildren;
	}

	const previousChildrenLookup = currentChildrenRef.current;
	const previousChildren = [...currentChildrenRef.current.values()];
	const exitingChildren = previousChildren.filter(
		child => !nextChildrenLookup.has(child.key),
	);
	const exitingChildrenLookup = createLookup(exitingChildren);

	const childrenToRender = previousChildren.flatMap(child => {
		if (!exitingChildrenLookup.has(child.key)) {
			if (nextChildrenLookup.has(child.key)) {
				return nextChildrenLookup.get(child.key);
			}

			return child;
		}

		const isLastExitingChild = exitingChildren.at(-1)?.key === child.key;

		const onExit = () => {
			previousChildrenLookup.delete(child.key);

			if (isLastExitingChild) {
				context?.toggleAreChildrenExiting();
			}

			if (!exitBeforeEnter) {
				forceRerender();
			} else if (exitBeforeEnter && isLastExitingChild) {
				forceRerender();
			}
		};

		const exitingChild = React.cloneElement(child, {
			...child.props,
			ref: animateExit(onExit, context),
		});

		return exitingChild;
	}) as ReactElementWithKey[];

	if (!exitBeforeEnter) {
		return [
			...childrenToRender,
			...nextChildren.filter(child => !previousChildrenLookup.has(child.key)),
		];
	}

	return childrenToRender;
};
