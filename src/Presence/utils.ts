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
		}) as T;

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

export const createLookup = (
	children: ReactElementWithKey[],
	lookup: Map<string, ReactElementWithKey> = new Map(),
) => (children.forEach(child => lookup.set(child.key, child)), lookup);

export const animateExit =
	(onExit: () => void, onStart?: () => void) => (instance: unknown | null) => {
		onStart?.();

		(instance as PolymorphicMotionHandles)?.animateExit?.().then(onExit);
	};
