import {
  type AnimationControls,
  type AnimationOptionsWithOverrides,
  type MotionKeyframesDefinition,
  animate,
} from "motion";
import React from "react";

export type Motion = {
  [K in keyof JSX.IntrinsicElements]: React.FC<JSX.IntrinsicElements[K]>;
};

export const Motion: Motion = new Proxy(Object.create(null), {
  get:
    <T extends keyof JSX.IntrinsicElements>(_: never, as: T) =>
    (props: JSX.IntrinsicElements[T]) =>
      PolymorphicMotion({
        as,
        ...props,
      } as PolymorphicMotionProps<T>),
});

type PolymorphicMotionProps<T extends keyof JSX.IntrinsicElements> = {
  as: T;
  initial?: KeyframesDefinition;
  animate?: KeyframesDefinition;
  hover?: KeyframesDefinition;
  press?: KeyframesDefinition;
  exit?: KeyframesDefinition;
  transition?: AnimationOptionsWithOverrides;
  onMotionStart?: (controls: AnimationControls) => void;
  onMotionEnd?: (controls: AnimationControls) => void;
} & JSX.IntrinsicElements[T];

interface KeyframesDefinition extends MotionKeyframesDefinition {
  transition?: AnimationOptionsWithOverrides;
}

const PolymorphicMotion = <T extends keyof JSX.IntrinsicElements>({
  as,
  initial: initialAnimations,
  animate: alwaysAnimations,
  hover: hoverAnimations,
  press: pressAnimations,
  exit: exitAnimations,
  transition,
  onMouseOver,
  onClick,
  onMotionStart,
  onMotionEnd,
  ...rest
}: PolymorphicMotionProps<T>) => {
  const haveInitialAnimationsTriggered = React.useRef(!initialAnimations);
  const componentRef = React.useRef<null | HTMLElement>(null);

  const emitMotionEvents = React.useCallback(
    (controls: AnimationControls) => {
      onMotionStart?.(controls);
      controls.finished.then(() => onMotionEnd?.(controls));
    },
    [onMotionStart, onMotionEnd]
  );

  const Component = as as string;

  const onMouseOverWithAnimation = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: React.MouseEvent<any>) => {
      onMouseOver?.(event);

      if (!componentRef.current || !hoverAnimations) return;

      const { transition: hoverAnimationsTransitions, ...rest } =
        hoverAnimations;

      const hoverAnimationsControls = animate(
        componentRef.current,
        rest,
        hoverAnimationsTransitions ?? transition
      );

      emitMotionEvents(hoverAnimationsControls);
    },
    [onMouseOver, hoverAnimations, transition, emitMotionEvents]
  );

  const onClickWithAnimation = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: React.MouseEvent<any>) => {
      onClick?.(event);

      if (!componentRef.current || !pressAnimations) return;

      const { transition: pressAnimationsTransitions, ...rest } =
        pressAnimations;

      const pressAnimationsControls = animate(
        componentRef.current,
        rest,
        pressAnimationsTransitions ?? transition
      );

      emitMotionEvents(pressAnimationsControls);
    },
    [onClick, pressAnimations, transition, emitMotionEvents]
  );

  React.useEffect(() => {
    if (
      !componentRef.current ||
      !alwaysAnimations ||
      !haveInitialAnimationsTriggered.current
    )
      return;

    const { transition: alwaysAnimationsTransitions, ...rest } =
      alwaysAnimations;

    const element = componentRef.current;

    const alwaysAnimationsControls = animate(
      element,
      rest,
      alwaysAnimationsTransitions ?? transition
    );

    emitMotionEvents(alwaysAnimationsControls);

    return () => {
      alwaysAnimationsControls.stop();

      if (!element || !exitAnimations || initialAnimations) return;

      const { transition: exitAnimationsTransitions, ...rest } = exitAnimations;

      const exitAnimationsControls = animate(
        element,
        rest,
        exitAnimationsTransitions ?? transition
      );

      emitMotionEvents(exitAnimationsControls);
    };
  });

  React.useEffect(() => {
    if (
      !componentRef.current ||
      !initialAnimations ||
      haveInitialAnimationsTriggered.current
    )
      return;

    const { transition: initialAnimationsTransitions, ...rest } =
      initialAnimations;

    const element = componentRef.current;

    const initialAnimationsControls = animate(
      element,
      rest,
      initialAnimationsTransitions ?? transition
    );

    haveInitialAnimationsTriggered.current = true;

    emitMotionEvents(initialAnimationsControls);

    return () => {
      initialAnimationsControls.stop();

      if (!element || !exitAnimations) return;

      const { transition: exitAnimationsTransitions, ...rest } = exitAnimations;

      const exitAnimationsControls = animate(
        element,
        rest,
        exitAnimationsTransitions ?? transition
      );

      emitMotionEvents(exitAnimationsControls);
    };
  }, [initialAnimations, transition, exitAnimations, emitMotionEvents]);

  return (
    <Component
      {...rest}
      ref={componentRef}
      onMouseOver={onMouseOverWithAnimation}
      onClick={onClickWithAnimation}
    />
  );
};
