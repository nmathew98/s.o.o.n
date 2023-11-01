import type { PolymorphicMotionHandles } from "../Motion/types";
import type { PresenceProps, ReactElementWithKey } from "./types";
import React from "react";
import { isForwardRef } from "react-is";
import { MomentSymbol, bsKey } from "../utils/constants";

export const toArray = (children?: React.ReactNode | React.ReactNode[]) => {
	const result: React.ReactNode[] = [];

	React.Children.forEach(children, child => result.push(child));

	return result;
};

export const applyProps =
	(props: PresenceProps) =>
	<T extends React.ReactElement>(child: T) =>
		React.cloneElement(child, {
			...child.props,
			initial: props.initial === false ? props.initial : child.props.initial,
		});

export const isMotion = (instance: unknown | null) =>
	Boolean((instance as PolymorphicMotionHandles)?.animateExit);

export const isMotionChildWithKey = (
	child: React.ReactNode,
): child is ReactElementWithKey =>
	Boolean(
		React.isValidElement(child) &&
			isForwardRef(child) &&
			child.key &&
			(child.type as any)[bsKey] == MomentSymbol,
	);

export const createChildLookup = <K extends string | number = string>(
	children: ReactElementWithKey[],
	by: (value: ReactElementWithKey, index: number) => K = value =>
		value.key as K,
	lookup: Map<K, ReactElementWithKey> = new Map(),
) =>
	children.reduce(
		(lookup, child, index) => lookup.set(by(child, index), child),
		lookup,
	);

export const animateExit =
	(onExit: () => void, onStart?: () => void) => (instance: unknown | null) => {
		onStart?.();

		(instance as PolymorphicMotionHandles)?.animateExit?.().then(onExit);
	};

export const mergeNextChildrenAndExitingChildren = (
	children: React.ReactNode[],
	exitingChildren: ReactElementWithKey[],
) => {
	const exitingChildrenCopy = [...exitingChildren];

	const currentChildren = [...children].map(child =>
		!child ? exitingChildrenCopy.shift() : child,
	);

	return [...currentChildren, ...exitingChildrenCopy];
};

export const mergePreviousChildrenWithNextChildrenAndExitingChildren = (
	previousChildren: ReactElementWithKey[],
	nextChildrenLookup: Map<string, ReactElementWithKey>,
	exitingChildrenLookup: Map<string, ReactElementWithKey>,
) =>
	previousChildren.map(child => {
		if (nextChildrenLookup.has(child.key)) {
			return nextChildrenLookup.get(child.key);
		}

		if (exitingChildrenLookup.has(child.key)) {
			return exitingChildrenLookup.get(child.key);
		}

		return child;
	});
