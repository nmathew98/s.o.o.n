import React from "react";
import { PolymorphicMotion, type PolymorphicMotionHandles } from "../Motion";

export const useExitBeforeEnter = (
  children: React.ReactElement[],
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exitChildAndDispatch: any
) => {
  const childrenRefs = React.useRef<PolymorphicMotionHandles[]>([]);

  const childrenWithRefs = React.Children.map(children, (child, idx) => {
    if (child?.type !== PolymorphicMotion || !child.key) return child;

    return React.cloneElement(child, {
      ref: (instance: PolymorphicMotionHandles | null) => {
        if (!instance) return;

        if (idx === 0) childrenRefs.current = [];

        childrenRefs.current.push(instance);
      },
      ...child.props,
    });
  });

  const triggerExitBeforeEnter = () =>
    childrenRefs.current.reduce(
      (sequence, handle, idx) =>
        sequence.then(() =>
          // TODO: dispatch a state update action to replace child `i` from previous with child `i` from new
          // We need to first determine if the `key` has changed and if it has trigger
          // `animateExit` and then update the previous `children` array at element `i` with the new child
          //
          // Should return a promise
          exitChildAndDispatch(handle.animateExit, idx)
        ),
      Promise.resolve()
    );

  return {
    children: childrenWithRefs,
    triggerExitBeforeEnter,
  };
};
