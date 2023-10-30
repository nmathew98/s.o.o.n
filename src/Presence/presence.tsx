import type { PresenceProps, ReactElementWithKey } from "./types";
import React from "react";
import {
	animateExit,
	applyProps,
	isMotionChildWithKey,
	createLookup,
	toArray,
	mergeCurrentAndNextChildren,
} from "./utils";
import { PresenceContext } from "./context";

export const Presence: React.FC<React.PropsWithChildren<PresenceProps>> = ({
	id,
	initial,
	children,
	exitBeforeEnter,
	onExitEnd,
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

	const currentChildren = previousChildren.map(child => {
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
				context?.isDoneExiting?.(id);
				onExitEnd?.();
			}

			if (!exitBeforeEnter) {
				forceRerender();
			} else if (exitBeforeEnter && isLastExitingChild) {
				forceRerender();
			}
		};

		const onStartExit = () => {
			context?.isExiting?.(id);
		};

		const exitingChild = React.cloneElement(child, {
			...child.props,
			ref: animateExit(onExit, onStartExit),
		});

		return exitingChild;
	}) as ReactElementWithKey[];

	if (!exitBeforeEnter) {
		return mergeCurrentAndNextChildren(
			currentChildren,
			nextChildrenLookup,
			exitingChildrenLookup,
			previousChildrenLookup,
		);
	}

	return currentChildren;
};
