import type { PolymorphicMotionHandles, PolymorphicMotionProps } from "./types";
import React from "react";
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

		const onMouseOverAnimation = React.useCallback(async () => {
			await pendingAnimation?.current;

			const controls = animateEvent({
				initial,
				animate,
				event: hover,
				defaultTransition: transition,
			})(componentRef.current);

			pendingAnimation.current = controls?.finished;

			return controls?.finished;
		}, [initial, animate, hover, transition]);

		const onMouseLeaveAnimation = React.useCallback(async () => {
			await pendingAnimation?.current;

			const controls = animateEvent({
				initial,
				animate,
				event: hover,
				defaultTransition: transition,
				reverse: true,
			})(componentRef.current);

			pendingAnimation.current = controls?.finished;

			return controls?.finished;
		}, [initial, animate, hover, transition]);

		const onMouseDownAnimation = React.useCallback(async () => {
			await pendingAnimation?.current;

			const controls = animateEvent({
				initial,
				animate,
				event: press,
				defaultTransition: transition,
			})(componentRef.current);

			pendingAnimation.current = controls?.finished;

			return controls?.finished;
		}, [initial, animate, press, transition]);

		const onMouseUpAnimation = React.useCallback(async () => {
			await pendingAnimation?.current;

			const controls = animateEvent({
				initial,
				animate,
				event: press,
				defaultTransition: transition,
				reverse: true,
			})(componentRef.current);

			pendingAnimation.current = controls?.finished;

			return controls?.finished;
		}, [initial, animate, press, transition]);

		// eslint-disable-next-line react-hooks/exhaustive-deps
		const combinedOnMouseOver = React.useCallback(
			invoke(onMouseOver, onMouseOverAnimation),
			[onMouseOver, onMouseOverAnimation],
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
		const combinedOnMouseLeave = React.useCallback(
			invoke(onMouseLeave, onMouseLeaveAnimation),
			[onMouseLeave, onMouseLeaveAnimation],
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
		const combinedOnMouseDown = React.useCallback(
			invoke(onMouseDown, onMouseDownAnimation),
			[onMouseDown, onMouseDownAnimation],
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
		const combinedOnMouseUp = React.useCallback(
			invoke(onMouseUp, onMouseUpAnimation),
			[onMouseUp, onMouseUpAnimation],
		);

		React.useImperativeHandle(ref, createHandles);

		const Component = as as React.ElementType;

		return (
			<Component
				{...rest}
				ref={setRef}
				onMouseOver={combinedOnMouseOver}
				onMouseLeave={combinedOnMouseLeave}
				onMouseDown={combinedOnMouseDown}
				onMouseUp={combinedOnMouseUp}
			/>
		);
	},
);

const invoke =
	(...handlers: (((...args: any[]) => any) | undefined)[]) =>
	(...args: any[]) =>
		handlers.forEach(handler => handler?.(...args));
