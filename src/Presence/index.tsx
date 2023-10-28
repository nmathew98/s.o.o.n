import React from "react";
import {
	PolymorphicMotion,
	type PolymorphicMotionHandles,
	type PolymorphicMotionProps,
} from "../Motion";

export interface PresenceProps {
	exitBeforeEnter?: boolean;
}

export const Presence: React.FC<React.PropsWithChildren<PresenceProps>> = ({
	children,
	exitBeforeEnter,
}) => {
	const [childrenToRender, setChildrenToRender] = React.useState(
		filterMotionElementsWithKeys(children),
	);
	const isInitialRender = React.useRef(true);
	const pendingChildren = React.useRef<MotionChildWithKey[]>([]);

	React.useLayoutEffect(() => {
		isInitialRender.current = false;
	});

	if (isInitialRender.current) return childrenToRender;

	const setNthChild = (
		initialChild: MotionChildWithKey,
		currentChild: MotionChildWithKey,
	) =>
		setChildrenToRender(children =>
			children.map(child => {
				if (child.key === initialChild.key) {
					return currentChild;
				}

				return child;
			}),
		);

	// If `exitBeforeEnter` then we wait until all children
	// have been animated out and only then do we add in the pending children
	const animateExitBeforeEnter =
		(_: MotionChildWithKey, idx: number, arr: MotionChildWithKey[]) =>
		(instance: PolymorphicMotionHandles) =>
			instance.animateExit().then(() => {
				if (idx === arr.length - 1) {
					arr.forEach(child => {
						setNthChild(
							child,
							pendingChildren.current.splice(0, 1).pop() as MotionChildWithKey,
						);
					});
				}

				if (
					idx === arr.length - 1 &&
					pendingChildren.current.length > arr.length
				) {
					setChildrenToRender(children => [
						...children,
						...pendingChildren.current.slice(arr.length),
					]);
				}
			});

	// If `!exitBeforeEnter` then we add in pending children as each rendered element
	// is animated out
	const animateExitAndEnter =
		(child: MotionChildWithKey, idx: number, arr: MotionChildWithKey[]) =>
		(instance: PolymorphicMotionHandles) =>
			instance.animateExit().then(() => {
				if (pendingChildren.current.length > 0) {
					setNthChild(
						child,
						pendingChildren.current.splice(0, 1).pop() as MotionChildWithKey,
					);
				}

				if (idx === arr.length - 1 && pendingChildren.current.length > 0) {
					setChildrenToRender(children => [
						...children,
						...pendingChildren.current,
					]);
				}
			});

	// In both cases, an exiting element is paired with a pending element
	// and if there are more pending children than there are exiting
	// then they are appended to `childrenToRender`
	const animateExit = exitBeforeEnter
		? animateExitBeforeEnter
		: animateExitAndEnter;

	setChildrenToRender(childrenToRender => {
		const renderedChildrenLookup = createLookup(childrenToRender);

		const currentChildren = filterMotionElementsWithKeys(children);
		const currentChildrenLookup = createLookup(currentChildren);

		pendingChildren.current = currentChildren.filter(
			child => !renderedChildrenLookup.has(child.key),
		);

		const exitingChildrenDiff = childrenToRender
			.filter(child => !currentChildrenLookup.has(child.key))
			.map(
				(child, idx, arr) =>
					React.cloneElement(child, {
						...child.props,
						ref: animateExit(child, idx, arr),
					}) as MotionChildWithKey,
			);
		const exitingChildrenDiffLookup = createLookup(exitingChildrenDiff);

		if (!exitingChildrenDiffLookup.size && !pendingChildren.current.length)
			return childrenToRender;

		if (!exitingChildrenDiffLookup.size && pendingChildren.current.length)
			return [...childrenToRender, ...pendingChildren.current];

		return childrenToRender.map(child => {
			if (!exitingChildrenDiffLookup.has(child.key)) return child;

			return exitingChildrenDiffLookup.get(child.key) as MotionChildWithKey;
		});
	});

	return childrenToRender;
};

const createLookup = (
	children: MotionChildWithKey[],
	lookup: Map<string, MotionChildWithKey> = new Map(),
) => (children.forEach(child => lookup.set(child.key, child)), lookup);

const filterMotionElementsWithKeys = (
	children: React.ReactNode | React.ReactNode[],
) =>
	React.Children.toArray(children).filter(
		and(isMotionElement, hasKey),
	) as MotionChildWithKey[];

const and =
	(...predicates: ((x: unknown) => boolean)[]) =>
	(x: unknown) =>
		predicates.every(predicate => predicate(x));

const hasKey = (child: unknown) => Boolean((child as React.ReactElement)?.key);

const isMotionElement = (child: unknown): child is MotionChild =>
	React.isValidElement(child) &&
	(child as MotionChild)?.type === PolymorphicMotion;

type MotionChild = React.ReactElement<
	Omit<PolymorphicMotionProps<any>, "as">,
	typeof PolymorphicMotion
>;
type MotionChildWithKey = MotionChild & {
	key: string;
};
