import React from "react";
import { isForwardRef } from "react-is";
import type { PresenceProps, ReactElementWithKey } from "./types";
import { PolymorphicMotion, PolymorphicMotionHandles } from "../Motion";

export const toArray = (children?: React.ReactNode | React.ReactNode[]) => {
	const result: React.ReactNode[] = [];

	React.Children.forEach(children, child => result.push(child));

	return result;
};

export const applyProps =
	(props: PresenceProps) => (child: React.ReactElement) =>
		React.cloneElement(child, {
			...child.props,
			initial: props.initial === false ? props.initial : child.props,
		});

export const isMotion = (instance: unknown | null) =>
	Boolean((instance as PolymorphicMotionHandles)?.animateExit);

export const childIsForwardRefWithKey = (
	child: React.ReactNode,
): child is ReactElementWithKey =>
	Boolean(
		React.isValidElement(child) &&
			isForwardRef(child) &&
			child.type === PolymorphicMotion &&
			child.key,
	);

export const createLookup = (
	children: ReactElementWithKey[],
	lookup: Map<string, ReactElementWithKey> = new Map(),
) => (children.forEach(child => lookup.set(child.key, child)), lookup);

export const animateExit =
	(onExit: () => void, isLastExitingChild?: boolean) =>
	(instance: unknown | null) =>
		(instance as PolymorphicMotionHandles)?.animateExit?.().then(() => {
			if (!isLastExitingChild) {
				return;
			}

			onExit();
		});