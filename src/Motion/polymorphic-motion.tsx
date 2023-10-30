import type {
	AnimationControls,
	CSSStyleDeclarationWithTransform,
} from "motion";
import type {
	KeyframesDefinition,
	MotionProps,
	PolymorphicMotionHandles,
	PolymorphicMotionProps,
} from "./types";
import React from "react";
import {
	animate as motionAnimate,
	inView as motionInView,
	scroll as motionScroll,
} from "motion";
import { usePreviousValueEffect } from "./use-previous-value-effect";
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
		const pendingAnimation = React.useRef<null | Promise<unknown>>(null);
		const componentRef = React.useRef<null | HTMLElement>(null);
		const isInitialRender = React.useRef(true);

		const setPendingAnimation = React.useCallback(
			(controls: AnimationControls) => {
				pendingAnimation.current = controls.finished.then(() => {
					pendingAnimation.current = null;
				});
			},
			[],
		);

		const emitMotionEvents = React.useCallback(
			(controls: AnimationControls) => {
				onMotionStart?.(controls);
				controls.finished.then(() => onMotionEnd?.(controls));
			},
			[onMotionStart, onMotionEnd],
		);

		const onMouseOverWithAnimation: React.MouseEventHandler<T> =
			React.useCallback(
				async event => {
					onMouseOver?.(event);
					onHoverStart?.(event);

					if (!componentRef.current || !hover) {
						return;
					}

					const { transition: hoverAnimationsTransitions, ...rest } = hover;

					await pendingAnimation.current;
					const hoverAnimationsControls = motionAnimate(
						componentRef.current,
						rest,
						hoverAnimationsTransitions ?? transition,
					);

					emitMotionEvents(hoverAnimationsControls);
					setPendingAnimation(hoverAnimationsControls);
				},
				[
					onMouseOver,
					hover,
					transition,
					emitMotionEvents,
					onHoverStart,
					setPendingAnimation,
				],
			);

		const onClickWithAnimation: React.MouseEventHandler<T> = React.useCallback(
			async event => {
				onClick?.(event);

				if (!componentRef.current || !press) {
					return;
				}

				const { transition: pressAnimationsTransitions, ...rest } = press;

				await pendingAnimation.current;
				const pressAnimationsControls = motionAnimate(
					componentRef.current,
					rest,
					pressAnimationsTransitions ?? transition,
				);

				emitMotionEvents(pressAnimationsControls);
				setPendingAnimation(pressAnimationsControls);
			},
			[onClick, press, transition, emitMotionEvents, setPendingAnimation],
		);

		const combinedOnMouseLeave: React.MouseEventHandler<T> = React.useCallback(
			event => [onMouseLeave, onHoverEnd].forEach(handler => handler?.(event)),
			[onMouseLeave, onHoverEnd],
		);

		const combinedOnMouseDown: React.MouseEventHandler<T> = React.useCallback(
			event => [onMouseDown, onPressStart].forEach(handler => handler?.(event)),
			[onMouseDown, onPressStart],
		);

		const combinedOnMouseUp: React.MouseEventHandler<T> = React.useCallback(
			event => [onMouseUp, onPressEnd].forEach(handler => handler?.(event)),
			[onMouseUp, onPressEnd],
		);

		const createHandles = (): PolymorphicMotionHandles => ({
			animateExit: async () => {
				if (!componentRef.current || !exit) {
					return;
				}

				const { transition: exitTransition, ...rest } = exit;

				await pendingAnimation.current;
				const controls = motionAnimate(
					componentRef.current,
					rest,
					exitTransition ?? transition,
				);

				setPendingAnimation(controls);

				controls.finished;

				await controls.finished;
			},
		});

		React.useImperativeHandle(ref, createHandles, [
			exit,
			transition,
			setPendingAnimation,
		]);

		React.useLayoutEffect(() => {
			if (
				!isInitialRender.current ||
				!componentRef.current ||
				!initial ||
				(initial === true && !animate)
			) {
				return;
			}

			const { transition: initialTransition, ...rest } =
				initial === true ? (animate as KeyframesDefinition) : initial;

			const runAnimation = async () => {
				await pendingAnimation.current;

				const animate = () => {
					if (!componentRef.current) {
						return;
					}

					const controls = motionAnimate(
						componentRef.current as HTMLElement,
						rest,
						initialTransition ?? transition,
					);

					setPendingAnimation(controls);

					return controls;
				};

				if (scroll) {
					const scrollOptions =
						typeof scroll === "boolean" ? undefined : scroll;

					const controls = animate();

					if (!controls) {
						return;
					}

					return void motionScroll(controls, scrollOptions);
				}

				if (inView) {
					const inViewOptions =
						typeof inView === "boolean" ? undefined : inView;

					const controls = animate();

					if (!controls) {
						return;
					}

					return void motionInView(
						componentRef.current as HTMLElement,
						() => controls.stop,
						inViewOptions,
					);
				}

				return void animate();
			};

			runAnimation();
		}, [initial, animate, transition, scroll, inView, setPendingAnimation]);

		const onChangeAnimate = React.useCallback(
			(from?: React.DependencyList, to?: React.DependencyList) => {
				if (isInitialRender.current) {
					return void (isInitialRender.current = false);
				}

				if (
					componentRef.current &&
					from?.every(Boolean) &&
					to?.every(Boolean)
				) {
					const [animateFrom] = from as [KeyframesDefinition];
					const [animateTo] = to as [KeyframesDefinition];

					const { transition: animateFromTransition, ...rest } = animateFrom;
					const animateFromEntries = Object.entries(rest);
					const newEntriesFromFinal = Object.entries(animateTo).filter(
						([k]) =>
							k !== "transition" &&
							animateFromEntries.every(([fromK]) => fromK !== k),
					);

					const merged = [...animateFromEntries, ...newEntriesFromFinal].map(
						([key, initialValue]) => {
							const finalValue =
								animateTo[key as keyof CSSStyleDeclarationWithTransform];

							return [key, [initialValue, finalValue]];
						},
					);

					const runAnimation = async () => {
						await pendingAnimation.current;
						const controls = motionAnimate(
							componentRef.current as HTMLElement,
							Object.fromEntries(merged),
							animateFromTransition ?? transition,
						);

						setPendingAnimation(controls);
					};

					runAnimation();
				}
			},
			[setPendingAnimation, transition],
		);

		usePreviousValueEffect(onChangeAnimate, [animate]);

		const Component = as as React.ElementType;

		return (
			<Component
				{...rest}
				ref={componentRef}
				onMouseOver={onMouseOverWithAnimation}
				onClick={onClickWithAnimation}
				onMouseLeave={combinedOnMouseLeave}
				onMouseDown={combinedOnMouseDown}
				onMouseUp={combinedOnMouseUp}
			/>
		);
	},
);
