import React from "react";
import {
	PolymorphicMotion,
	type PolymorphicMotionHandles,
	type PolymorphicMotionProps,
} from "../Motion";

export interface PresenceProps {
	initial?: boolean;
	exitBeforeEnter?: boolean;
}

export const Presence: React.FC<React.PropsWithChildren<PresenceProps>> = ({
	initial,
	children,
	exitBeforeEnter,
}) => {
	const [childrenToRender, setChildrenToRender] = React.useState(
		applyProps(filterMotionElementsWithKeys(children), {
			initial,
			exitBeforeEnter,
		}),
	);
	const isInitialRender = React.useRef(true);
	const pendingChildren = React.useRef<MotionChildWithKey[]>([]);

	React.useEffect(() => {
		if (isInitialRender.current) {
			return void (isInitialRender.current = false);
		}

		// If `exitBeforeEnter` then we wait until the child
		// has been animated out and only then do we add in the pending child
		const animateExitBeforeEnter =
			(
				_: MotionChildWithKey,
				idx: number,
				exitingChildren: MotionChildWithKey[],
				exitingChildrenLookup: Map<string, MotionChildWithKey>,
			) =>
			(instance: PolymorphicMotionHandles) =>
				instance.animateExit().then(() => {
					if (idx === exitingChildrenLookup.size - 1) {
						exitingChildren.forEach(child => {
							if (!pendingChildren.current.length) {
								return;
							}

							setNthChild(
								child,
								pendingChildren.current
									.splice(0, 1)
									.pop() as MotionChildWithKey,
							);
						});
					}

					if (
						pendingChildren.current.length &&
						idx === exitingChildrenLookup.size - 1
					) {
						setChildrenToRender(children => [
							...children.filter(child => exitingChildrenLookup.has(child.key)),
							...pendingChildren.current.splice(0),
						]);
					}
				});

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

		// If `!exitBeforeEnter` then we add in pending children as child is animated out
		const animateExitWhileEnter =
			(
				child: MotionChildWithKey,
				idx: number,
				_: MotionChildWithKey[],
				exitingChildrenLookup: Map<string, MotionChildWithKey>,
			) =>
			(instance: PolymorphicMotionHandles) => {
				const initialNumberOfPendingChildren = pendingChildren.current.length;

				instance.animateExit().then(() => {
					if (idx === exitingChildrenLookup.size - 1) {
						setChildrenToRender(childrenToRender =>
							childrenToRender.filter(child =>
								exitingChildrenLookup.has(child.key),
							),
						);
					}

					if (
						pendingChildren.current.length &&
						idx === exitingChildrenLookup.size - 1
					) {
						const finalNumberOfPendingChildren = pendingChildren.current.length;
						const hasNextPendingChildBeenAdded =
							finalNumberOfPendingChildren < initialNumberOfPendingChildren;

						setChildrenToRender(children => [
							...children,
							...pendingChildren.current.splice(
								hasNextPendingChildBeenAdded ? 0 : 1,
							),
						]);
					}
				});

				if (pendingChildren.current.length) {
					setNthPlusOneChild(
						child,
						pendingChildren.current.splice(0, 1).pop() as MotionChildWithKey,
					);
				}
			};

		const setNthPlusOneChild = (
			initialChild: MotionChildWithKey,
			currentChild: MotionChildWithKey,
		) =>
			setChildrenToRender(children => {
				const initialChildIdx = children.findIndex(
					child => child.key === initialChild.key,
				);

				if (~initialChildIdx) {
					return children;
				}

				const withCurrentChild = [
					...children.slice(0, initialChildIdx + 1),
					currentChild,
					...children.slice(initialChildIdx + 1),
				];

				return withCurrentChild;
			});

		// In both cases, an exiting element is paired with a pending element
		// and if there are more pending children than there are exiting
		// then they are appended to `childrenToRender`
		const animateExit = exitBeforeEnter
			? animateExitBeforeEnter
			: animateExitWhileEnter;

		setChildrenToRender(childrenToRender => {
			const renderedChildrenLookup = createLookup(childrenToRender);

			const currentChildren = filterMotionElementsWithKeys(children);
			const currentChildrenLookup = createLookup(currentChildren);

			pendingChildren.current = currentChildren.filter(
				child => !renderedChildrenLookup.has(child.key),
			);

			const exitingChildrenDiff = childrenToRender.filter(
				child => !currentChildrenLookup.has(child.key),
			);

			if (!exitingChildrenDiff.length && !pendingChildren.current.length) {
				return applyProps(filterMotionElementsWithKeys(children), {
					initial,
					exitBeforeEnter,
				});
			}

			if (!exitingChildrenDiff.length && pendingChildren.current.length) {
				const updatedChildrenToRender = [
					...childrenToRender,
					...pendingChildren.current,
				];

				pendingChildren.current = [];

				return updatedChildrenToRender;
			}

			const exitingChildrenDiffLookup = createLookup(exitingChildrenDiff);
			exitingChildrenDiff.forEach((child, idx, exitingChildren) => {
				const { initial: childPropsInitial, ...props } = child.props;

				const withExitAnimation = React.cloneElement(child, {
					...props,
					initial: initial === false ? initial : childPropsInitial,
					ref: animateExit(
						child,
						idx,
						exitingChildren,
						exitingChildrenDiffLookup,
					),
				}) as MotionChildWithKey;

				exitingChildrenDiffLookup.set(child.key, withExitAnimation);
			});

			return childrenToRender.map(child =>
				exitingChildrenDiffLookup.has(child.key)
					? (exitingChildrenDiffLookup.get(child.key) as MotionChildWithKey)
					: child,
			);
		});
	}, [children, setChildrenToRender, exitBeforeEnter, initial]);

	return childrenToRender;
};

const createLookup = (
	children: MotionChildWithKey[],
	lookup: Map<string, MotionChildWithKey> = new Map(),
) => (children.forEach(child => lookup.set(child.key, child)), lookup);

const filterMotionElementsWithKeys = (
	children: React.ReactNode | React.ReactNode[],
) => {
	const filtered: MotionChildWithKey[] = [];

	React.Children.forEach(children, child => {
		if (!isMotionElement(child) || !hasKey(child)) {
			return;
		}

		filtered.push(child as MotionChildWithKey);
	});

	return filtered;
};

const applyProps = (children: MotionChildWithKey[], props: PresenceProps) =>
	children.map(child =>
		React.cloneElement(child, {
			...child.props,
			initial: props.initial === false ? props.initial : child.props.initial,
		}),
	) as MotionChildWithKey[];

const hasKey = (child: unknown) => Boolean((child as React.ReactElement)?.key);

const isMotionElement = (child: unknown): child is MotionChild =>
	React.isValidElement(child);

type MotionChild = React.ReactElement<
	Omit<PolymorphicMotionProps<any>, "as">,
	typeof PolymorphicMotion
>;
type MotionChildWithKey = MotionChild & {
	key: string;
};
