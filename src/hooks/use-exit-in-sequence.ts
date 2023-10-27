import React from "react";
import { PolymorphicMotion, type PolymorphicMotionHandles } from "../Motion";

export const useExitInSequence = (children: React.ReactElement[]) => {
  const childrenRefs = React.useRef<PolymorphicMotionHandles[]>([]);

  const childrenWithRefs = React.Children.map(children, (child, idx) => {
    if (child?.type !== PolymorphicMotion) return child;

    return React.cloneElement(child, {
      ref: (instance: PolymorphicMotionHandles | null) => {
        if (!instance) return;

        if (idx === 0) childrenRefs.current = [];

        childrenRefs.current.push(instance);
      },
      ...child.props,
    });
  });

  const triggerSequentialExit = () =>
    childrenRefs.current.reduce(
      (sequence, handle) => sequence.then(handle.animateExit),
      Promise.resolve()
    );

  return {
    children: childrenWithRefs,
    triggerSequentialExit,
  };
};
