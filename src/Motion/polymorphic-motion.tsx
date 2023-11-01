import type { PolymorphicMotionHandles, PolymorphicMotionProps } from "./types";
import React, { useLayoutEffect } from "react";
import { animateChange, animateEvent, animateInitial } from "./utils";

export const PolymorphicMotion = React.forwardRef(
	<T extends keyof React.JSX.IntrinsicElements>(
		{
			as,
			initial,
			animate,
			hover,
			press,
			exit,
			transition,
			inView,
			scroll,
			onMouseUp,
			onMouseDown,
			onMouseLeave,
			onMouseOver,
			onClick,
			onMotionStart,
			onMotionEnd,
			onHoverStart,
			onHoverEnd,
			onPressStart,
			onPressEnd,
			...rest
		}: PolymorphicMotionProps<T>,
		ref: React.ForwardedRef<PolymorphicMotionHandles>,
	) => {
		const componentRef = React.useRef<null | HTMLElement>(null);

		const lastAnimate = React.useRef(animate);
		const isInitialRender = React.useRef(true);
		const pendingAnimation = React.useRef<Promise<unknown>>();

		React.useEffect(() => {
			isInitialRender.current = false;
			lastAnimate.current = animate;
		});

		const setRef = React.useCallback(
			async (instance: HTMLElement | null) => {
				if (!instance) {
					return;
				}

				componentRef.current = instance;

				await pendingAnimation?.current;

				const initialControls = animateInitial({
					isInitialRender: isInitialRender.current,
					initial,
					animate,
					defaultTransition: transition,
					scrollOptions: scroll,
					inViewOptions: inView,
				})(instance);

				const changeControls = animateChange({
					isInitialRender: isInitialRender.current,
					initial: lastAnimate.current,
					final: animate,
				})(instance);

				pendingAnimation.current =
					initialControls?.finished || changeControls?.finished;
			},
			[initial, animate, transition, scroll, inView],
		);

		const createHandles = (): PolymorphicMotionHandles => ({
			animateExit: async () => {
				if (!componentRef.current) {
					return;
				}

				await pendingAnimation?.current;

				const controls = animateEvent({
					initial,
					animate,
					event: exit,
					defaultTransition: transition,
				})(componentRef.current);

				pendingAnimation.current = controls?.finished;

				return controls?.finished;
			},
		});

		React.useImperativeHandle(ref, createHandles);

		const Component = as as React.ElementType;

		return <Component {...rest} ref={setRef} />;
	},
);
