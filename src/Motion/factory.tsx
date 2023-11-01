import type {
	MotionProps,
	PolymorphicMotionHandles,
	PolymorphicMotionProps,
} from "./types";
import React from "react";
import { PolymorphicMotion } from "./polymorphic-motion";
import { MomentSymbol, bsKey } from "../utils/constants";

const memo = new Map();

export const PolymorphicMotionFactory = <
	T extends keyof React.JSX.IntrinsicElements,
>({
	as,
}: MotionProps<T>) => {
	if (memo.has(as)) {
		return memo.get(as);
	}

	const result = React.forwardRef(
		(
			props: Omit<PolymorphicMotionProps<T>, "as">,
			ref: React.ForwardedRef<PolymorphicMotionHandles>,
		) => <PolymorphicMotion as={as} {...props} ref={ref} />,
	);

	(result as any)[bsKey] = MomentSymbol;

	memo.set(as, result);

	return result;
};
