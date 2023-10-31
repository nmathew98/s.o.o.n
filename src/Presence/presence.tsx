import type { PresenceProps, ReactElementWithKey } from "./types";
import React from "react";
import {
	animateExit,
	applyProps,
	isMotionChildWithKey,
	createChildLookup,
	toArray,
	mergeNextChildrenAndExitingChildren,
	mergePreviousChildrenWithNextChildrenAndExitingChildren,
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

	const unfilteredChildren = toArray(children);
	const nextChildren = unfilteredChildren.filter(isMotionChildWithKey);

	const [_, setForcedRerenders] = React.useState(0);

	const isInitialRender = React.useRef(true);

	const exitingChildrenLookupRef = React.useRef(new Map());
	const currentChildrenRef = React.useRef<ReactElementWithKey[]>(nextChildren);

	const forceRerender = () =>
		setForcedRerenders(forcedRerenders => forcedRerenders + 1);

	React.useLayoutEffect(() => {
		isInitialRender.current = false;

		currentChildrenRef.current = nextChildren;
	});

	React.useLayoutEffect(
		() => () => {
			currentChildrenRef.current = [];
			exitingChildrenLookupRef.current.clear();
		},
		[],
	);

	if (isInitialRender.current) {
		return nextChildren.map(applyProps({ initial }));
	}

	const previousChildren = [...currentChildrenRef.current];
	const nextChildrenLookup = createChildLookup(nextChildren);

	const exitingChildren = previousChildren
		.filter(child => !nextChildrenLookup.has(child.key))
		.map(child => {
			const onExit = () => {
				exitingChildrenLookupRef.current.delete(child.key);

				if (!exitingChildrenLookupRef.current.size) {
					context?.isDoneExiting?.(id);
					onExitEnd?.();

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

			return exitingChild as ReactElementWithKey;
		});
	const exitingChildrenLookup = createChildLookup(exitingChildren);
	exitingChildrenLookupRef.current = exitingChildrenLookup;

	if (!exitBeforeEnter) {
		return mergeNextChildrenAndExitingChildren(
			unfilteredChildren,
			exitingChildren,
		).filter(isMotionChildWithKey);
	}

	return mergePreviousChildrenWithNextChildrenAndExitingChildren(
		previousChildren,
		nextChildrenLookup,
		exitingChildrenLookup,
	);
};
