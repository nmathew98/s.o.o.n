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
  [K in keyof JSX.IntrinsicElements]: React.FC<JSX.IntrinsicElements[K]>;
};

export const Motion: Motion = new Proxy(Object.create(null), {
  get:
    <T extends keyof React.JSX.IntrinsicElements>(_: never, as: T) =>
    (props: React.DetailedHTMLProps<React.HTMLAttributes<T>, T>) =>
      PolymorphicMotion({
        as,
        ...props,
      } as PolymorphicMotionProps<T>),
});

type PolymorphicMotionProps<T extends keyof React.JSX.IntrinsicElements> = {
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
  <T extends keyof JSX.IntrinsicElements>(
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

          const merged = animateFromEntries.map(([key, initialValue]) => {
            const finalValue =
              animateTo[key as keyof CSSStyleDeclarationWithTransform];

            return [key, [initialValue, finalValue]];
          });

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

    const Component = as as string;

    return <Component ref={componentRef} {...rest} />;
  }
);
