import React from "react";
import type { PresenceProps } from "./types";
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
	const [_, setForcedRerenders] = React.useState(0);
	const nextChildren = toArray(children).filter(childIsForwardRefWithKey);
	const nextChildrenLookup = createLookup(nextChildren);

	const isInitialRender = React.useRef(true);

	const exitingChildrenRef = React.useRef(new Map());
	const currentChildrenRef = React.useRef(createLookup(nextChildren));

	const forceRerender = () =>
		setForcedRerenders(forcedRerender => forcedRerender + 1);

	React.useLayoutEffect(() => {
		isInitialRender.current = false;

		currentChildrenRef.current = createLookup(nextChildren);
	});

	if (isInitialRender.current) {
		return nextChildren.map(applyProps({ initial }));
	}

	const previousChildrenLookup = currentChildrenRef.current;
	const previousChildren = [...currentChildrenRef.current.values()];
	const exitingChildren = previousChildren.filter(
		child => !nextChildrenLookup.has(child.key),
	);
	const exitingChildrenLookup = createLookup(exitingChildren);
	exitingChildrenRef.current = exitingChildrenLookup;

	const childrenToRender = previousChildren.map((child, idx) => {
		if (!exitingChildrenLookup.has(child.key)) {
			if (nextChildrenLookup.has(child.key)) {
				return nextChildrenLookup.get(child.key);
			}

			return child;
		}

		const isLastExitingChild = exitingChildren.at(-1)?.key === child.key;

		const onExit = () => {
			exitingChildrenRef.current.delete(child.key);
			currentChildrenRef.current.delete(child.key);

			if (exitBeforeEnter) {
				forceRerender();
			}
		};

		const exitingChild = React.cloneElement(child, {
			...child.props,
			ref: animateExit(onExit, isLastExitingChild),
		});

		if (exitBeforeEnter) {
			return exitingChild;
		}

		const enteringChild = nextChildren.splice(idx, 1).pop();

		return (
			<React.Fragment key={enteringChild?.key ?? exitingChild.key}>
				{exitingChild}
				{enteringChild}
			</React.Fragment>
		);
	});

	if (!exitBeforeEnter) {
		return [
			...childrenToRender,
			...nextChildren.filter(child => !previousChildrenLookup.has(child.key)),
		];
	}

	if (!exitingChildren.length) {
		return nextChildren;
	}

	return childrenToRender;
};
