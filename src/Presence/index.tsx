import React from "react";
import type { PresenceProps, ReactElementWithKey } from "./types";
import {
	animateExit,
	applyProps,
	childIsForwardRefWithKey,
	createLookup,
	toArray,
} from "./utils";

export const Presence: React.FC<React.PropsWithChildren<PresenceProps>> = ({
	initial,
	children,
	exitBeforeEnter,
}) => {
	const nextChildren = toArray(children)
		.filter(childIsForwardRefWithKey)
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

			if (!exitBeforeEnter) {
				forceRerender();
			} else if (exitBeforeEnter && isLastExitingChild) {
				forceRerender();
			}
		};

		const exitingChild = React.cloneElement(child, {
			...child.props,
			ref: animateExit(onExit),
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
