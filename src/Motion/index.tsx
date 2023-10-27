import {
  type AnimationControls,
  type AnimationOptionsWithOverrides,
  type CSSStyleDeclarationWithTransform,
  animate as motionAnimate,
  ValueKeyframe,
} from "motion";
import React from "react";
import { usePreviousValueEffect } from "../hooks/use-previous-value-effect";

export type Motion = {
  [K in keyof React.ElementType]: React.FC<React.ElementType[K]>;
};

export const Motion: Motion = new Proxy(Object.create(null), {
  get:
    <T extends keyof React.ElementType>(_: never, as: T) =>
    (props: React.DetailedHTMLProps<React.HTMLAttributes<T>, T>) =>
      PolymorphicMotion({
        as,
        ...props,
      } as PolymorphicMotionProps<T>),
});

type PolymorphicMotionProps<T extends keyof React.ElementType> = {
  as: T;
  ref?: React.Ref<PolyorphicMotionHandles>;
  initial?: KeyframesDefinition;
  animate?: KeyframesDefinition;
  hover?: KeyframesDefinition;
  press?: KeyframesDefinition;
  exit?: KeyframesDefinition;
  transition?: AnimationOptionsWithOverrides;
  onMotionStart?: (controls: AnimationControls) => void;
  onMotionEnd?: (controls: AnimationControls) => void;
  onHoverStart?: React.MouseEventHandler<T>;
  onHoverEnd?: React.MouseEventHandler<T>;
  onPressStart?: React.MouseEventHandler<T>;
  onPressEnd?: React.MouseEventHandler<T>;
} & React.DetailedHTMLProps<React.HTMLAttributes<T>, T>;

type KeyframesDefinition = {
  [K in keyof CSSStyleDeclarationWithTransform]?: ValueKeyframe;
} & { transition?: AnimationOptionsWithOverrides };

export interface PolyorphicMotionHandles {
  animateExit: () => Promise<void>;
}

const PolymorphicMotion = React.forwardRef(
  <T extends keyof React.ElementType>(
    {
      as,
      initial,
      animate,
      hover,
      press,
      exit,
      transition,
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
    ref: React.ForwardedRef<PolyorphicMotionHandles>
  ) => {
    const componentRef = React.useRef<null | HTMLElement>(null);

    const emitMotionEvents = React.useCallback(
      (controls: AnimationControls) => {
        onMotionStart?.(controls);
        controls.finished.then(() => onMotionEnd?.(controls));
      },
      [onMotionStart, onMotionEnd]
    );

    const onMouseOverWithAnimation: React.MouseEventHandler<T> =
      React.useCallback(
        (event) => {
          onMouseOver?.(event);
          onHoverStart?.(event);

          if (!componentRef.current || !hover) return;

          const { transition: hoverAnimationsTransitions, ...rest } = hover;

          const hoverAnimationsControls = motionAnimate(
            componentRef.current,
            rest,
            hoverAnimationsTransitions ?? transition
          );

          emitMotionEvents(hoverAnimationsControls);
        },
        [onMouseOver, hover, transition, emitMotionEvents, onHoverStart]
      );

    const onClickWithAnimation: React.MouseEventHandler<T> = React.useCallback(
      (event) => {
        onClick?.(event);

        if (!componentRef.current || !press) return;

        const { transition: pressAnimationsTransitions, ...rest } = press;

        const pressAnimationsControls = motionAnimate(
          componentRef.current,
          rest,
          pressAnimationsTransitions ?? transition
        );

        emitMotionEvents(pressAnimationsControls);
      },
      [onClick, press, transition, emitMotionEvents]
    );

    const combinedOnMouseLeave: React.MouseEventHandler<T> = React.useCallback(
      (event) =>
        [onMouseLeave, onHoverEnd].forEach((handler) => handler?.(event)),
      [onMouseLeave, onHoverEnd]
    );

    const combinedOnMouseDown: React.MouseEventHandler<T> = React.useCallback(
      (event) =>
        [onMouseDown, onPressStart].forEach((handler) => handler?.(event)),
      [onMouseDown, onPressStart]
    );

    const combinedOnMouseUp: React.MouseEventHandler<T> = React.useCallback(
      (event) => [onMouseUp, onPressEnd].forEach((handler) => handler?.(event)),
      [onMouseUp, onPressEnd]
    );

    const createHandles = (): PolyorphicMotionHandles => ({
      animateExit: async () => {
        if (!componentRef.current || !exit) return;

        const { transition: exitTransition, ...rest } = exit;

        const controls = motionAnimate(
          componentRef.current,
          rest,
          exitTransition ?? transition
        );

        await controls.finished;
      },
    });

    React.useImperativeHandle(ref, createHandles, [exit, transition]);

    usePreviousValueEffect(
      (from, to) => {
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
              k !== "transition" ||
              animateFromEntries.some(([fromK]) => fromK !== k)
          );

          const merged = [...animateFromEntries, ...newEntriesFromFinal].map(
            ([key, initialValue]) => {
              const finalValue =
                animateTo[key as keyof CSSStyleDeclarationWithTransform];

              return [key, [initialValue, finalValue]];
            }
          );

          motionAnimate(
            componentRef.current,
            Object.fromEntries(merged),
            animateFromTransition ?? transition
          );
        }
      },
      [animate]
    );

    React.useEffect(() => {
      if (!componentRef.current || !initial) return;

      const { transition: initialTransition, ...rest } = initial;

      motionAnimate(
        componentRef.current,
        rest,
        initialTransition ?? transition
      );
    }, [initial, transition]);

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
  }
);
